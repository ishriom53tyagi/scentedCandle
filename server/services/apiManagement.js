const { responseData } = require('../utils/responseHandler');
const application = require('../services/application');
const getDb = require('../utils/database').getDb;
const ObjectId = require('mongodb').ObjectId;
const jwt = require('jsonwebtoken');
const config = require('../config');
const fs = require('fs');
var path = require('path');
const systemLog = require('../services/systemLog');
const ipAddress = require('../utils/common');
const request = require('../utils/request');
const common = require('../utils/common')

module.exports.getAllApis = async function (req, res) {
    try {
        const db = getDb();
        let collecName = common.collectionNameGenerator(req.headers, 'api_managements')
        var apis = await db.collection(collecName)
            .find()
            .project({ _id: 1, code: 1, short_description: 1 })
            .sort({ modified_time: -1 })
            .toArray()
        if (apis.length > 0) {
            return responseData(res, true, 200, "success", apis);
        } else {
            return responseData(res, false, 204, "failure");
        }
    } catch (err) {
        console.log("error ", err);
        return responseData(res, false, 500);
    }
}

module.exports.getApiData = async function (req, res) {
    try {
        const db = getDb();
        let collecName = common.collectionNameGenerator(req.headers, 'api_managements')
        db.collection(collecName)
            .find(ObjectId(req.body.id))
            .toArray()
            .then(api => {
                console.log(api);
                return res.status(200).send({ status: 'success', data: api });
            })
    } catch (err) {
        console.log("error ", err);
        return responseData(res, false, 500);
    }
}
module.exports.validationhelp = async function (req, res) {
    res.render("validation_help")
}

module.exports.insertApi = async function (req, res) {
    try {
        let created_by = req.user._id
        const db = getDb();
        let collecName = common.collectionNameGenerator(req.headers, 'applications')
        var applicationcode = await db.collection(collecName)
            .find({ _id: ObjectId(req.body.app_code) })
            .toArray()
        // console.log("app----->",applicationcode);
        console.log(req.body);
        req.body.api_headers.forEach(i => {
            if (i.name == '' && i.value == '' && i.required) {
                req.body.api_headers = [];
            }
        })
        req.body.api_query_params.forEach(i => {
            if (i.name == '' && i.description == '' && i.required) {
                req.body.api_query_params = [];
            }
        })
        let dataObj = {
            code: req.body.code,
            short_description: req.body.short_description,
            description: req.body.description,
            group_code: req.body.category,
            api_type: req.body.api_type,
            response_storage: req.body.response_storage,
            api_url: req.body.api_url,
            api_method: req.body.api_method,
            api_headers: req.body.api_headers,
            sample_request: req.body.sample_req,
            api_request: req.body.api_request,
            api_response: req.body.response,
            app_code: applicationcode[0].code,
            app_id: (ObjectId(req.body.app_id)),
            api_query_params: req.body.api_query_params,
            terms: req.body.terms,
            subscription_type: req.body.subscription_type,
            subscription_price: req.body.subscription_price,
            body_details: req.body.body_details,
            response_details: req.body.response_details,
            sample_response: req.body.sample_response,
            status: 1,
            direct_route: req.body.route,
            conditional_route: req.body.conditional_route,
            created_by: created_by,
            created_time: Math.floor(((new Date()).getTime()) / 1000),
            modified_time: Math.floor(((new Date()).getTime()) / 1000),
            is_checked_documentation: req.body.isCheckedDocumentation,
            to_validate: req.body.to_validate,
            timeout: req.body.timeout,
        }
        let collecName1 = common.collectionNameGenerator(req.headers, 'api_managements')
        db.collection(collecName1)
            .find({ "code": req.body.code }, { $exists: true })
            .toArray(function (err, result) {
                if (result && result.length) {
                    return responseData(res, false, 400, "Code Already Exists");
                } else {
                    db.collection(collecName1)
                        .insertOne(dataObj)
                        .then(async result1 => {
                            let obj = {
                                action: "api_inserted",
                                data: dataObj,
                                user_id: req.session.user_id,
                                ip_address: ipAddress.ipAddress(req)
                            }
                            systemLog.logData(obj)
                            return responseData(res, true, 200, "success", result1);
                        })
                }
            })
    } catch (err) {
        console.log("error ", err);
        return responseData(res, false, 500);
    }
}

module.exports.updateApi = async function (req, res) {
    console.log("updateApi req", req.body.data);
    try {
        let { body } = req;
        console.log(body);
        console.log('body.app_code: ', req.body.data);
        body.data.modified_by = req.user._id;
        body.data.modified_time = Math.floor(((new Date()).getTime()) / 1000)
        const db = getDb();
        let collecName = common.collectionNameGenerator(req.headers, 'applications')
        var applicationcode = await db.collection(collecName)
            .find({ _id: ObjectId(body.data.app_code) })
            .toArray()
        // console.log("app----->",applicationcode);
        body.data.api_headers.forEach(i => {
            if (i.name == '' && i.value == '' && i.required) {
                body.data.api_headers = [];
            }
        })
        body.data.api_query_params.forEach(i => {
            if (i.name == '' && i.description == '' && i.required) {
                body.data.api_query_params = [];
            }
        })
        var newValues = {
            code: body.data.code,
            short_description: body.data.short_description,
            description: body.data.description,
            group_code: body.data.category,
            api_type: body.data.api_type,
            api_url: body.data.api_url,
            api_method: body.data.api_method,
            api_headers: body.data.api_headers,
            sample_request: body.data.sample_req,
            api_request: body.data.api_request,
            api_response: body.data.response,
            app_code: applicationcode[0].code,
            app_id: (ObjectId(body.data.app_id)),
            api_query_params: body.data.api_query_params,
            terms: body.data.terms,
            subscription_type: body.data.subscription_type,
            subscription_price: body.data.subscription_price,
            body_details: body.data.body_details,
            response_details: body.data.response_details,
            sample_response: body.data.sample_response,
            direct_route: body.data.route,
            conditional_route: body.data.conditional_route,
            modified_by: body.data.modified_by,
            modified_time: body.data.modified_time,
            to_validate: body.data.to_validate,
            is_checked_documentation: body.data.isCheckedDocumentation,
            timeout: body.data.timeout,
            response_storage: body.data.response_storage
        }
        var newvalue1 = { $set: newValues };
        let collecName1 = common.collectionNameGenerator(req.headers, 'api_managements')

        var olddata = await db.collection(collecName1)
            .find({ '_id': ObjectId(body.id) })
            .toArray()
        console.log("old data => ", olddata);

        await db.collection(collecName1).updateOne({ '_id': ObjectId(body.id) }, { $rename: { 'isCheckedDocumentation': 'is_checked_documentation' } })
        db.collection(collecName1)
            .updateOne({ '_id': ObjectId(body.id) }, newvalue1, async function (err, obj) {
                if (obj) {
                    delete olddata[0].status
                    let dataObj = { before: olddata[0], after: newValues }
                    dataObj = systemLog.auditLogFieldsObject(dataObj)
                    let obj1 = {
                        action: "api_updated",
                        data: dataObj,
                        user_id: req.session.user_id,
                        ip_address: ipAddress.ipAddress(req)
                    }
                    console.log("==========obj1 in System Log Data===========", obj1);
                    systemLog.logData(obj1)
                    return responseData(res, true, 200, "success", obj);
                } else {
                    var err1 = [err];
                    return responseData(res, false, 404, "Error", { err1 });
                }
            });

    } catch (err) {
        console.log("error ", err);
        return responseData(res, false, 500);
    }
}

module.exports.deleteApi = async function (req, res) {
    try {
        let dataToDelete = { _id: ObjectId(req.body.id) }
        const db = getDb();

        let collecName = common.collectionNameGenerator(req.headers, 'api_managements')

        let appdata = await db.collection(collecName)
            .find({ _id: ObjectId(req.body.id) })
            .toArray()
        // console.log(req);
        // console.log(appdata);
        let created_by = req.user._id;
        let created_on = Math.floor(((new Date()).getTime()) / 1000);
        let collecName1 = common.collectionNameGenerator(req.headers, 'raw_appdata')

        db.collection(collecName1)
            .insertOne({
                type: "api",
                app_data: JSON.stringify(appdata[0]),
                created_by: created_by,
                created_on: created_on,
                name: appdata[0].short_description,
                code: appdata[0].code
            })
            .then(result => {
                if (result) {
                    db.collection(collecName).deleteOne(dataToDelete, function (err, obj) {
                        if (obj.deletedCount > 0) {
                            let obj1 = {
                                action: "api_deleted",
                                data: appdata[0],
                                user_id: req.session.user_id,
                                ip_address: ipAddress.ipAddress(req)
                            }
                            systemLog.logData(obj1)
                            return responseData(res, true, 200, "success", { obj1 });
                        } else {
                            var err2 = [err];
                            return responseData(res, false, 404, "Error", { err2 });
                        }
                    });
                } else {
                    return responseData(res, false, 404, "Error");
                }
            })
    } catch (err) {
        console.log("error ", err);
        return responseData(res, false, 500);
    }
}

// get api services by app-code 
module.exports.getApisByAppCode = async (req, res) => {
    try {
        const db = getDb();
        let collecName = common.collectionNameGenerator(req.headers, 'api_managements')
        db.collection(collecName)
            .find({ app_code: req.body.appCode })
            .toArray()
            .then(apis => {
                if (apis.length > 0) {
                    let uniqueGroupArr = [...new Set(apis.map(data => data.group_code))]
                    console.log(true)
                    return responseData(res, true, 200, "success", uniqueGroupArr);
                } else {
                    console.log(false)
                    return responseData(res, false, 204, "failure");
                }
            })
    } catch (error) {
        console.log("error : ", error);
        return responseData(res, false, 500);
    }
}

// get api services by api id
module.exports.getApisByAppIds = async (req, res) => {
    try {
        let searchArray = []
        req.body.forEach(element => searchArray.push(ObjectId(element)));
        const db = getDb();
        let collecName = common.collectionNameGenerator(req.headers, 'api_managements')

        db.collection(collecName)
            .aggregate([{
                $match: {
                    'app_id': {
                        $in: searchArray
                    }
                }
            },
            {
                $sort: {
                    app_code: 1
                }
            }
            ])
            .project({ _id: 1, api_url: 1, app_code: 1, code: 1 })
            .toArray()
            .then(async (apis) => {
                // console.log(apis)
                apis = await appCodeWiseSeperator(apis)
                // console.log(apis)
                if (Object.keys(apis).length > 0) {
                    console.log(true)
                    return responseData(res, true, 200, "success", apis);
                } else {
                    console.log(false)
                    return responseData(res, false, 204, "failure");
                }
            })
    } catch (error) {
        console.log("error : ", error);
        return responseData(res, false, 500);
    }
}


module.exports.getAllApiDataByAppCode = async function (req, res) {
    try {
        const db = getDb();
        db.collection('api_managements')
            .find(req.body.appCode)
            .toArray()
            .then(api => {
                return res.status(200).send({ status: 'success', api });
            })
    } catch (err) {
        console.log("error ", err);
        return responseData(res, false, 500);
    }
}

// get api services by group-code
module.exports.getApisByGroupCode = async (req, res) => {
    try {
        const db = getDb();
        // db.collection('api_managements')
        let collecName = common.collectionNameGenerator(req.headers, 'api_managements')
        db.collection(collecName)
            .find({ group_code: req.body.groupCode })
            .toArray()
            .then(apis => {
                if (apis.length > 0) {
                    console.log(true)
                    return responseData(res, true, 200, "success", apis);
                } else {
                    console.log(false)
                    return responseData(res, false, 204, "failure");
                }
            })
    } catch (error) {
        console.log("error : ", error);
        return responseData(res, false, 500);
    }
}

module.exports.getAllApiDataByAppId = async function (req, res) {
    try {
        const db = getDb();
        let collecName = common.collectionNameGenerator(req.headers, 'api_managements')

        var api = await db.collection(collecName)
            .aggregate([{ $match: { app_id: ObjectId(req.body.app_id) } }])
            .project({ _id: 1, group_code: 1, api_url: 1, status: 1, code: 1, short_description: 1, api_method: 1, created_time: 1, modified_time: 1 })
            .toArray()

        if (api.length) {
            for (const element of api) {
                var last_update = element.modified_time;
                if (element.modified_time == element.created_time) {
                    element.last_update = "NA";
                } else {
                    element.last_update = common.momentTimeZone(req, last_update);
                }
            }
        }
        return res.status(200).send({ status: 'success', api });

    } catch (err) {
        console.log("error ", err);
        return responseData(res, false, 500);
    }
}

module.exports.isApiNameAlreadyExist = async function (req, res) {
    try {
        const db = getDb();
        let collecName = common.collectionNameGenerator(req.headers, 'api_managements')

        db.collection(collecName)
            .find({ code: req.body.apiname })
            .toArray()
            .then(apiname => {
                if (apiname.length > 0) {
                    console.log("APIName-Exist : ", true)
                    return responseData(res, true, 200, "success");
                } else {
                    console.log("APIName-NotExist : ", false)
                    return responseData(res, false, 204, "failure");
                }
            })
    } catch (error) {
        console.log("error : ", error);
        return responseData(res, false, 500);
    }
}

module.exports.isApiCodeAlreadyExist = async function (req, res) {
    try {
        const db = getDb();
        let collecName = common.collectionNameGenerator(req.headers, 'api_managements')

        db.collection(collecName)
            .find({ code: req.body.code, app_id: ObjectId(req.body.app_id) })
            .toArray()
            .then(apicode => {
                if (apicode.length > 0) {
                    console.log("APICode-Exist : ", true)
                    return responseData(res, true, 200, "success");
                } else {
                    console.log("APICode-NotExist : ", false)
                    return responseData(res, false, 200, "failure");
                }
            })
    } catch (error) {
        console.log("error : ", error);
        return responseData(res, false, 500);
    }
}

module.exports.updateApiStatus = async function (req, res) {
    try {
        let { body } = req
        console.log("body.status", body.status);
        let modified_by = req.user._id
        const db = getDb();
        let collecName = common.collectionNameGenerator(req.headers, 'api_managements')

        var olddata = await db.collection(collecName)
            .find({ _id: ObjectId(body.id) })
            .project({ short_description: 1, status: 1 })
            .toArray()
        olddata = olddata[0]
        console.log("::::::::::::::::::::::::::::: ", olddata, body.status == 1 ? true : false);
        olddata.status = olddata.status == 1 ? true : false
        var newdata = {
            short_description: olddata.short_description,
            status: body.status == 1 ? true : false
        }
        db.collection(collecName)
            .updateOne({
                _id: ObjectId(body.id)
            }, {
                $set: {
                    status: body.status ? 1 : 0,
                    modified_by: modified_by,
                    modified_time: Math.floor(((new Date()).getTime()) / 1000),
                }
            })
            .then(result => {
                if (result) {
                    let dataObj = { before: olddata, after: newdata }
                    dataObj = systemLog.auditLogFieldsObjectStatus(dataObj)
                    let obj1 = {
                        action: "api_status_updated",
                        data: dataObj,
                        user_id: req.session.user_id,
                        ip_address: ipAddress.ipAddress(req)
                    }
                    console.log("==========obj1 in System Log Data===========", obj1);
                    systemLog.logData(obj1)
                    return responseData(res, true, 200, "success", result.result);
                } else {
                    console.log(false)
                    return responseData(res, false, 204, "failure");
                }
            })
    } catch (error) {
        console.log("error : ", error);
        return responseData(res, false, 500);
    }
}

module.exports.GetApplicationCategories = async function (req, res) {
    try {
        const db = getDb();
        let collecName = common.collectionNameGenerator(req.headers, 'api_managements')

        db.collection(collecName)
            .find({ app_id: ObjectId(req.body.app_id) })
            .toArray()
            .then(apis => {
                if (apis.length > 0) {
                    let uniqueGroupArr = [...new Set(apis.map(data => data.group_code))]
                    // console.log("resp-->>", uniqueGroupArr)
                    return responseData(res, true, 200, "success", uniqueGroupArr);
                } else {
                    console.log(false)
                    return responseData(res, false, 204, "failure");
                }
            })
    } catch (error) {
        console.log("error : ", error);
        return responseData(res, false, 500);
    }
}

module.exports.getEnvUrls = async function (req, res) {
    try {
        const db = req.app.db;
        let router_urls = config.router_url;
        let environment_url = ''
        if (config.tenant == 'multi' && req.headers.hasOwnProperty('t_id')) {

            let data = await db.collection('tenants')
                .find({ _id: ObjectId(req.headers.t_id) })
                .toArray()
            // console.log("dddddd", data)
            environment_url = data && data.length > 0 && data[0].base_url ? data[0].base_url : '';
        }
        if (config.tenant == 'single') {
            environment_url = config.environment_url
        }
        console.log(" router_urls => ", router_urls);
        const urls = { router_urls: router_urls, environment_url: environment_url }
        return res.status(200).send({ status: 'success', data: urls });
    } catch (err) {
        console.log("error ", err);
        return responseData(res, false, 500);
    }
}

module.exports.bulkInsertApi = async function (req, res) {
    try {
        const db = getDb();
        let created_by = req.user._id;
        let pathValue = req.body.path.trim();
        const fork = require('child_process').fork;
        console.log("child process path", config);
        const ls = fork(path.join(process.cwd(), config.child_process_path, 'main.js'));

        if (!(req.body.path && req.body.app_id)) {
            return responseData(res, false, 500);
        }
        if (req.body.type != 'File') {

            if (!(pathValue.startsWith("https://www.postman.com/collections/") || pathValue.startsWith("https://www.getpostman.com/collections/"))) {

                return responseData(res, false, 200, "Error")
            }
            let data = await request.get(req.body.path);

            if (data == undefined) { return responseData(res, false, 200, "Error") }
        }
        let dataObj = {
            type: req.body.type,
            status: "initiated",
            app_id: req.body.app_id,
            collection_name: req.body.path,
            created_by: created_by,
            reset_documentation: false,
            uploaded_time: Math.floor(((new Date()).getTime()) / 1000),
        };
        let collecName = common.collectionNameGenerator(req.headers, 'api_bulk_uploads')

        db.collection(collecName)
            .insertOne(dataObj)
            .then(result => {
                ls.send({
                    process: 'bulk-api-process',
                    query: 'upload',
                    type: req.body.type,
                    app_id: req.body.app_id,
                    idVal: result.insertedId,
                    file_path: req.body.path,
                    api_code: req.body.api_code,
                    app_code: req.body.app_code,
                    created_by: created_by,
                    headers: req.headers
                });

                let obj = {
                    action: "api_bulk_upload",
                    data: dataObj,
                    user_id: req.session.user_id,
                    ip_address: ipAddress.ipAddress(req)
                }
                systemLog.logData(obj)
                return responseData(res, true, 200, "success");
            })
            .catch((err) => {
                console.log(err);

            });

    } catch (err) {
        console.log("error ", err);
        return responseData(res, false, 500);
    }
}

module.exports.getAllApiUploads = async function (req, res) {
    try {
        const db = getDb();
        let collecName = common.collectionNameGenerator(req.headers, 'api_bulk_uploads')

        var skip = (req.body.page - 1) * 10;
        var totalcount = await db.collection(collecName).find().count()
        var apis = await db.collection(collecName)
            .find()
            .sort({ _id: -1 })
            .skip(skip)
            .limit(10)
            .toArray()
        var data = {
            apis: apis,
            totalCount: totalcount
        }
        if (apis.length > 0) {

            return responseData(res, true, 200, "success", data);
        } else {
            return responseData(res, false, 204, "failure");
        }
    } catch (err) {
        console.log("error ", err);
        return responseData(res, false, 500);
    }
}

module.exports.getBulkUploads = async function (req, res) {
    try {
        const db = getDb();
        let collecName = common.collectionNameGenerator(req.headers, 'api_bulk_uploads')
        let collecName1 = common.collectionNameGenerator(req.headers, 'applications')

        var skip = (req.body.page - 1) * 10;
        var totalcount = await db.collection(collecName).find().count()
        var apis = await db.collection(collecName)
            .find()
            .sort({ _id: -1 })
            .skip(skip)
            .limit(10)
            .toArray()
        let created_by_comp = [];
        let app_id_comp = [];
        var applicationName, created_By, app_id;
        for (const a of apis) {
            if (a.created_by) {
                created_by_comp.push(ObjectId(a.created_by));
            }
            if (a.app_id) {
                app_id_comp.push(ObjectId(a.app_id));
            }
        }
        var apiData = [];
        var user = await db.collection('users').find({ _id: { $in: created_by_comp } }).toArray()
        var application1 = await db.collection(collecName1).find({ _id: { $in: app_id_comp } }).toArray()

        if (apis.length > 0) {

            for (const element of apis) {
                for (const User of user) {

                    if (element.created_by) {
                        if (User._id == element.created_by) {
                            created_By = User.first_name
                            break;
                        } else {
                            created_By = 'NA'
                        }
                    } else {
                        if (element.uploaded_by) {
                            created_By = element.uploaded_by
                        } else {
                            created_By = 'NA'
                        }
                    }
                }

                for (const Application of application1) {
                    if (element.app_id) {
                        if (Application._id == element.app_id) {
                            applicationName = Application.name;
                            app_id = Application._id;
                            break;
                        } else {
                            applicationName = 'NA'
                        }
                    } else {
                        applicationName = 'NA'
                    }
                }

                if (typeof (element.uploaded_time) == "string") {
                    var time = new Date(new Date(new Date(element.uploaded_time)).toUTCString()).toLocaleString(undefined, { timeZone: 'Asia/Kolkata' })
                } else {
                    time = new Date(new Date(new Date(element.uploaded_time * 1000)).toUTCString()).toLocaleString(undefined, { timeZone: 'Asia/Kolkata' })
                }
                apiData.push({
                    "fileName": element.collection_name,
                    "applicationName": applicationName,
                    "status": element.status,
                    "createdTime": time,
                    "app_id": app_id,
                    "id": element._id,
                    "userName": created_By,
                    "reset_documentation": element.reset_documentation
                })
            }
            var data = {
                apis: apiData,
                totalCount: totalcount
            }
            return responseData(res, true, 200, "success", data);
        } else {
            return responseData(res, false, 204, "failure");
        }
    } catch (err) {
        console.log("error ", err);
        return responseData(res, false, 500);
    }
}

module.exports.apiUploads = async function (req, res) {
    try {
        const db = getDb();
        let collecName = common.collectionNameGenerator(req.headers, 'api_bulk_uploads')

        var apis = await db.collection(collecName).find({ _id: ObjectId(req.body.id) }).toArray()

        if (apis.length > 0) {

            return responseData(res, true, 200, "success", apis);
        } else {
            return responseData(res, false, 204, "failure");
        }
    } catch (err) {
        console.log("error ", err);
        return responseData(res, false, 500);
    }
}

module.exports.jsonFileUpdate = async function (req, res) {
    try {
        let result = await readFile(req.body.filePath);
        result = await JSON.parse(result);

        if (result.info && result.info.schema) {
            return responseData(res, true, 200, "yes");
        }

        return responseData(res, true, 200, "no");
    } catch (err) {
        console.log(err);
        return responseData(res, false, 500, "False");
    }

}

module.exports.getbulkUploadViewDetails = async function (req, res) {
    try {
        console.log('req body', req.body);
        var collection_name = "api_upload_" + req.body.id
        const db = getDb();
        console.log("collection_name value is here", collection_name);
        var bulkapiDetailsData = await db.collection("api_bulk_uploads")
            .find({ _id: ObjectId(req.body.id) })
            .project({
                data: 1,
                _id: 0
            })
            .toArray()
        console.log(bulkapiDetailsData, bulkapiDetailsData[0].data, "data is completed");
        if (bulkapiDetailsData && bulkapiDetailsData[0].data) {
            bulkapiDetailsData[0].data.forEach(item => {
                item.created_time = new Date(item.created_time * 1000)
                if (!item.message && !item.api_status && item.message == undefined && !item.api_status) {
                    item.message = "Fail"
                } else if (item.message == undefined && item.api_status) {
                    item.message = "Success"
                }
            })
            console.log(bulkapiDetailsData[0].data);
            let obj = { bulkapiDetails: bulkapiDetailsData[0].data }
            return res.status(200).send({ status: 'success', data: obj });
        } else {
            return res.status(200).send({ status: false, data: {} });
        }
    } catch (err) {
        console.log("error ", err);
        return responseData(res, false, 500);
    }
}

function readFile(file_path) {
    //__dirname
    const filePath = path.resolve(process.cwd(), `uploads/apis/${file_path}`);
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', function (err, data) {
            if (err) {
                console.log(err);
            }
            resolve(data);
        });
    });
}


function appCodeWiseSeperator(apis) {
    return new Promise((resolve, reject) => {
        let sortedData = {}
        apis.forEach(element => {
            if (sortedData[element.app_code]) {
                sortedData[element.app_code].push(element)
            } else {
                sortedData[element.app_code] = []
                sortedData[element.app_code].push(element)
            }
        })
        resolve(sortedData)
    })
}

module.exports.isApiUrlAlreadyExist = async function (req, res) {
    try {
        console.log("Api URL body is:--> req-->>", req.body);
        const db = getDb();
        let collecName = common.collectionNameGenerator(req.headers, 'api_managements')

        db.collection(collecName)
            .find({ api_url: req.body.url, app_id: ObjectId(req.body.app_id), api_method: req.body.method })
            .toArray()
            .then(apiurl => {
                if (apiurl.length > 0) {
                    // console.log("API-URL-Exist : ", true)
                    return responseData(res, true, 200, "success");
                } else {
                    //console.log("API-URL-NotExist : ", false)
                    return responseData(res, false, 200, "failure");
                }
            })
    } catch (error) {
        console.log("error : ", error);
        return responseData(res, false, 500);
    }
}
