const { responseData } = require('../utils/responseHandler');
const getDb = require('../utils/database').getDb;
const ObjectId = require('mongodb').ObjectId;

const systemLog = require('../services/systemLog');
const ipAddress = require('../utils/common');
const common = require('../utils/common')


module.exports.insertIp = async function (req, res) {
    try {
        console.log("Access IP insert : ", req.body);
        let { headers, body } = req
        // let user = jwt.decode(headers.authorization.split(" ")[1])
        let created_by = req.user._id
        const db = getDb();
        console.log(body);
        // db.collection('access_controls')
        let collecName = common.collectionNameGenerator(req.headers, 'access_controls')
        db.collection(collecName)
            .insertOne({
                ip_name: body.ipName,
                description: body.description,
                ip_type: body.ipType,
                mask: body.mask,
                ip_address: body.ipAddress,
                access: body.access,
                status: body.status,
                created_by: created_by,
                created_time: Math.floor(((new Date()).getTime()) / 1000)
            })
            .then(result => {
                if (result) {
                    let dataObj = systemLog.auditLogFieldsObject(result.ops[0])
                    let obj1 = {
                        action: "access_control_ip_created",
                        data: dataObj,
                        user_id: req.session.user_id,
                        ip_address: ipAddress.ipAddress(req)
                    }
                    systemLog.logData(obj1)
                    return responseData(res, true, 200, "success", result);
                }
            })


    }
    catch (err) {
        console.log("error ", err);
        return responseData(res, false, 500);
    }
}

module.exports.getIP = async function (req, res) {
    console.log('req body getIP', req.body);
    try {
        const db = getDb();
        // db.collection('access_controls')
        let collecName = common.collectionNameGenerator(req.headers, 'access_controls')
        db.collection(collecName)
            .findOne(ObjectId(req.body.id))
            .then(result => {
                return res.status(200).send({ status: 'success', data: result });
            })
    }
    catch (err) {
        console.log("error ", err);
        return responseData(res, false, 500);
    }
}

module.exports.getAllIPs = async function (req, res) {
    // console.log('req body getIP', req.body);
    try {
        const db = getDb();

        let collecName = common.collectionNameGenerator(req.headers, 'access_controls')

        var result = await db.collection(collecName)
            .find()
            .toArray();
        if (result && result.length) {
            console.log('result--------->', result);
            for (const element of result) {
                var last_update = element.modified_time ? element.modified_time : element.created_time;
                element.last_update = common.momentTimeZone(req, last_update);
            }
        }
        return res.status(200).send({ status: 'success', data: result });

    }
    catch (err) {
        console.log("error ", err);
        return responseData(res, false, 500);
    }
}

module.exports.updateIP = async function (req, res) {
    try {
        // console.log("Access IP update : ", req.body);
        let { headers, body } = req
        // let user = jwt.decode(headers.authorization.split(" ")[1])
        body.data.modified_by = req.user._id
        body.data.modified_time = Math.floor(((new Date()).getTime()) / 1000);
        // console.log(body.data);
        const db = getDb();
        let collecName = common.collectionNameGenerator(req.headers, 'access_controls')


        var oldData = await db.collection(collecName)
            .find(ObjectId(body.id))
            .toArray()
        console.log(oldData, body.data);
        db.collection(collecName).updateOne({ '_id': ObjectId(body.id) }, { $set: body.data }, function (err, obj) {
            if (obj) {
                delete oldData[0]["id"]
                delete body.data["id"]
                let dataObj = { before: oldData[0], after: body.data }
                dataObj = systemLog.auditLogFieldsObject(dataObj)
                let obj1 = {
                    action: "access_control_updated",
                    data: dataObj,
                    user_id: req.session.user_id,
                    ip_address: ipAddress.ipAddress(req)
                }
                systemLog.logData(obj1)
                return responseData(res, true, 200, "success", obj);
            }
            else {
                return responseData(res, false, 404, "Error", err);
            }
        });
    }
    catch (err) {
        console.log("error ", err);
        return responseData(res, false, 500);
    }
}

module.exports.deleteIP = async function (req, res) {
    try {
        // let user = jwt.decode(req.headers.authorization.split(" ")[1]);

        let dataToDelete = { _id: ObjectId(req.body.id) }
        const db = getDb();
        let collecName = common.collectionNameGenerator(req.headers, 'access_controls')

        var data = await db.collection(collecName).findOne({ _id: ObjectId(req.body.id) })
        let created_by = req.user._id
        let created_on = Math.floor(((new Date()).getTime()) / 1000);

        let collecName1 = common.collectionNameGenerator(req.headers, 'raw_appdata')
        // db.collection('raw_appdata')
        db.collection(collecName1)
            .insertOne({
                type: "access-control",
                app_data: JSON.stringify(data),
                created_by: created_by,
                created_on: created_on,
                name: data.ip_name,
                code: data.ip_name
            })
            .then(result => {
                // console.log('result =>', result);
                // console.log("data to delete ", dataToDelete);
                if (result) {
                    let dataObj = systemLog.auditLogFieldsObject(data)
                    let obj1 = {
                        action: "access_control_deleted",
                        data: dataObj,
                        user_id: req.session.user_id,
                        ip_address: ipAddress.ipAddress(req)
                    }
                    systemLog.logData(obj1)
                    db.collection(collecName).deleteOne(dataToDelete, function (err, obj) {

                        if (obj.deletedCount > 0) {
                            return responseData(res, true, 200, "success", { obj });
                        }
                        else {
                            var err = [err];
                            return responseData(res, false, 404, "Error", { err });
                        }
                    });
                }
                else {
                    return responseData(res, false, 404, "Error");
                }
            })
    }
    catch (err) {
        console.log("error ", err);
        return responseData(res, false, 500);
    }
}

module.exports.updateIPstatus = async function (req, res) {
    try {
        let { headers, body } = req
        // console.log("body : ", body);
        // let user = jwt.decode(headers.authorization.split(" ")[1])
        let modified_by = req.user._id
        const db = getDb();
        // db.collection('access_controls')
        let collecName = common.collectionNameGenerator(req.headers, 'access_controls')
        db.collection(collecName)
            .updateOne(
                {
                    _id: ObjectId(body.id)
                },
                {
                    $set: {
                        status: body.status ? true : false,
                        modified_by: modified_by,
                        modified_time: Math.floor(((new Date()).getTime()) / 1000),
                    }
                })
            .then(result => {
                if (result) {
                    // console.log(true, result)
                    return responseData(res, true, 200, "success", result);
                }
                else {
                    console.log(false)
                    return responseData(res, false, 204, "failure");
                }
            })
    }
    catch (error) {
        console.log("error : ", error);
        return responseData(res, false, 500);
    }
}