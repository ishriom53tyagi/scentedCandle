const { responseData } = require('../utils/responseHandler');
const getDb = require('../utils/database').getDb;
const ObjectId = require('mongodb').ObjectId;
const common = require('../utils/common')
module.exports.getApis = async (req, res) => {
    try {
        let searchArray = []
        let { body } = req
        console.log(body);
        body.apps.forEach(element => searchArray.push(ObjectId(element)));
        console.log("Search Array : ", searchArray);
        const db = getDb();
        let collecName = common.collectionNameGenerator(req.headers, 'api_managements')

        db.collection(collecName)
            .aggregate([
                {
                    $match: {
                        'app_id': {
                            $in: searchArray
                        }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        api_url: 1,
                        app_code: 1,
                        code: 1
                    }
                },
                {
                    $sort: {
                        app_code: 1
                    }
                }
            ])
            .toArray()
            .then(async (apis) => {
                // console.log("apis : ", apis)
                let collecName1 = common.collectionNameGenerator(req.headers, 'api_partner_access')

                db.collection(collecName1)
                    .find({ client_id: ObjectId(req.body.client_id) })
                    .toArray()
                    .then(async clientDataP => {
                        console.log("clientData result : ", clientDataP)
                        let apiResponse = await appCodeWiseSeperator(apis, clientDataP)
                        //  console.log(apiResponse)


                        return responseData(res, true, 200, "success", apiResponse);

                        // else {
                        //     console.log(false)
                        //     return responseData(res, false, 204, "failure");
                        // }
                    })
            })
    } catch (error) {
        console.log("error : ", error);
        return responseData(res, false, 500);
    }
}

function appCodeWiseSeperator(apis, clientDataP) {
    return new Promise((resolve, reject) => {
        let sortedData = {}
        let sortedArray = []
        let pathAccessData = {}
        let clientData = {}
        if (clientDataP.length > 0) {
            if (clientDataP[0].hasOwnProperty("app") && (Object.keys(clientDataP[0].app)).length > 0) {

                for (let key in clientDataP[0].app) {

                    if (clientDataP[0].app[key].hasOwnProperty("api")) {
                        let element = clientDataP[0].app[key].api;

                        if ((Object.keys(element)).length > 0) {
                            for (let key in element) {
                                clientData[key] = element[key];
                            }
                        }
                    }

                }

            }
            if ((Object.keys(clientData)).length > 0) {
                let clientArray = Object.keys(clientData)
                clientArray.forEach(element => {
                    apis.forEach(apiElement => {
                        if (element == apiElement._id) {
                            sortedArray.push({
                                _id: element,
                                code: apiElement.code,
                                api_url: apiElement.api_url,
                                app_code: apiElement.app_code,
                                isSelected: clientData[element].status,
                                metricType: clientData[element].metric_type,
                                metricRate: clientData[element].metric_rate,
                                metricThreshold: clientData[element].metric_threshold
                            })
                        }
                    })
                })
                apis.forEach(apiElement => {
                    if (!clientArray.includes(String(apiElement._id))) {
                        sortedArray.push({
                            _id: apiElement._id,
                            code: apiElement.code,
                            api_url: apiElement.api_url,
                            app_code: apiElement.app_code,
                            isSelected: 0,
                            metricType: 0,
                            metricRate: null,
                            metric_threshold: null
                        })
                    }
                })

            }
            else {
                apis.forEach(apiElement => {
                    sortedArray.push({
                        _id: apiElement._id,
                        code: apiElement.code,
                        api_url: apiElement.api_url,
                        app_code: apiElement.app_code,
                        isSelected: 0,
                        metricType: null,
                        metricRate: null,
                        metric_threshold: null
                    })
                })
            }
        }
        else {
            apis.forEach(apiElement => {
                sortedArray.push({
                    _id: apiElement._id,
                    code: apiElement.code,
                    api_url: apiElement.api_url,
                    app_code: apiElement.app_code,
                    isSelected: 0,
                    metricType: null,
                    metricRate: null,
                    metric_threshold: null
                })
            })
        }

        if (clientDataP[0].hasOwnProperty("app")) {
            pathAccessData = clientDataP[0].app

        }
        // console.log("sortedArray 2 : ", sortedArray)
        sortedArray.forEach(element => {
            if (sortedData[element.app_code]) {
                sortedData[element.app_code].push(element)
            }
            else {
                sortedData[element.app_code] = []
                sortedData[element.app_code].push(element)
            }
        })
        let resp = {}
        resp.appData = sortedData
        resp.pathData = pathAccessData
        // console.log("sortedData : ", sortedData)
        resolve(resp)
    })
}