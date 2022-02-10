
const { responseData } = require('../utils/responseHandler');
const getDb = require('../utils/database').getDb;
const cfg = require('../config.json')
const common = require('../utils/common')


module.exports.chartsTableData = async function (req, res) {
    try {

        let code = req.params.code;
        let application = req.body.app;
        let range = req.body.range.timestamp;

        const db = getDb();

        var pipeline = fetchPipeline(code, range);

        var collection = common.getAppDataCollectionName(application, range.end);

        var data = await db.collection(collection).aggregate(pipeline, { allowDiskUse: true }).toArray();

        var response = tableDataResponse(req, data);

        return responseData(res, true, 200, "success", response);
    } catch (error) {
        console.log("---error----", error);
        return responseData(res, false, 500);
    }
}


function tableDataResponse(req, data) {

    var result = {
        total_count: data.length,
        records: data
    };

    return result;
}


function fetchPipeline(code, range, boundaries) {

    var pipeline = [];

    switch (code) {

        case 'api-wise-percentile':

            pipeline = [
                {
                    $match: { created_on: { $gte: new Date(range.start), $lte: new Date(range.end) } }
                },
                {
                    '$group': {
                        '_id': {
                            'api': '$api',
                            'method': '$method'
                        },
                        'count': {
                            '$sum': 1
                        },
                        'value': { '$push': '$response_time' }
                    }
                },
                { '$unwind': '$value' },
                { '$sort': { 'value': 1 } },
                { '$group': { '_id': '$_id', 'value': { '$push': '$value' }, 'count': { '$avg': '$count' } } },
                {
                    '$project': {
                        '_id': 1,
                        'count': 1,
                        '99th_percentile': { '$arrayElemAt': ['$value', { '$floor': { '$multiply': [0.99, { '$size': '$value' }] } }] },
                        '90th_percentile': { '$arrayElemAt': ['$value', { '$floor': { '$multiply': [0.90, { '$size': '$value' }] } }] },
                        '75th_percentile': { '$arrayElemAt': ['$value', { '$floor': { '$multiply': [0.75, { '$size': '$value' }] } }] },
                        '50th_percentile': { '$arrayElemAt': ['$value', { '$floor': { '$multiply': [0.50, { '$size': '$value' }] } }] }
                    }
                },
                { '$sort': { 'count': -1 } }
            ]

            break;

        default:
            break;
    }

    return pipeline;

}