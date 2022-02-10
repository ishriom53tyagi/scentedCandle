const { responseData } = require('../utils/responseHandler');
const getDb = require('../utils/database').getDb;
const cfg = require('../config.json')
const common = require('../utils/common')

module.exports.chartsApi = async function (req, res) {
    try {

        let code = req.params.code;
        let application = req.body.app;
        let range = req.body.range.timestamp;

        const db = getDb();

        var boundaries = common.generateTimeSeriesBoundaries(range);

        var pipeline = fetchPipeline(code, range, boundaries);

        var collection = common.getAppDataCollectionName(application, range.end);

        var data = await db.collection(collection).aggregate(pipeline, { allowDiskUse: true }).toArray();

        var response = chartResponse(req, code, data, boundaries);

        return responseData(res, true, 200, "success", response);
    } catch (error) {

        return responseData(res, false, 500);
    }
}

function chartResponse(req, code, data, boundaries) {

    if (code == 'app-traffic-counts')
        return appTrafficCountsResponse(req, data, boundaries)
    else if (code == 'error-codes-counts')
        return errorCodesCountsResponse(req, data, boundaries)
    else if (code == 'partner-wise-counts')
        return partnerWiseCountsResponse(req, data, boundaries)

}

function fetchPipeline(code, range, boundaries) {

    var pipeline = [];

    switch (code) {

        case 'app-traffic-counts':
            pipeline = [{
                $match: { created_on: { $gte: new Date(range.start), $lte: new Date(range.end) } }
            }, {
                $bucket: {
                    groupBy: "$created_on",
                    boundaries: boundaries,
                    default: "others",
                    output: { "count": { $sum: 1 } }
                }
            }];
            break;

        case 'error-codes-counts':
            pipeline = [{
                $match: {
                    created_on: { $gte: new Date(range.start), $lte: new Date(range.end) },
                    status_code: { $gte: 300, $lte: 599 }
                }
            },
            {
                $bucket: {
                    groupBy: "$created_on",
                    boundaries: boundaries,
                    default: "Others",
                    output: {
                        "count": { $sum: 1 },
                        status_code: {
                            $push: "$status_code"
                        }
                    }
                }
            },
            { $unwind: "$status_code" },
            { $group: { '_id': { created_date: "$_id", status_code: { $concat: [{ $substr: [{ $toString: "$status_code" }, 0, 1] }, "XX"] } }, count: { '$sum': '$count' } } },
            {
                '$project': {
                    '_id': 1,
                    'count': 1
                }
            }];
            break;
        case 'partner-wise-counts':
            pipeline = [{
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
                        "count": { $sum: 1 },
                        client_id: {
                            $push: "$client_id"
                        }
                    }
                }
            },
            { $unwind: "$client_id" },
            { $group: { '_id': { created_date: "$_id", client_id: "$client_id" }, count: { '$sum': 1 } } },
            {
                '$project': {
                    '_id': 1,
                    'count': 1
                }
            }];

            //{ $ifNull: ["$client_id", "Unknown"] }
            break;

        default:
            break;
    }

    return pipeline;

}

function appTrafficCountsResponse(req, data, boundaries) {

    var result = {
        series: [],
        boundaries: timezoneWiseBoundaries(req, boundaries)
    };

    var obj = {
        name: "API Counts",
        data: []
    };

    if (data.length > 0) {

        boundaries.forEach(b => {
            var f = false;
            data.forEach(e => {
                if (b.getTime() == e._id.getTime()) {
                    obj.data.push(e.count)
                    f = true;
                }
            })

            if (!f)
                obj.data.push(0)
        });
    }

    result.series.push(obj);

    return result;
}

function errorCodesCountsResponse(req, data, boundaries) {

    var result = {
        series: [],
        boundaries: timezoneWiseBoundaries(req, boundaries)
    };

    var obj_3XX = {
        name: "3XX",
        data: [],
        color: "#E30B5C"
    };

    var obj_4XX = {
        name: "4XX",
        data: [],
        color: "#FA8072"
    };

    var obj_5XX = {
        name: "5XX",
        data: [],
        color: "#FF0000"
    };

    if (data.length > 0) {

        boundaries.forEach(b => {
            var flag_3XX = false;
            var flag_4XX = false;
            var flag_5XX = false;

            data.forEach(e => {
                if (b.getTime() == e._id.created_date.getTime()) {
                    if (e._id.status_code == "3XX") {
                        obj_3XX.data.push(e.count)
                        flag_3XX = true;
                    }
                    if (e._id.status_code == "4XX") {
                        obj_4XX.data.push(e.count)
                        flag_4XX = true;
                    }
                    if (e._id.status_code == "5XX") {
                        obj_5XX.data.push(e.count)
                        flag_5XX = true;
                    }
                }
            })

            if (!flag_3XX)
                obj_3XX.data.push(0)
            if (!flag_4XX)
                obj_4XX.data.push(0)
            if (!flag_5XX)
                obj_5XX.data.push(0)
        });
    }

    result.series.push(obj_3XX, obj_4XX, obj_5XX);

    return result;
}

function partnerWiseCountsResponse(applications, data) {
    // let d = new Set();
    // var clients = data.filter(app => {
    //     if (app._id.client_id != null) {
    //         var k = app._id.client_id;
    //         return d.has(k) ? false : d.add(k);
    //     }
    // })

    var clients = {};

    data.forEach(d => {

    })



    // console.log("---cleints---", clients);

    /* var result = {
        series: [],
        labels: []
    } */

    /* data.forEach(d => {
        applications.forEach(a => {

            if (a._id == d.app_id) {
                result.series.push(d.success_rate)
                result.labels.push(a.name)
            }

        })

    }) */

    return clients;
}



// common functions for charts

function timezoneWiseBoundaries(req, boundaries) {

    var convertedBoundaries = [];

    boundaries.forEach(datetime => {
        convertedBoundaries.push(common.momentTimeZone(req, datetime, 'no_format', false));
    });

    return convertedBoundaries;
}
