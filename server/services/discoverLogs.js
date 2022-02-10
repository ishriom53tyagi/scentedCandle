const { responseData } = require('../utils/responseHandler');
const { appdata_initials, backend_url, csv_file_path, csv_downoad_url } = require('../config');
const common = require('../utils/common');
const getDb = require('../utils/database').getDb;
var path = require('path');
const fastcsv = require("fast-csv");
var fileSystem = require("fs");
const ObjectId = require('mongodb').ObjectId;
const config = require('../config');
const systemLog = require('./systemLog');
const ipAddress = require('../utils/common');
module.exports.getApiDiscoverLogss = async function (req, res) {
    let discoverLogsObj = await getDiscoverLogsData(req);
    if (discoverLogsObj != 500) {
        return responseData(res, true, 200, "success", discoverLogsObj);
    }
    return responseData(res, false, 500);
}

function getKeyValue(array) {
    let json = []
    array.forEach(i => {
        let params = i.split("=")
        json.push({ key: params[0], value: params[1] })
    })
    return json;
}

module.exports.getApiDiscoverLogssView = async function (req, res) {
    try {
        const db = getDb();
        var viewObj = {};
        var apiViewDiscoverLogsData = req.body;
        let discoverLogsId = apiViewDiscoverLogsData.discoverLogsId

        let appCollection = appdata_initials + "_applogs_" + apiViewDiscoverLogsData.app_id + "_" + apiViewDiscoverLogsData.monthYear

        var appResult = await db.collection(appCollection)
            .find({ _id: ObjectId(discoverLogsId) })
            .project({ 'message': 1, })
            .toArray()
        if (appResult.length) {
            viewObj.message = appResult[0].message;
        }



        if (apiViewDiscoverLogsData && apiViewDiscoverLogsData.type == 'expand') {

            let respData = [];
            if (viewObj.message)
                respData.push({ 'key': 'message', 'value': viewObj.message })
            return responseData(res, true, 200, "success", respData);

        }


    }
    catch (err) {
        console.log(err);
        return responseData(res, false, 500);
    }
}




module.exports.filterKeys = async function (req, res) {
    try {

        const db = req.db ? req.db : getDb()

        let collecName = common.collectionNameGenerator(req.headers, "configurations")

        var sets = await db.collection(collecName).findOne({}, { projection: { _id: 0, frontend: 1 } });

        sets = sets && sets.frontend && sets.frontend.dynamic_columns ? sets.frontend.dynamic_columns : []

        let advanceFilterKey = [{ 'type': 'text', 'name': 'message', 'dynamic': false }];
        if (sets) {
            sets.forEach(dt => {
                advanceFilterKey.push({ 'type': dt.type, 'name': dt.name, 'dynamic': true });

            })
        }


        return responseData(res, true, 200, "success", { 'advanceFilterKey': advanceFilterKey });
    }
    catch (e) {
        console.log(e);
        return responseData(res, false, 500);
    }
}




async function getDiscoverLogsData(req) {
    try {
        const db = req.db ? req.db : getDb()
        var query = {}
        var queryParam = {};
        var andCondQuery = [];
        var apiDiscoverLogsData = req.body;
        let startDate = new Date(apiDiscoverLogsData.startDate);
        let endDate = new Date(apiDiscoverLogsData.endDate);

        query.timestamp = { '$gte': startDate, '$lt': endDate }


        if (apiDiscoverLogsData.advanceFilter && apiDiscoverLogsData.advanceFilter.length > 0) {

            apiDiscoverLogsData.advanceFilter.forEach(e => {
                if (e.dynamic) {
                    e.key = "meta." + e.key
                }
            })
            let groupwise = apiDiscoverLogsData.advanceFilter.reduce((r, a) => {

                r[a.key] = [...r[a.key] || [], a];

                return r;
            }, {});

            for (const property in groupwise) {
                let elements = groupwise[property];
                if (elements.length == 1) {

                    if (elements[0].condition == 'is' || elements[0].condition == 'is not')
                        elements[0].value = /^\d+$/.test(elements[0].value) ? parseInt(elements[0].value) : elements[0].value

                    if (elements[0].condition != 'exists' && elements[0].condition != "doesn't exists") {
                        query = queryCreator(query, elements[0])
                    }
                    else {
                        andCondQuery.push(queryCreator({}, elements[0]))
                    }
                }
                if (elements.length > 1) {
                    let orQuery = [];
                    let clientOrQuery = []
                    elements.forEach(data => {

                        if (data.condition == 'is' || data.condition == 'is not')
                            data.value = /^\d+$/.test(data.value) ? parseInt(data.value) : data.value


                        orQuery.push(queryCreator({}, data))

                    })
                    console.log("orrrr", orQuery, "clieeorrrrr", clientOrQuery)
                    if (orQuery.length > 1)
                        andCondQuery.push({ '$or': orQuery })

                }


            }
        }


        if (andCondQuery.length > 0) {
            query['$and'] = andCondQuery;
        }

        console.log("insideclieenqueryy", JSON.stringify(query))
        let limit = apiDiscoverLogsData.limit
        let offset = apiDiscoverLogsData.offset
        let appCollection = appdata_initials + "_applogs_" + apiDiscoverLogsData.app_id + "_" + apiDiscoverLogsData.monthYear

        console.log('appCollection -->', appCollection);


        console.log(queryParam, "ressssssu", query);
        var totalCount = await db.collection(appCollection)
            .countDocuments(query)

        var projectObj = {};
        var headerArray = ["arrow", "id"]
        var dynamicColumn = [];
        projectObj.timestamp = 1
        let collecName = common.collectionNameGenerator(req.headers, "configurations")

        var sets = await db.collection(collecName).findOne({}, { projection: { _id: 0, frontend: 1 } });

        sets = sets && sets.frontend && sets.frontend.dynamic_columns ? sets.frontend.dynamic_columns : []

        if (sets) {
            sets.forEach(dt => {
                headerArray.push(dt.name);
                dynamicColumn.push(dt.name);
                projectObj["meta." + dt.name] = 1;
            })
        }
        headerArray.push("timestamp")
        console.log("project obj", projectObj)
        var discoverLogsData
        if (req.body.query && req.body.query == 'all') {
            discoverLogsData = await db.collection(appCollection)
                .find().sort({ timestamp: -1 })
                .project(projectObj)
                .toArray()
        } else {
            discoverLogsData = await db.collection(appCollection)
                .find(query).sort({ timestamp: -1 })
                .project(projectObj)
                .skip(offset ? offset : 0)
                .limit(limit ? limit : 10)
                .toArray()
        }

        for (let i = 0; i < discoverLogsData.length; i++) {
            discoverLogsData[i].timestamp = Math.floor((discoverLogsData[i].timestamp.getTime()) / 1000)
            discoverLogsData[i].timestamp = common.momentTimeZone(req, (discoverLogsData[i].timestamp))
            discoverLogsData[i].timestamp = new Date(discoverLogsData[i].timestamp)


        }



        var discoverLogsObj = { 'totalCount': totalCount, 'rows': discoverLogsData, 'headers': headerArray, 'columns': dynamicColumn }
        console.log("discoverLogs", discoverLogsObj)
        return discoverLogsObj;
    }
    catch (err) {
        console.log(err);
        return 500;
    }
}
module.exports.getDiscoverLogsData = getDiscoverLogsData

function queryCreator(query, element1) {

    console.log(element1, 'queryyy before', query)

    if (element1.condition == 'is' || element1.condition == "is not") {
        let operator = element1.condition == 'is' ? '$eq' : element1.condition == 'is not' ? '$ne' : '$eq';
        query[element1.key] = {};
        query[element1.key][operator] = element1.value
    }

    if (element1.condition == 'contains' || element1.condition == "doesn't contain") {
        if (element1.condition == 'contains') {

            // regexSpecialCharacter.forEach(elm => {

            //     if (element1.value === elm) {


            //         let regsearch = new RegExp('\\' + elm, "g");
            //         element1.value = (element1.value).replace(regsearch, '\\' + elm)
            //     }
            // })
            element1.value = element1.value.replace(/[.*+-/?^${}()|[\]\\]/g, '\\$&')
            console.log("checkk", element1.value)
            query[element1.key] = new RegExp(element1.value, 'i')

        }
        if (element1.condition == "doesn't contain") {

            element1.value = element1.value.replace(/[.*+-/?^${}()|[\]\\]/g, '\\$&')
            query[element1.key] = { '$not': new RegExp(element1.value, 'i') }
        }
    }

    if (element1.condition == 'exists' || element1.condition == "doesn't exists") {
        // let operator = element1.condition == 'exists' ? '$exists' : element1.condition == "doesn't exists" ? "$exists" : '$eq';
        // query[element1.key] = {};
        // query[element1.key][operator] = element1.value

        if (element1 && (element1.value == 'true' || element1.value == true)) {

            query['$and'] = [{ [element1.key]: { '$exists': element1.value } }, { [element1.key]: { '$ne': null } }, { [element1.key]: { '$ne': '' } }]
        }
        else {
            query['$or'] = [{ [element1.key]: { '$exists': element1.value } }, { [element1.key]: { '$eq': null } }, { [element1.key]: { '$eq': '' } }]
        }
    }

    console.log('queryyy created', JSON.stringify(query))
    return query
}

function validateQueryParam(e, queryParam) {
    console.log("eeeee", e, "qqquerr", queryParam)
    let respo = [];
    for (const key in queryParam) {
        let childRespo = []
        let data = queryParam[key]
        data.forEach(element2 => {
            let newkey = element2.key.split('.')[1];

            if (element2.condition == "is" && e.key == newkey && e.value == element2.value) {
                childRespo.push(true)
            }
            else if (element2.condition == "is not" && e.key == newkey && e.value != element2.value) {
                childRespo.push(true)
            }
            else if (element2.condition == "contains" && e.key == newkey && e.value.includes(element2.value)) {
                childRespo.push(true)
            }
            else if (element2.condition == "doesn't contain" && e.key == newkey && !(e.value.includes(element2.value))) {
                childRespo.push(true)
            }
            else if (element2.condition == "exists" && e.key == newkey) {
                childRespo.push(true)
            }
            else if (element2.condition == "doesn't exists" && e.key != newkey) {
                childRespo.push(true)
            }
            else {
                childRespo.push(false)
            }
        })
        console.log("childRespochildRespo", childRespo)
        respo.push(childRespo.includes(true))

    }
    console.log("resporespo", respo)
    return respo.every(element3 => element3)


}

function masking_process(sets, reqBody) {

    sets.forEach(elementa => {
        if (reqBody.hasOwnProperty(elementa.mask_key) == true) {
            let value = reqBody[elementa.mask_key]
            let maskData = common.maskString(elementa, value)
            reqBody[elementa.mask_key] = maskData;

        }
    })
    return reqBody
}

module.exports.masking_process = masking_process