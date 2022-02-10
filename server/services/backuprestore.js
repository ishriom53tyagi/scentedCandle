const { responseData } = require('../utils/responseHandler');
const config = require('../config')
const getDb = require('../utils/database').getDb;
const ObjectId = require('mongodb').ObjectId;
const jwt = require('jsonwebtoken');
const systemLog = require('../services/systemLog');
const ipAddress = require('../utils/common');
const common = require('../utils/common')


module.exports.getRawAppData = async function (req, res) {
    try {
        const db = getDb();
        let findObj;
        let selected_date = req.body.date ? new Date(req.body.date) : ""
        let end_date;
        req.body.type = req.body.type == "all" ? "" : req.body.type
        if (selected_date) {
            end_date = new Date(req.body.date);
            end_date.setDate(end_date.getDate() + 1);
            console.log('selected_date: ', selected_date, end_date);
            selected_date = Math.floor(((selected_date).getTime()) / 1000);
            end_date = Math.floor(((end_date).getTime()) / 1000);
        }

        if (selected_date) {
            if (req.body.type && req.body.type != "") {
                findObj = { created_on: { $gte: selected_date, $lt: end_date }, type: req.body.type }
            } else {
                findObj = { created_on: { $gte: selected_date, $lt: end_date } }
            }
        } else {
            if (req.body.type && req.body.type != "") {
                findObj = { type: req.body.type }
            } else {
                findObj = {}
            }
        }


        console.log('findObj : ', findObj);
        let limit = req.body.limit
        let offset = req.body.offset
        let collecName = common.collectionNameGenerator(req.headers, 'raw_appdata')

        var rawAppdata = await db.collection(collecName)
            .find(findObj).sort({ created_on: -1 })
            .project({ code: 1, name: 1, created_on: 1, created_by: 1, type: 1 })
            .skip(offset ? offset : 0)
            .limit(limit ? limit : 10)
            .toArray()
        var rawAppdataCount = await db.collection(collecName)
            .find(findObj)
            .count()

        for (let i = 0; i < rawAppdata.length; i++) {
            const element = rawAppdata[i];
            var username = await db.collection('users')
                .find({ _id: ObjectId(element.created_by) })
                .project({ first_name: 1 })
                .toArray()
            console.log(username);
            element.username = username.length > 0 ? username[0].first_name : 'NA'
            element.created_on = common.momentTimeZone(req, element.created_on);
        }
        console.log('raw app data ===>>', rawAppdata.length);
        return res.status(200).send({ status: 'success', data: rawAppdata, count: rawAppdataCount });

    } catch (error) {
        console.log("Error ", error);
        return responseData(res, false, 500);
    }
}

module.exports.restoreAppData = async function (req, res) {
    try {
        const db = getDb();
        let collecName = common.collectionNameGenerator(req.headers, 'raw_appdata')
        let collecName1 = common.collectionNameGenerator(req.headers, 'applications')

        var appData = await db.collection(collecName)
            .find(ObjectId(req.body.id))
            .toArray()
        console.log(appData);
        let dataToDelete = { _id: ObjectId(req.body.id) }
        var restoredAppData = appData[0]
        let appCollection, body;
        var appCode = await db.collection(collecName1)
            .find({ code: appData[0].code })
            .project({ code: 1 })
            .toArray()

        switch (appData[0].type) {
            case 'application':
                appCollection = "applications_" + req.headers.t_id;
                body = JSON.parse(appData[0].app_data)
                break;
            case 'client':
                appCollection = "partners_" + req.headers.t_id;
                body = JSON.parse(appData[0].app_data)
                break;
            case 'api':
                appCollection = "api_managements_" + req.headers.t_id;
                body = JSON.parse(appData[0].app_data)
                body.app_id = ObjectId(body.app_id)
                break;
            case 'status-code':
                appCollection = "status_codes_" + req.headers.t_id;
                body = JSON.parse(appData[0].app_data)
                break;
            case 'configurations':
                appCollection = "configurations_" + req.headers.t_id;
                body = JSON.parse(appData[0].app_data)
                break;
            case 'access-control':
                appCollection = "access_controls_" + req.headers.t_id;
                body = JSON.parse(appData[0].app_data)
                break;

        }
        console.log("app exists => ", body);

        if (appCollection == 'partners' + req.headers.t_id) { body.application_code = body.application_code.map(element => ObjectId(element)) }
        if (appData.length > 0) {

            body.restored_by = req.user._id;
            body.restored_time = Math.floor(((new Date()).getTime()) / 1000);
            body._id = ObjectId(body._id)
            if (appCode.length > 0) {
                return responseData(res, false, 200, "Application Code already Exists", "");
            } else {
                db.collection(appCollection)
                    .insertOne(body)
                    .then(result => {
                        if (result) {
                            db.collection(collecName).deleteOne(dataToDelete, function (err, obj) {
                                if (obj.deletedCount > 0) {
                                    let dataObj = systemLog.auditLogFieldsObject(restoredAppData)
                                    let obj1 = {
                                        action: restoredAppData.type + "_restored",
                                        data: dataObj,
                                        user_id: req.session.user_id,
                                        ip_address: ipAddress.ipAddress(req)
                                    }
                                    systemLog.logData(obj1)
                                    return responseData(res, true, 200, "success", result);
                                } else {
                                    var err1 = [err];
                                    return responseData(res, false, 404, "Error", { err1 });
                                }
                            });

                        } else {
                            return responseData(res, false, 200, "fail", result);
                        }
                    })
            }
        } else {
            return responseData(res, false, 200, "fail", result);
        }

    } catch (err) {
        console.log("error ", err);
        return responseData(res, false, 500);
    }
}

module.exports.permanentlyDeleteAppData = async function (req, res) {
    try {
        const db = getDb();
        let collecName = common.collectionNameGenerator(req.headers, 'raw_appdata')

        var appData = await db.collection(collecName)
            .find(ObjectId(req.body.id))
            .toArray()
        var deletedAppData = appData[0]
        let dataToDelete = { _id: ObjectId(req.body.id) }
        db.collection(collecName).deleteOne(dataToDelete, function (err, obj) {
            let dataObj = systemLog.auditLogFieldsObject(deletedAppData)
            let obj1 = {
                action: deletedAppData.type + "_deleted_forever",
                data: dataObj,
                user_id: req.session.user_id,
                ip_address: ipAddress.ipAddress(req)
            }
            systemLog.logData(obj1)
            if (obj.deletedCount > 0) {
                return responseData(res, true, 200, "success", obj);
            } else {
                var err2 = [err];
                return responseData(res, false, 404, "Error", { err2 });
            }
        });

    } catch (err) {
        console.log("error ", err);
        return responseData(res, false, 500);
    }
}