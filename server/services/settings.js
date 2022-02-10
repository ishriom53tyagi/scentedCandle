const { responseData } = require('../utils/responseHandler');
const config = require('../config')
const getDb = require('../utils/database').getDb;
const ObjectId = require('mongodb').ObjectId;
const systemLog = require('../services/systemLog');
const ipAddress = require('../utils/common');
const cache = require('../utils/nodeCache');


module.exports.insertSettings = async function (req, res) {
    try {
        let body = req.body


        console.log("this is request for config", body)
        if (body && body.obj1) {

            var action = ''
            if (body.obj1[2] && body.obj1[2] == 'add')
                action = { $push: body.obj1[0] }
            if (body.obj1[2] && body.obj1[2] == 'update')
                action = { $set: body.obj1[0] }
            if (body.obj1[2] && body.obj1[2] == 'delete')
                action = { $pull: body.obj1[0] }
            var name = body.obj1[1];
            var key = Object.keys(body.obj1[0])
            key = (key[0].split('.'))[1]
            var value = (Object.values(body.obj1[0]))[0]
            const db = getDb();
            let newValues = {};
            var olddata = await db.collection("settings").findOne();
            newValues[key] = value
            var data = {}
           
            if (name == 'security' && olddata) {
                let flag;
                flag = olddata.security && olddata.security[key] ? true : false;
                if (flag) {
                    data[key] = olddata.security[key]
                }

            }
            console.log("iactionnnnnne", action)
            db.collection("settings").findOneAndUpdate({}, action, { upsert: true }, async function (err, obj) {

                if (obj) {
                    console.log("after update", obj)
                    cache.delete("settings");
                    let dataObj, acc;
                    if (body.obj1[2] == 'update') {
                        dataObj = { before: data, after: newValues }
                        acc = "setting_updated"
                    }
                    if (body.obj1[2] == 'add') {
                        dataObj = newValues
                        acc = "setting_added"
                    }
                    if (body.obj1[2] == 'delete') {
                        dataObj = newValues
                        acc = "setting_deleted"
                    }

                    dataObj = systemLog.auditLogFieldsObject(dataObj)
                    let obj2 = {
                        action: acc,
                        data: dataObj,
                        user_id: req.session.user_id,
                        ip_address: ipAddress.ipAddress(req)
                    }

                    systemLog.logData(obj2)
                    return responseData(res, true, 200, "success", obj);
                } else {
                    console.log("inside elsee", err)
                    return responseData(res, false, 404, "Error");
                }
            });

        }
        else {
            return responseData(res, false, 404, "Error");
        }

    } catch (err) {
        console.log("error ", err);
        return responseData(res, false, 500);
    }
}

module.exports.getSettingsData = async function (req, res) {
    try {
        const db = getDb();
        var result = await db.collection('settings').find().toArray();
        console.log(result);
        return responseData(res, true, 200, "success", result[0]);
    } catch (err) {
        console.log("error ", err);
        return responseData(res, false, 500);
    }
}

module.exports.getSettingsId = async function (req, res) {
    try {
        const db = getDb();
        db.listCollections({ name: "settings" })
            .next(function (err, collinfo) {
                if (collinfo) {
                    db.collection('settings')
                        .find()
                        .project({ _id: 1 })
                        .toArray()
                        .then(result => {
                            return responseData(res, true, 200, "success", result);
                        })
                } else {
                    return responseData(res, false, 200, "no data", null);
                }
            });

    } catch (err) {
        console.log("error ", err);
        return responseData(res, false, 500);
    }
};


module.exports.getConfigurations = function (req) {
    return new Promise(async (resolve, reject) => {
        try {
            const db = req.app.db;
            var cacheTimezoneResult;
            if (!cache.has("configurations")) {
                var dbConfigResult = await db.collection('configurations')
                    .find()
                    .toArray();
                if (dbConfigResult.length && dbConfigResult[0].frontend) {
                    dbConfigResult[0].frontend.timezone = dbConfigResult[0].frontend.timezone ? dbConfigResult[0].frontend.timezone : 'Asia/Kolkata';
                    cacheTimezoneResult = dbConfigResult[0]
                    await cache.set("configurations", cacheTimezoneResult)
                }
            } else {
                cacheTimezoneResult = cache.get('configurations');
            }
            resolve(cacheTimezoneResult);
        } catch (err) {
            console.log("error ", err);
            resolve();
        }
    })
}