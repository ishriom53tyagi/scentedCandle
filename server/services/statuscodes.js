const { responseData } = require('../utils/responseHandler');
const getDb = require('../utils/database').getDb;
const ObjectId = require('mongodb').ObjectId;
const jwt = require('jsonwebtoken');
const systemLog = require('../services/systemLog');
const ipAddress = require('../utils/common');
const common = require('../utils/common')

module.exports.checkCodeExists = async function (req, res) {
    try {
        const db = getDb()
        var codeExists = await db.collection('status_codes')
            .find({ code: req.body.code })
            .count()
        if (codeExists > 0) {
            return responseData(res, true, 200, "Code Already Exists", codeExists);
        } else {
            return responseData(res, false, 200, "", codeExists);
        }
    } catch (err) {
        return responseData(res, false, 500);
    }
}

module.exports.checkMessageExists = async function (req, res) {
    try {
        const db = getDb()
        var codeArr = await db.collection('status_codes')
            .find()
            .toArray()
        let msgExists = codeArr.filter(i => i.message.toLowerCase() === req.body.message.toLowerCase())

        if (msgExists.length > 0) {
            return responseData(res, true, 200, "Message Already Exists", msgExists);
        } else {
            return responseData(res, false, 200, "", msgExists);
        }
    } catch (err) {
        return responseData(res, false, 500);
    }
}

module.exports.getAllStatusCodes = async function (req, res) {
    try {
        const db = getDb();
        var statuscodes = await db.collection('status_codes')
            .find()
            .project({ _id: 1, code: 1, message: 1, created_time: 1, modified_time: 1 })
            .sort({ modified_time: -1 })
            .toArray()
        for (const element of statuscodes) {
            var last_update = element.modified_time ? element.modified_time : element.created_time;
            element.last_update = await common.momentTimeZone(req, last_update);
        }
        return responseData(res, true, 200, "success", statuscodes);

    } catch (error) {
        return responseData(res, false, 500);
    }
}

module.exports.insertStatusCode = async function (req, res) {
    try {
        let { body } = req
        let created_by = req.user._id
        const db = getDb();
        console.log(body);
        db.collection('status_codes')
            .insertOne({
                code: body.code,
                message: body.message,
                type: body.type,
                created_by: created_by,
                created_time: Math.floor(((new Date()).getTime()) / 1000),
                modified_by: created_by,
                modified_time: Math.floor(((new Date()).getTime()) / 1000)
            })
            .then(result => {
                if (result) {
                    let dataObj = systemLog.auditLogFieldsObject(result.ops[0])
                    let obj1 = {
                        action: "status_code_created",
                        data: dataObj,
                        user_id: req.session.user_id,
                        ip_address: ipAddress.ipAddress(req)
                    }
                    systemLog.logData(obj1)
                    return responseData(res, true, 200, "success", result);
                }
            })


    } catch (err) {
        console.log("error ", err);
        return responseData(res, false, 500);
    }
}

module.exports.getStatusCode = async function (req, res) {
    try {
        const db = getDb();
        db.collection('status_codes')
            .find(ObjectId(req.body.id))
            .toArray()
            .then(statuscodes => {
                return res.status(200).send({ status: 'success', data: statuscodes });
            })
    } catch (err) {
        console.log("error ", err);
        return responseData(res, false, 500);
    }
}

module.exports.updateStatusCode = async function (req, res) {
    try {
        let { body } = req
        body.data.modified_by = req.user._id;
        body.data.modified_time = Math.floor(((new Date()).getTime()) / 1000);
        console.log(body.data);
        const db = getDb();
        var oldData = await db.collection('status_codes')
            .find(ObjectId(body.id))
            .toArray()
        db.collection("status_codes").updateOne({ '_id': ObjectId(body.id) }, { $set: body.data }, function (err, obj) {
            if (obj) {
                delete oldData[0]["id"]
                delete body.data["id"]
                let dataObj = { before: oldData[0], after: body.data }
                dataObj = systemLog.auditLogFieldsObject(dataObj)
                let obj1 = {
                    action: "status_code_updated",
                    data: dataObj,
                    user_id: req.session.user_id,
                    ip_address: ipAddress.ipAddress(req)
                }
                systemLog.logData(obj1)
                return responseData(res, true, 200, "success", obj);
            } else {
                return responseData(res, false, 404, "Error", err);
            }
        });
    } catch (err) {
        console.log("error ", err);
        return responseData(res, false, 500);
    }
}

module.exports.deleteStatusCode = async function (req, res) {
    try {
        let dataToDelete = { _id: ObjectId(req.body.id) }
        const db = getDb();
        let statuscodeData = req.body.data
        let created_by = req.user._id;
        let created_on = Math.floor(((new Date()).getTime()) / 1000);
        let collecName = common.collectionNameGenerator(req.headers, 'raw_appdata')

        db.collection(collecName)
            .insertOne({
                type: "status-code",
                app_data: JSON.stringify(statuscodeData),
                created_by: created_by,
                created_on: created_on,
                name: statuscodeData.message,
                code: statuscodeData.code
            })
            .then(result => {
                if (result) {
                    let dataObj = systemLog.auditLogFieldsObject(statuscodeData)
                    let obj1 = {
                        action: "status_code_deleted",
                        data: dataObj,
                        user_id: req.session.user_id,
                        ip_address: ipAddress.ipAddress(req)
                    }
                    systemLog.logData(obj1)
                    db.collection("status_codes").deleteOne(dataToDelete, function (err, obj) {

                        if (obj.deletedCount > 0) {
                            return responseData(res, true, 200, "success", { obj });
                        } else {
                            var err1 = [err];
                            return responseData(res, false, 404, "Error", { err1 });
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

module.exports.defaultStatusCodes = async function (req, res) {
    try {
        var status_codes = [{ code: '301', message: 'API authentication failed' },
        { code: '302', message: 'Invalid credentials' },
        { code: '303', message: 'insufficient access' },
        { code: '304', message: 'Autherization Error' },
        {
            code: '305',
            message: 'Authorization header should not be blank'
        },
        { code: '200', message: 'Success' },
        { code: '401', message: 'Invalid Method' },
        { code: '402', message: 'Invalid Parameters' },
        {
            code: '400',
            message: 'Invalid Request please check documentation or contact to service provider'
        },
        { code: '800', message: 'No results found' },
        { code: '601', message: 'Gateway timeout error' },
        { code: '500', message: 'Internal Server Error' },
        { code: '801', message: 'No results' },
        { code: '700', message: 'Parameters not found' }
        ]
        const db = getDb();
        await db.collection('status_codes')
            .insertMany(status_codes)
            .then(result => {
                if (result) {
                    console.log("status codes collection created", true)
                    return responseData(res, true, 200, "success", result);
                } else {
                    return responseData(res, false, 200, "fail", result);
                }
            })

    } catch (err) {
        console.log("Error ", err);
        return responseData(res, false, 500);
    }
}