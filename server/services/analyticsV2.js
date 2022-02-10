const { responseData } = require('../utils/responseHandler');
const getDb = require('../utils/database').getDb;
const cfg = require('../config.json')
const common = require('../utils/common')


module.exports.countAndSuccessRate = async function (req, res) {
    try {

        let application = req.body.app;
        let range = req.body.range.timestamp;
        let successPercent = 0;
        let response = { total_count: 0, success_rate: 0 }

        const db = getDb();
        var collection = common.getAppDataCollectionName(application, range.end);

        let totalTraffic = await db.collection(collection)
            .find({ created_on: { $gte: new Date(range.start), $lte: new Date(range.end) } })
            .count();

        if (totalTraffic && totalTraffic > 0) {

            var pipeline = fetchPipeline(range, totalTraffic);

            var result = await db.collection(collection).aggregate(pipeline).toArray();
            successPercent = result[0] ? result[0].percentage.toFixed(2) : 0;
        }

        response.app_id = application;
        response.total_count = totalTraffic;
        response.success_rate = successPercent;

        if (req.noResponse === false)
            return response;

        return responseData(res, true, 200, "success", response)

    } catch (error) {
        console.log("----err----", error);
        return responseData(res, false, 500, error)
    }
}


function fetchPipeline(range, totalRecords) {

    return [
        {
            $match: { created_on: { $gte: new Date(range.start), $lte: new Date(range.end) } }
        },
        { "$group": { "_id": "$status_code", "count": { "$sum": 1 } } },
        {
            "$project": {
                "_id": 1,
                "count": 1,
                "percentage": { "$multiply": [{ "$divide": [100, totalRecords] }, "$count"] }
            }
        },
        {
            $match: { "_id": { "$eq": 200 } }
        }
    ]

}