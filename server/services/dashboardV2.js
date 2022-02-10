const { responseData } = require('../utils/responseHandler');
const cfg = require('../config.json');
const { ObjectID } = require('mongodb').ObjectId;
const common = require('../utils/common');
const analyticsService = require('./analyticsV2');

module.exports.getDashboardTableData = async function (req, res) {
    try {
        const arr = []
        var db = req.app.db;
        let range = req.body.range.timestamp;

        let applications = await getApplications(db, req.headers)

        if (!applications && applications.length)
            return responseData(res, true, 200, "no applications found")

        var applicationData = [];
        applications.forEach(element => {
            var o = { ...element };
            o['99th_percentile'] = 0;
            o['90th_percentile'] = 0
            o['75th_percentile'] = 0
            o['50th_percentile'] = 0;
            o.total_count = 0
            applicationData.push(o);
        })

        applicationData.forEach(app => {
            arr.push(getApplicationStats(db, app, range))
        });

        Promise.all(arr)
            .then(result => {
                result = result.filter(app => { if (app.total_count != 0) { return app } })
                var response = tableDataResponse(req, result);
                return responseData(res, true, 200, "success", response)
            })
    }
    catch (error) {
        console.log("error : ", error);
        return responseData(res, false, 500);
    }
}

module.exports.getDashboardChartData = async function (req, res) {
    try {
        const arr = []
        var db = req.app.db;
        let range = req.body.range.timestamp;

        let applications = await getApplications(db, req.headers)

        if (!applications && applications.length)
            return responseData(res, true, 200, "no applications found")

        let boundaries = common.generateTimeSeriesBoundaries(range);

        var applicationData = [];
        applications.forEach(element => {
            var o = { ...element };
            o.data = []
            applicationData.push(o);
        })

        applicationData.forEach(app => {
            arr.push(getApplicationChartData(db, app, range, boundaries))
        });

        Promise.all(arr)
            .then(result => {
                result = result.filter(app => { if (app.data.length != 0) { return app } })
                var response = chartDataResponse(req, result, boundaries);
                return responseData(res, true, 200, "success", response)
            })
    }
    catch (error) {
        console.log("error : ", error);
        return responseData(res, false, 500);
    }
}

module.exports.getDashboardSuccessRateData = async function (req, res) {
    try {
        const arr = []
        var db = req.app.db;
        let range = req.body.range.timestamp;

        let applications = await getApplications(db, req.headers)

        if (!applications && applications.length)
            return responseData(res, true, 200, "no applications found")

        var applicationData = [];
        applications.forEach(element => {
            var o = { ...element };
            o.data = []
            applicationData.push(o);
        })

        applicationData.forEach(app => {
            var r = {
                body: {},
                noResponse: false
            };
            r.body.app = app._id;
            r.body.range = req.body.range;

            arr.push(analyticsService.countAndSuccessRate(r))
        });

        Promise.all(arr)
            .then(result => {
                var response = dashboardSuccessRateResponse(applications, result);
                return responseData(res, true, 200, "success", response)
            })
    }
    catch (error) {
        console.log("error : ", error);
        return responseData(res, false, 500);
    }
}

async function getApplicationChartData(db, application, range, boundaries) {

    var chartData = { ...application };
    var collection = common.getAppDataCollectionName(application, range.end);
    var pipeline = [
        {
            $match: {
                created_on: { $gte: new Date(range.start), $lte: new Date(range.end) }
            }
        },
        {
            $bucket: {
                groupBy: "$created_on",
                boundaries: boundaries,
                default: "Others",
                output: {
                    "count": { $sum: 1 }
                }
            }
        }
    ];

    var result = await db.collection(collection).aggregate(pipeline, { "allowDiskUse": true }).toArray();

    if (result.length > 0) {

        boundaries.forEach(b => {
            var f = false;
            result.forEach(e => {
                if (b.getTime() == e._id.getTime()) {
                    chartData.data.push(e.count)
                    f = true;
                }
            })

            if (!f)
                chartData.data.push(0)
        });
    }

    return chartData;
}

function dashboardSuccessRateResponse(applications, data) {

    data = data.filter(app => { if (app.total_count != 0) { return app } })

    var result = {
        series: [],
        labels: []
    }

    data.forEach(d => {
        applications.forEach(a => {

            if (a._id == d.app_id) {
                result.series.push(d.success_rate)
                result.labels.push(a.name)
            }

        })

    })

    return result;
}

function chartDataResponse(req, data, boundaries) {

    var result = {
        series: data,
        boundaries: timezoneWiseBoundaries(req, boundaries)
    }

    return result
}


function tableDataResponse(req, data) {

    var result = {
        total_count: data.length,
        records: data
    };

    return result;
}


async function getApplicationStats(db, app, range) {

    var collection = common.getAppDataCollectionName(app._id, range.end);

    var application = { ...app };

    var pipeline = [
        {
            $match: { created_on: { $gte: new Date(range.start), $lte: new Date(range.end) } }
        },
        { '$sort': { 'response_time': 1 } },
        {
            "$group": {
                '_id': null,
                'count': {
                    '$sum': 1
                },
                'value': { '$push': '$response_time' }
            }
        },
        {
            '$project': {
                'count': 1,
                '99th_percentile': { '$arrayElemAt': ['$value', { '$floor': { '$multiply': [0.99, { '$size': '$value' }] } }] },
                '90th_percentile': { '$arrayElemAt': ['$value', { '$floor': { '$multiply': [0.90, { '$size': '$value' }] } }] },
                '75th_percentile': { '$arrayElemAt': ['$value', { '$floor': { '$multiply': [0.75, { '$size': '$value' }] } }] },
                '50th_percentile': { '$arrayElemAt': ['$value', { '$floor': { '$multiply': [0.50, { '$size': '$value' }] } }] }
            }
        }]

    var result = await db.collection(collection).aggregate(pipeline, { "allowDiskUse": true }).toArray();

    if (result.length > 0) {
        application.total_count = result[0].count;
        application['99th_percentile'] = result[0]['99th_percentile'];
        application['90th_percentile'] = result[0]['90th_percentile']
        application['75th_percentile'] = result[0]['75th_percentile']
        application['50th_percentile'] = result[0]['50th_percentile']
    }

    delete application.collection_name;

    return application;
}

async function getApplications(db, header) {
    return new Promise((resolve, reject) => {

        let collecName = common.collectionNameGenerator(header, 'applications')
        db.collection(collecName)
            .find({ status: 1 })
            .project({ _id: 1, code: 1, name: 1 })
            .toArray()
            .then(applications => {
                resolve(applications)
            })
    })
}


function timezoneWiseBoundaries(req, boundaries) {

    var convertedBoundaries = [];

    boundaries.forEach(datetime => {
        convertedBoundaries.push(common.momentTimeZone(req, datetime, 'no_format', false));
    });

    return convertedBoundaries;
}