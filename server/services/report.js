const { responseData } = require('../utils/responseHandler');
const { appdata_initials, backend_url, csv_file_path, csv_downoad_url } = require('../config');
const common = require('../utils/common');
const getDb = require('../utils/database').getDb;
var path = require('path');
const fastcsv = require("fast-csv");
var fileSystem = require("fs");
const ObjectId = require('mongodb').ObjectId;
const config = require('../config');
const systemLog = require('../services/systemLog');
const ipAddress = require('../utils/common');
const regexSpecialCharacter = ['.', '^', '$', '*', '+', '-', '?', '(', ')', '[', ']', '{', '}', '|', '—', '/', '\\']
module.exports.getApiReports = async function (req, res) {
    let reportObj = await getReportData(req);
    if (reportObj != 500) {
        return responseData(res, true, 200, "success", reportObj);
    }
    return responseData(res, false, 500);
}

// async function getReportData(req) {
//     try {
//         const db = getDb()
//         var query = req.body.api ? { 'api_info.api_id': req.body.api } : {}
//         var apiReportData = req.body;
//         var headerKey = apiReportData.header_key ? apiReportData.header_key : "";
//         var headerValue = apiReportData.header_value ? apiReportData.header_value : "";
//         var queryParamKey = apiReportData.queryParamsKey ? apiReportData.queryParamsKey : "";
//         var queryParamValue = apiReportData.queryParamsValue ? apiReportData.queryParamsValue : "";
//         let startDate = new Date(apiReportData.startDate);
//         let endDate = new Date(apiReportData.endDate);
//         endDate.setDate(endDate.getDate() + 1);

//         query.created_on = { '$gte': startDate, '$lt': endDate }
//         apiReportData.client_id ? query.client_id = apiReportData.client_id : ""
//         apiReportData.status_code ? query.status_code = parseInt(apiReportData.status_code) : ""
//         apiReportData.method ? query.method = apiReportData.method : ""
//         console.log("query in report --->> ", query);

//         let limit = apiReportData.limit
//         let offset = apiReportData.offset
//         let appCollection = appdata_initials + "_appdata_" + apiReportData.app_id + "_" + apiReportData.monthYear
//         console.log('appCollection -->', appCollection);

//         var totalCount = await db.collection(appCollection)
//             .find(query)
//             .count()
//         var reportData
//         if (req.body.query == 'all') {
//             reportData = await db.collection(appCollection)
//                 .find(query).sort({ created_on: -1 })
//                 .project({ trace_id: 1, api: 1, method: 1, 'api_info.api_code': 1, 'api_info.api_query_params': 1, client_id: 1, client_code: 1, created_on: 1, response_size: 1, response_time: 1, status_code: 1, response_size: 1, response_time: 1, calling_response_time: 1, headers: 1, api_query_params: 1, request_url: 1 })
//                 .toArray()
//         } else {
//             reportData = await db.collection(appCollection)
//                 .find(query).sort({ created_on: -1 })
//                 .project({ trace_id: 1, api: 1, method: 1, 'api_info.api_code': 1, 'api_info.api_query_params': 1, client_id: 1, client_code: 1, created_on: 1, response_size: 1, response_time: 1, status_code: 1, response_size: 1, response_time: 1, calling_response_time: 1, headers: 1, api_query_params: 1, request_url: 1 })
//                 .skip(offset ? offset : 0)
//                 .limit(limit ? limit : 10)
//                 .toArray()
//         }

//         // reportData.forEach(item => {
//         //     item.created_on = Math.floor((item.created_on.getTime()) / 1000)
//         //     item.created_on = item.created_on * 1000
//         //     // console.log(item.created_on);
//         // })
//         // console.log("report data--=--=--=-=-=-> ", reportData);


//         if ((headerKey != "" || headerValue != "") && (queryParamKey != "" || queryParamValue != "")) {
//             var reportDataArr = [];
//             reportData.forEach(item => {
//                 const header_keys = Object.keys(item.headers);
//                 // console.log(header_keys);
//                 for (let i = 0; i < header_keys.length; i++) {
//                     if (header_keys[i] == headerKey.toLowerCase() && item.headers[header_keys[i]] == headerValue) {
//                         if (headerKey.toLowerCase() == "content-length") {
//                             item.headers[headerKey] = parseInt(headerValue)
//                             reportDataArr.push(item)
//                         } else {
//                             reportDataArr.push(item)
//                         }
//                     }
//                 }

//             })
//             let reportQueryArr = [];
//             if (queryParamKey != "" || queryParamValue != "") {
//                 reportDataArr.forEach(i => {
//                     var urlParams = i.request_url.split("?")
//                     // console.log("===>", urlParams);
//                     if (urlParams.length > 1) {
//                         let data = urlParams[1].split("&")
//                         let data1 = getKeyValue(data)
//                         // console.log(" data1 -> ", data1);
//                         data1.filter(e => {
//                             if (e.key == queryParamKey && e.value == queryParamValue) {
//                                 // reportDataArr.push(i)
//                                 reportQueryArr.push(i)
//                             }
//                         })
//                     }
//                 })
//             }
//             reportData = reportQueryArr
//             totalCount = reportData.length
//         }
//         else if (headerKey != "" || headerValue != "") {
//             var reportDataArr = [];
//             reportData.forEach(item => {
//                 const header_keys = Object.keys(item.headers);
//                 // console.log(header_keys);
//                 for (let i = 0; i < header_keys.length; i++) {
//                     if (header_keys[i] == headerKey.toLowerCase() && item.headers[header_keys[i]] == headerValue) {
//                         if (headerKey.toLowerCase() == "content-length") {
//                             item.headers[headerKey] = parseInt(headerValue)
//                             reportDataArr.push(item)
//                         } else {
//                             reportDataArr.push(item)
//                         }
//                     }
//                 }

//             })
//             reportData = reportDataArr
//             totalCount = reportData.length
//         }
//         else if (queryParamKey != "" || queryParamValue != "") {
//             let reportQueryArr = []
//             reportData.forEach(i => {
//                 var urlParams = i.request_url.split("?")
//                 // console.log("===>", urlParams);
//                 if (urlParams.length > 1) {
//                     let data = urlParams[1].split("&")
//                     let data1 = getKeyValue(data)
//                     // console.log(" data1 -> ", data1);
//                     data1.filter(e => {
//                         if (e.key == queryParamKey && e.value == queryParamValue) {
//                             reportQueryArr.push(i)
//                         }
//                     })
//                 }
//             })
//             reportData = reportQueryArr
//             totalCount = reportData.length
//         }
//         // console.log("report data arr = = = =  =  > ", reportDataArr.length);
//         // if(reportDataArr.length>0){
//         //     reportData = reportDataArr
//         //     totalCount = reportData.length
//         // }

//         // for getting api names
//         for (let i = 0; i < reportData.length; i++) {
//             // let item = reportData[i];
//             if (reportData[i].api_info.api_code) {
//                 let apicode = reportData[i].api_info.api_code
//                 let apiname = await db.collection("api_managements")
//                     .find({ code: apicode })
//                     .project({ 'short_description': 1 })
//                     .toArray()
//                 reportData[i].api_name = apiname[0] ? apiname[0].short_description : 'null'

//             } else {
//                 reportData[i].api_name = "NA";
//             }

//             if (reportData[i].client_id) {

//                 let client_id = reportData[i].client_id;
//                 let client = await db.collection("partners").findOne({ _id: ObjectId(client_id) });
//                 reportData[i].client = client ? client.name : "NA";
//             } else {
//                 reportData[i].client = "NA";
//             }

//             reportData[i].created_on = Math.floor((reportData[i].created_on.getTime()) / 1000)
//             reportData[i].created_on = reportData[i].created_on * 1000
//             reportData[i].request_on = new Date(reportData[i].created_on)

//         }

//         // reportData.length < totalCount ? 
//         console.log("=====reportData============", reportData.length);
//         console.log("total Count - > ", totalCount);

//         var reportObj = { 'totalCount': totalCount, 'report': reportData }

//         return reportObj;
//     }
//     catch (err) {
//         console.log(err);
//         return 500;
//     }
// }

function getKeyValue(array) {
    let json = []
    array.forEach(i => {
        let params = i.split("=")
        json.push({ key: params[0], value: params[1] })
    })
    return json;
}


module.exports.getApiReportsView = async function (req, res) {
    try {
        const db = getDb();
        var viewObj = {};
        var apiViewReportData = req.body;
        let reportId = apiViewReportData.reportId
        // console.log("apiViewReportData :: ", apiViewReportData);
        let appCollection = appdata_initials + "_appdata_" + apiViewReportData.app_id + "_" + apiViewReportData.monthYear
        let errorCollection = appdata_initials + "_apierror_" + apiViewReportData.app_id + "_" + apiViewReportData.monthYear
        console.log('appCollection-->', appCollection);
        var appResult = await db.collection(appCollection)
            .find({ trace_id: reportId })
            .project({ request_url: 1, request_body: 1, status_code: 1, method: 1, browserip: 1, headers: 1, response_size: 1, response_time: 1, calling_response_time: 1, 'api_info.api_query_params': 1, component_ts: 1, target_status_code: 1, proxy_status_code: 1 })
            .toArray()
        // console.log("app result", appResult);
        // appResult[0].api_query_params = appResult[0].api_info['api_query_params'] ? appResult[0].api_info['api_query_params'] : null

        var errorResult = await db.collection(errorCollection)
            .find({ trace_id: reportId })
            .project({ error: 1 })
            .toArray()

        if (appResult.length) {
            console.log("app result value is here", appResult[0]);
            var { request_body } = appResult[0];
            viewObj.request = appResult[0];
            viewObj.request.request_body = JSON.parse(request_body);

            ///masking process
            if (request_body) {

                // var sets = [
                //     { mask_key: "type", mask_type: "post", mask_length: 2 },
                //     { mask_key: "checkin", mask_type: "pre", mask_length: 4 },
                //     { mask_key: "checkout", mask_type: "pre", mask_length: 4 }
                // ];
                let collecName = common.collectionNameGenerator(req.headers, 'configurations')

                var sets = await db.collection(collecName).findOne({}, { projection: { _id: 0, frontend: 1 } });

                sets = sets && sets.frontend && sets.frontend.masking_keys ? sets.frontend.masking_keys : []

                viewObj.request.request_body = masking_process(sets, viewObj.request.request_body)

                // sets.forEach(elementa => {
                //     if (viewObj.request.request_body.hasOwnProperty(elementa.mask_key) == true) {
                //         let value = viewObj.request.request_body[elementa.mask_key]
                //         let maskData = common.maskString(elementa, value)
                //         viewObj.request.request_body[elementa.mask_key] = maskData;
                //     }
                // })
            }
        }
        // if (respResult.length)
        //     viewObj.response = respResult[0].response;
        // console.log("app result", appResult);
        viewObj.request.response_time = appResult[0].response_time ? appResult[0].response_time : 'NA'
        viewObj.request.response_size = appResult[0].response_size ? appResult[0].response_size : 'NA'
        // viewObj.request.calling_response_time = appResult[0].calling_response_time ? appResult[0].calling_response_time : 'NA'
        viewObj.request.calling_response_time = (appResult[0] && appResult[0].component_ts && appResult[0].component_ts.target && appResult[0].component_ts.target.elapsed) ? appResult[0].component_ts.target.elapsed : 'NA'

        if (errorResult.length)
            viewObj.error = errorResult[0].error;
        console.log('viewObj-------->', viewObj);
        if (apiViewReportData && apiViewReportData.type == 'expand') {

            let respData = [];
            if (viewObj.request && viewObj.request.request_url)
                respData.push({ 'key': 'request-url', 'value': viewObj.request.request_url })
            if (viewObj.request && viewObj.request.browserip)
                respData.push({ 'key': 'browser-ip', 'value': viewObj.request.browserip })
            if (viewObj.request && viewObj.request.headers && viewObj.request.headers['user-agent'])
                respData.push({ 'key': 'user-agent', 'value': viewObj.request.headers['user-agent'] })
            if (viewObj.request && viewObj.request.response_size)
                respData.push({ 'key': 'response-size', 'value': viewObj.request.response_size })
            if (viewObj.request && viewObj.request.response_time)
                respData.push({ 'key': 'response-time', 'value': viewObj.request.response_time })
            if (viewObj.error)
                respData.push({ 'key': 'error', 'value': viewObj.error })
            if (viewObj.request && viewObj.request.request_body) {
                let reqBodyDot = (JSON.stringify(viewObj.request.request_body)).length >= 1000 ? '...' : ''
                respData.push({ 'key': 'request-body', 'value': ((JSON.stringify(viewObj.request.request_body)).substring(0, 1000)) + reqBodyDot })
            }
            if (viewObj.request && viewObj.request.target_status_code) {
                respData.push({ 'key': 'target-status-code', 'value': viewObj.request.target_status_code })
            }
            if (viewObj.request && viewObj.request.proxy_status_code) {
                respData.push({ 'key': 'proxy-status-code', 'value': viewObj.request.proxy_status_code })
            }
            return responseData(res, true, 200, "success", respData);

        }
        else {
            return responseData(res, true, 200, "success", viewObj);
        }

    }
    catch (err) {
        console.log(err);
        return responseData(res, false, 500);
    }
}

module.exports.getApiResponseView = async function (req, res) {
    try {
        var apiViewReportData = req.body;
        let respCollection = appdata_initials + '_appresponse_' + apiViewReportData.app_id + '_' + apiViewReportData.monthYear
        console.log(">>resp collection>>", respCollection);
        const db = getDb();
        var respResult = await db.collection(respCollection)
            .find({ trace_id: apiViewReportData.reportId })
            .project({ response: 1 })
            .toArray()
        // console.log("resssssss------>>", respResult);
        return responseData(res, true, 200, "success", respResult);
    }
    catch (error) {
        // console.log("error : ", error);
        return responseData(res, false, 500);
    }
}

module.exports.filterKeys = async function (req, res) {
    try {
        const db = getDb();
        let collecName = common.collectionNameGenerator(req.headers, 'configurations')

        var headerKeysArr = await db.collection(collecName)
            .find()
            .project({ 'frontend.header_keys': 1 })
            .toArray()
        if (headerKeysArr.length != 0) {
            if (headerKeysArr[0].frontend) {
                headerKeysArr = headerKeysArr[0].frontend
                headerKeysArr = headerKeysArr.header_keys
            }
        }
        else {
            headerKeysArr = []
        }

        var queryParamsArr = await db.collection(collecName)
            .find()
            .project({ 'frontend.query_params_keys': 1 })
            .toArray()
        if (queryParamsArr.length != 0) {
            if (queryParamsArr[0].frontend) {
                queryParamsArr = queryParamsArr[0].frontend
                queryParamsArr = queryParamsArr.query_params_keys
            }
        }
        else {
            queryParamsArr = []
        }
        let advanceFilterKey = [
            { 'type': 'string', 'name': 'endpoint_url' },
            { 'type': 'string', 'name': 'client' },
            { 'type': 'number', 'name': 'status_code' },
            { 'type': 'string', 'name': 'method' },
            { 'type': 'text', 'name': 'request_body' },
            { 'type': 'number', 'name': 'proxy_status_code' },
            { 'type': 'number', 'name': 'target_status_code' }
        ];

        let downloadColumn = [
            { "name": "endpoint_url", "key": "api", "value": true },
            { "name": "method", "key": "method", "value": true },
            { "name": "request_body", "key": "request_body", "value": false },
            { "name": "status", "key": "status_code", "value": true },
            { "name": "response_time_in_milliseconds", "key": "response_time", "value": true },
            { "name": "client", "key": "client", "value": true },
            { "name": "request_on", "key": "request_on", "value": true },
            { "name": "browser_ip", "key": "browserip", "value": false },
            { "name": "response_size_in_bytes", "key": "response_size", "value": false },
            { "name": "target_status_code", "key": "target_status_code", "value": false },
            { "name": "proxy_status_code", "key": "proxy_status_code", "value": false },
        ]
        // console.log(" filter keys  ", { 'headerKeys': headerKeysArr, 'queryParamsKeys': queryParamsArr });
        return responseData(res, true, 200, "success", { 'headerKeys': headerKeysArr, 'queryParamsKeys': queryParamsArr, 'advanceFilterKey': advanceFilterKey, 'downloadColumn': downloadColumn });
    }
    catch (e) {
        console.log(e);
        return responseData(res, false, 500);
    }
}
async function fastcsvDownload(app_id, tempReportData, i, length, columnValue) {

    return new Promise((resolve, reject) => {
        let from = i + 1;
        let to = length + i;
        let dateTime = Math.floor(((new Date()).getTime()) / 1000);
        let endPath = app_id + "_" + dateTime + "_" + from + "_" + "to" + "_" + to + ".csv";
        let filePath = path.join(__dirname, csv_file_path + "simplika_reports_" + endPath)
        let url = backend_url + csv_downoad_url + "/simplika_reports_" + endPath;
        console.log("urllllll", url, "fileepathh", filePath)
        let ws = fileSystem.createWriteStream(filePath);
        var parse = fastcsv.parse(
            {
                ignoreEmpty: true,
                discardUnmappedColumns: true,
                headers: columnValue,
            });

        var transform = fastcsv.format({ headers: true })

        fastcsv
            .write(tempReportData, {})
            .on("end", function () {
                setTimeout(() => {
                    resolve(url);
                }, 1000);
            })
            .pipe(parse)
            .pipe(transform)
            .pipe(ws)


    })
}
module.exports.fastcsvDownload = fastcsvDownload
// module.exports.fastcsvDownload = async function (app_id, tempReportData, i, length) {
//     let url1 = await fastcsvDownload(app_id, tempReportData, i, length);
//     return url1;
// }
module.exports.downloadReport = async function (req, res) {
    try {
        const db = getDb();
        let app_id = req.body.app_id;
        let total = req.body.total;
        let queryFor = req.body.query;
        var columnKey = req.body.columns.map(el => el.key);
        var columnValue = req.body.columns.map(el => el.name);
        let collecName = common.collectionNameGenerator(req.headers, 'configurations')

        var sets = await db.collection(collecName).findOne({}, { projection: { _id: 0, frontend: 1 } });
        sets = sets && sets.frontend && sets.frontend.masking_keys ? sets.frontend.masking_keys : []


        if ((queryFor != 'all') || (queryFor == 'all' && total < config.limit.small_data)) {
            let finalUrl = [];
            // console.log("req.body :: ",req.body);
            let reportData = await getReportData(req);
            reportData = reportData.report;
            console.log("report data report value is here", reportData);
            if (reportData.length > 0) {
                // reportData = reportData.map(({ _id, trace_id, headers, client_code, request_url, response_size, api_info, client_id, created_on, ...rest }) => ({ ...rest }));

                reportData = reportData.map(el => {
                    let data = {}
                    columnKey.forEach(e => {

                        if (e === 'request_body') {

                            el[e] = masking_process(sets, JSON.parse(el[e]))
                            el[e] = JSON.stringify(el[e])

                        }
                        if (e === "target_status_code" || e === "proxy_status_code") {
                            if (el[e] == "" || el[e] == undefined || el[e] == null) {
                                el[e] = "NA"
                            }
                        }
                        data[e] = el[e]
                    })

                    return data;
                });



                console.log("Report Data value is", reportData);
                // for (let i = 0; i < reportData.length; i += 5000) {
                // var tempReportData = [];
                // for (let j = 0; j < reportData.length; j++) {
                //     tempReportData.push(reportData[j]);
                // }
                //  console.log("Temp Report Data value",app_id,tempReportData,i,tempReportData.length);
                let url = await fastcsvDownload(app_id, reportData, 0, reportData.length, columnValue);
                //  console.log("url :: ",url);
                finalUrl.push(url)

                let obj1 = {
                    action: "report_download",
                    data: {
                        app_id: app_id,
                        report_start_date: common.momentTimeZone(req, req.body.startDate, 'DD-MM-YYYY', false),
                        report_end_date: common.momentTimeZone(req, req.body.endDate, 'DD-MM-YYYY', false),
                        page: queryFor,
                        advance_filter: req.body.advanceFilter ? req.body.advanceFilter : []
                    },
                    user_id: req.session.user_id,
                    ip_address: ipAddress.ipAddress(req)
                }
                // //console.log("========obj========", obj1);
                systemLog.logData(obj1)
            }


            // }
            return responseData(res, true, 200, "success", finalUrl);
        }
        if (total > config.limit.small_data && queryFor == 'all') {


            let created_by = req.user._id;
            const fork = require('child_process').fork;
            console.log("child process path", config);
            const ls = fork(path.join(process.cwd(), config.child_process_path, 'main.js'));


            let dataObj = {
                status: "Initiated",
                app_id: app_id,
                files: [],
                report_start_date: req.body.startDate,
                report_end_date: req.body.endDate,
                created_by: created_by,
                start_time: Math.floor(((new Date()).getTime()) / 1000),
                created_on: new Date()
            };
            let collecName1 = common.collectionNameGenerator(req.headers, 'download_manager')

            db.collection(collecName1)
                .insertOne(dataObj)
                .then(result => {

                    db.collection(collecName1).createIndex({ created_on: -1 },
                        { background: true, expireAfterSeconds: 604800 }, function (err, res) { });


                    //send to child process
                    ls.send({
                        process: 'download-manager-process', query: 'download', app_id: app_id,
                        idVal: result.insertedId, startDate: req.body.startDate, endDate: req.body.endDate,
                        created_by: created_by, request: req.body, total: total, columnValue: columnValue, columnKey: columnKey, maskSet: sets, headers: req.headers
                    });


                    let obj1 = {
                        action: "report_download",
                        data: {
                            app_id: app_id,
                            report_start_date: common.momentTimeZone(req, req.body.startDate, 'DD-MM-YYYY', false),
                            report_end_date: common.momentTimeZone(req, req.body.endDate, 'DD-MM-YYYY', false),
                            page: queryFor,
                            advance_filter: req.body.advanceFilter ? req.body.advanceFilter : []

                        },
                        user_id: req.session.user_id,
                        ip_address: ipAddress.ipAddress(req)
                    }
                    // //console.log("========obj========", obj1);
                    systemLog.logData(obj1)


                    return responseData(res, true, 200, "success", "DownloadManager");
                })
                .catch((err) => {
                    console.log(err);

                });



        }

        // console.log("final URL :: ",finalUrl);
        // return responseData(res, true, 200, "success", finalUrl);

    } catch (err) {
        console.log("Error value", err);
    }
}

// module.exports.downloadCsvFile = async function (req, res) {
//     try {
//         if (req.query && req.query.csv) {

//             let file = req.query.csv
//             console.log("response cokkiii", req.query)
//             let path_to_report = path.join(__dirname, csv_file_path + file)

//             if (config.server == "standalone") {
//                 res.download(path_to_report, file, (err) => {
//                     if (err) {
//                         console.log('Here is Error ' + err);
//                         return res.status(403).send("File Not found");
//                     } else {
//                         console.log('success');
//                     }
//                 })
//             }
//             else {
//                 var externalReq = http.request({
//                     hostname: "inspira-app-rest-upload.s3.amazonaws.com",
//                     path: "/simplika/report/" + file
//                 }, function (externalRes) {
//                     res.setHeader("content-disposition", "attachment; filename=" + fileName);
//                     externalRes.pipe(res);
//                 });
//                 externalReq.end();
//             }

//         }
//         else {
//             return res.status(403).send("File Not found");
//         }

//     } catch (err) {
//         console.log("Error value", err);
//         return err;
//     }
// }

// module.exports.getDownloadReportData = async function (req) {
//     let data = await getReportData(req);
//     return data;
// }
async function getReportData(req) {
    try {
        const db = req.db ? req.db : getDb()
        var clientQuery = {}
        var query = {}
        var queryParam = {};
        var clientMultiCond = [];
        var andCondQuery = [];
        var isQueryParam = false;
        // var is_headers_content_length = false;
        var apiReportData = req.body;
        let startDate = new Date(apiReportData.startDate);
        let endDate = new Date(apiReportData.endDate);
        // endDate.setDate(endDate.getDate());

        query.created_on = { '$gte': startDate, '$lt': endDate }

        if (apiReportData.advanceFilter && apiReportData.advanceFilter.length > 0) {
            let groupwise = apiReportData.advanceFilter.reduce((r, a) => {

                // if (r.hasOwnProperty(a.key + "-" + a.condition) && r[a.key + "-" + a.condition].length > 0) {
                //     if (r[a.key + "-" + a.condition][0].key == a.key && r[a.key + "-" + a.condition][0].condition == a.condition) {
                //         r[a.key + "-" + a.condition].push(a)
                //     }
                // }
                // else {
                r[a.key] = [...r[a.key] || [], a];
                // }
                return r;
            }, {});
            console.log("grouppppppppppppp", groupwise);
            for (const property in groupwise) {
                let elements = groupwise[property];
                if (elements.length == 1) {
                    if (elements[0] && elements[0].key != 'client' && (!(elements[0].key.includes("query_param.")))) {
                        elements[0].key = elements[0].key == "endpoint_url" ? "api" : elements[0].key.includes("header.") ? elements[0].key.toLowerCase() : elements[0].key;

                        if (elements[0].condition != 'exists' && elements[0].condition != "doesn't exists") {
                            query = queryCreator(query, elements[0])
                        }
                        else {
                            andCondQuery.push(queryCreator({}, elements[0]))
                        }
                    }
                    if (elements[0] && elements[0].key == 'client') {
                        if (elements[0].condition != 'exists' && elements[0].condition != "doesn't exists") {
                            elements[0].key = 'name';

                            clientQuery = queryCreator(clientQuery, elements[0])
                        }
                        else {
                            elements[0].key = 'client_id';
                            andCondQuery.push(queryCreator({}, elements[0]))
                            // query = queryCreator(query, elements[0])
                            // query[elements[0].key] = {};
                            // console.log("ddddddd", query, 'ffffff', element)
                            // query[elements[0].key]['$exists'] = elements[0].value
                        }
                    }

                }
                if (elements.length > 1) {
                    let orQuery = [];
                    let clientOrQuery = []
                    elements.forEach(data => {
                        if (data && data.key != 'client' && (!(data.key.includes("query_param.")))) {
                            data.key = data.key == "endpoint_url" ? "api" : data.key.includes("header.") ? data.key.toLowerCase() : data.key;

                            orQuery.push(queryCreator({}, data))
                        }
                        if (data && data.key == 'client') {
                            if (data.condition != 'exists' && data.condition != "doesn't exists") {
                                console.log("nottttpart")
                                data.key = 'name';
                                clientOrQuery.push(queryCreator({}, data))
                            }
                            else {
                                console.log("yessssss")
                                clientMultiCond.push(data)
                            }
                        }

                    })
                    console.log("orrrr", orQuery, "clieeorrrrr", clientOrQuery)
                    if (orQuery.length > 1)
                        andCondQuery.push({ '$or': orQuery })
                    // query['$or'] = orQuery
                    if (clientOrQuery.length > 0)
                        clientQuery['$or'] = clientOrQuery



                }
                if (property.includes('query_param.')) {
                    queryParam[property] = elements
                }

            }



        }
        if ((Object.keys(clientQuery)).length > 0 || clientMultiCond.length > 0) {
            // console.log("sssssss", clientQuery, 'tttttt', clientMultiCond)
            let clientIds = [];
            let cquery = {}
            if ((Object.keys(clientQuery)).length > 0) {
                let collecName = common.collectionNameGenerator(req.headers, 'partners')

                clientIds = await db.collection(collecName)
                    .find(clientQuery)
                    .project({ _id: 1 })
                    .toArray()
                clientIds = clientIds.map(element6 => (element6._id.toString()))
            }
            if (clientMultiCond.length > 1) {
                let existOrQuery = []
                clientMultiCond.forEach(cl => {
                    if (cl && cl.value == true) {
                        existOrQuery.push({ '$and': [{ 'client_id': { '$exists': cl.value } }, { 'client_id': { '$ne': null } }, { 'client_id': { '$ne': '' } }] })
                    }
                    else {
                        existOrQuery.push({ '$or': [{ 'client_id': { '$exists': cl.value } }, { 'client_id': { '$eq': null } }, { 'client_id': { '$eq': '' } }] })
                    }
                })
                if ((Object.keys(clientQuery)).length > 0)
                    existOrQuery.push({ 'client_id': { '$in': clientIds } })
                cquery['$or'] = existOrQuery
            }
            else if (clientMultiCond.length == 1) {

                if (clientMultiCond && clientMultiCond[0].value == true) {
                    cquery['$or'] = [{ '$and': [{ 'client_id': { '$exists': clientMultiCond[0].value } }, { 'client_id': { '$ne': null } }, { 'client_id': { '$ne': '' } }] }]
                }
                else {
                    cquery['$or'] = [{ '$or': [{ 'client_id': { '$exists': clientMultiCond[0].value } }, { 'client_id': { '$eq': null } }, { 'client_id': { '$eq': '' } }] }]
                }

                if ((Object.keys(clientQuery)).length > 0)
                    cquery['$or'].push({ 'client_id': { '$in': clientIds } })

            }
            else {
                if ((Object.keys(clientQuery)).length > 0)
                    cquery['client_id'] = { '$in': clientIds }
            }

            andCondQuery.push(cquery);


        }

        if (andCondQuery.length > 0) {
            query['$and'] = andCondQuery;
        }

        console.log("insideclieenqueryy", JSON.stringify(query))
        let limit = apiReportData.limit
        let offset = apiReportData.offset
        let appCollection = appdata_initials + "_appdata_" + apiReportData.app_id + "_" + apiReportData.monthYear
        console.log('appCollection -->', appCollection);


        console.log(queryParam, "ressssssu", query);
        var totalCount = await db.collection(appCollection)
            .countDocuments(query)


        var reportData
        if (req.body.query && req.body.query == 'all') {
            reportData = await db.collection(appCollection)
                .find(query).sort({ created_on: -1 })
                .project({ trace_id: 1, api: 1, method: 1, 'api_info.api_code': 1, 'api_info.api_query_params': 1, client_id: 1, client_code: 1, created_on: 1, status_code: 1, response_size: 1, response_time: 1, request_body: 1, calling_response_time: 1, headers: 1, api_query_params: 1, request_url: 1, browserip: 1, target_status_code: 1, proxy_status_code: 1 })
                .toArray()
        } else {
            reportData = await db.collection(appCollection)
                .find(query).sort({ created_on: -1 })
                .project({ trace_id: 1, api: 1, method: 1, 'api_info.api_code': 1, 'api_info.api_query_params': 1, client_id: 1, client_code: 1, created_on: 1, status_code: 1, response_size: 1, response_time: 1, request_body: 1, calling_response_time: 1, headers: 1, api_query_params: 1, request_url: 1, browserip: 1, target_status_code: 1, proxy_status_code: 1 })
                .skip(offset ? offset : 0)
                .limit(limit ? limit : 10)
                .toArray()
        }

        if ((Object.keys(queryParam).length) > 0) {
            isQueryParam = true;
        }

        let collecName = common.collectionNameGenerator(req.headers, 'partners')

        var clientData = await db.collection(collecName)
            .find()
            .project({ _id: 1, name: 1 })
            .toArray()

        // console.log(queryParam, "ressssssu", clientData);

        if (isQueryParam) {

            var reportDataArr = [];
            reportData.forEach(i => {

                var checkQueryParam = []
                var urlParams = i.request_url.split("?")

                if (urlParams.length > 1) {
                    let data = urlParams[1].split("&")
                    let data1 = getKeyValue(data)

                    data1.forEach(e => {
                        checkQueryParam.push(validateQueryParam(e, queryParam))

                    })
                    console.log("inqueryyyyyypp", i.client_id)
                    if (checkQueryParam.includes(true)) {
                        let clientIndex = clientData.findIndex(element5 => element5._id.toString() == i.client_id)
                        i.client = clientIndex >= 0 ? clientData[clientIndex].name : "NA"
                        i.api = i.api ? i.api : "NA"
                        i.created_on = Math.floor((i.created_on.getTime()) / 1000)
                        i.created_on = common.momentTimeZone(req, (i.created_on))
                        // i.created_on = i.created_on * 1000
                        i.request_on = new Date(i.created_on)
                        reportDataArr.push(i)
                    }
                }
            })
            reportData = reportDataArr
            totalCount = reportData.length

        }
        else {

            for (let i = 0; i < reportData.length; i++) {
                let clientIndex = clientData.findIndex(element4 => element4._id == reportData[i].client_id)
                reportData[i].client = clientIndex >= 0 ? clientData[clientIndex].name : "NA"
                reportData[i].api = reportData[i].api ? reportData[i].api : "NA"
                reportData[i].created_on = Math.floor((reportData[i].created_on.getTime()) / 1000)
                reportData[i].created_on = common.momentTimeZone(req, (reportData[i].created_on))
                // reportData[i].created_on = reportData[i].created_on * 1000
                reportData[i].request_on = new Date(reportData[i].created_on)


            }
        }




        var reportObj = { 'totalCount': totalCount, 'report': reportData }
        console.log("report", reportObj)
        return reportObj;
    }
    catch (err) {
        console.log(err);
        return 500;
    }
}
module.exports.getReportData = getReportData

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