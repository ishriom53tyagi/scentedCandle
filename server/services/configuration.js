const { responseData } = require('../utils/responseHandler');
const config = require('../config')
const getDb = require('../utils/database').getDb;
const ObjectId = require('mongodb').ObjectId;
const systemLog = require('../services/systemLog');
const ipAddress = require('../utils/common');
const cache = require('../utils/nodeCache');
const timeZoneFileData = require('../utils/timeZone.json');
const common = require('../utils/common');
module.exports.insertConfig = async function (req, res) {
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
            let collecName = common.collectionNameGenerator(req.headers, "configurations")

            var olddata = await db.collection(collecName).findOne();
            newValues[key] = value
            var data = {}
            if (name == 'frontend' && olddata) {
                let flag;
                flag = olddata.frontend && olddata.frontend[key] ? true : false;
                if (flag) {
                    data[key] = olddata.frontend[key]
                }

            }
            if (name == 'security' && olddata) {
                let flag;
                flag = olddata.security && olddata.security[key] ? true : false;
                if (flag) {
                    data[key] = olddata.security[key]
                }

            }
            console.log("iactionnnnnne", action)
            db.collection(collecName).findOneAndUpdate({}, action, { upsert: true }, async function (err, obj) {

                if (obj) {
                    console.log("after update", obj)
                    cache.delete("configurations");
                    let dataObj, acc;
                    if (body.obj1[2] == 'update') {
                        dataObj = { before: data, after: newValues }
                        acc = "configuration_updated"
                    }
                    if (body.obj1[2] == 'add') {
                        dataObj = newValues
                        acc = "configuration_added"
                    }
                    if (body.obj1[2] == 'delete') {
                        dataObj = newValues
                        acc = "configuration_deleted"
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

module.exports.getConfigData = async function (req, res) {
    try {
        var result = await module.exports.getConfigurations(req);
        return responseData(res, true, 200, "success", result);
    } catch (err) {
        console.log("error ", err);
        return responseData(res, false, 500);
    }
}

module.exports.getConfigId = async function (req, res) {
    try {
        const db = getDb();
        let collecName = common.collectionNameGenerator(req.headers, "configurations")

        db.listCollections({ name: "configurations" })
            .next(function (err, collinfo) {
                if (collinfo) {
                    db.collection(collecName)
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
module.exports.getTimeData = async function (req, res) {
    try {
        return responseData(res, true, 200, "success", timeZoneFileData);
    } catch (err) {
        console.log("error ", err);
        return responseData(res, false, 500);
    }
}
module.exports.getConfigurations = function (req) {
    return new Promise(async (resolve, reject) => {
        try {
            const db = req.app.db;
            let collecName = common.collectionNameGenerator(req.headers, "configurations")

            var cacheTimezoneResult;
            if (!cache.has(collecName)) {
                var dbConfigResult = await db.collection(collecName)
                    .find()
                    .toArray();

                if (dbConfigResult.length && dbConfigResult[0].frontend) {
                    dbConfigResult[0].frontend.timezone = dbConfigResult[0].frontend.timezone ? dbConfigResult[0].frontend.timezone : 'Asia/Kolkata';
                    cacheTimezoneResult = dbConfigResult[0]
                    await cache.set(collecName, cacheTimezoneResult)
                }
            } else {
                cacheTimezoneResult = cache.get(collecName);

            }
            resolve(cacheTimezoneResult);
        } catch (err) {
            console.log("error ", err);
            resolve();
        }
    })
}