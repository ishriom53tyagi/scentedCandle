const { responseData } = require('../utils/responseHandler');
const getDb = require('../utils/database').getDb;
const systemLog = require('../services/systemLog');
const ipAddress = require('../utils/common');
const config = require('../config.json');
const common = require('../utils/request')
const ObjectId = require('mongodb').ObjectId;
const User = require('../services/user');

module.exports.resetRouter = async function (req, res) {
    try {
        let header = req.headers;
        const promises = [];
        const db = getDb();
        var log = await db.collection('router_reset_log').findOne({}, { sort: { $natural: -1 } });
        let timestamp = Date.now();
        let set = false
        let diff;
        if (log) {
            let last_timestamp = log.timestamps;
            diff = ((timestamp - last_timestamp) / 60000);
            if (diff > 15) {
                set = true
            }
            else {
                return responseData(res, false, 200, "reset time", Math.floor(diff));
            }
        } else {
            set = true;
        }
        if (set) {
            let insertData = {
                timestamps: timestamp,
                status: 'initiated',
                created_time: Math.floor(((new Date()).getTime()) / 1000),
                created_by: req.user._id
            }
            let find_boot_log = {
                status: true
            }
            if (header.hasOwnProperty('t_id') && header.t_id && config.tenant == 'multi') {
                insertData["org_id"] = header.t_id;
                find_boot_log["org_id"] = header.t_id;
            }
            console.log(find_boot_log, "boot log value is here");
            let data = await db.collection('router_reset_log')
                .insertOne(insertData)
            await db.collection('router_reset_log').createIndex({ created_time: -1 },
                { background: true, expireAfterSeconds: 864000 }, function (err, res) { });
            console.log(data, "Router Reset inserted value");
            if (!(data)) {
                return responseData(res, false, 500);
            }
            let requestHeaders = {}
            let id = data.insertedId;
            requestHeaders._id = id;
            let boot_log = [];
            boot_log = await db.collection('router_boot_log').find(find_boot_log).toArray();

            console.log(boot_log, "boot log value is here");

            for (let i of boot_log) {
                promises.push(routerRequest(i.ip, requestHeaders));
            }

            Promise.all(promises)
                .then(async result => {
                    let count = 0;
                    for (let data of result) {

                        let updated_time = Math.floor(((new Date()).getTime()) / 1000);
                        let setvalue = {};
                        // let update = {};
                        if (data.status) {
                            count = count + 1;

                            let time = 'reset.' + updated_time;
                            setvalue = {
                                status: true,
                                [time]: true
                            }
                        } else {
                            let time = 'reset.' + updated_time;
                            setvalue = {
                                status: false,
                                [time]: false
                            }
                        }

                        await db.collection('router_boot_log').updateOne({
                            'ip': data.ip
                        }, {
                            $push: {
                                reset_id: id
                            },
                            $set: setvalue
                        });
                    }

                    if (count > 0) {
                        let resetSuccess = await db.collection('router_reset_log')
                            .updateOne(
                                {
                                    _id: ObjectId(data.insertedId)
                                },
                                {
                                    $set: {

                                        timestamps: timestamp,
                                        // updatedBy: req.user._id,
                                        status: 'completed',
                                        updated_time: Math.floor(((new Date()).getTime()) / 1000),

                                    }
                                })
                        //include index for created Time
                        if (resetSuccess) {
                            let dataObj = systemLog.auditLogFieldsObject(data)
                            let obj1 = {
                                action: "router_reset",
                                data: dataObj,
                                user_id: req.session.user_id,
                                ip_address: ipAddress.ipAddress(req)
                            }
                            systemLog.logData(obj1)
                        }
                        return responseData(res, true, 200, "success");
                    }
                    return responseData(res, false, 200, "fail");
                })
                .catch((error) => { console.log("error is here", error) });
        }
    } catch (error) {
        console.log("error : ", error);
        return responseData(res, false, 500);
    }
}


module.exports.getRouterHistory = async function (req, res) {
    try {
        const db = getDb();
        let header = req.headers;
        let result = []
        let count = {}
        let user = {}
        let id = []
        let org_id
        let is_org_id = false
        if (header.hasOwnProperty('t_id') && header.t_id && config.tenant == 'multi') {
            org_id = header.t_id
            is_org_id = true;
        }
        if (is_org_id) {
            result = await db.collection("router_reset_log").find({ org_id: org_id }).sort({ timestamps: -1 }).limit(30).toArray();
        } else {
            result = await db.collection("router_reset_log").find().sort({ timestamps: -1 }).limit(30).toArray();
        }

        for (var j in result) {
            id[j] = result[j]._id
        }

        let boot_log = await db.collection("router_boot_log").aggregate([
            {
                $match: {
                    $and: [
                        {
                            reset_id: {
                                $in: id
                            }
                        }
                    ]
                },
            }, {
                $unwind: "$reset_id"
            }, {
                $match: {
                    reset_id: {
                        $in: id
                    }
                }
            },
            {
                $group: {
                    _id: "$reset_id",
                    total: {
                        "$sum": 1
                    }
                }
            }
        ]).toArray();
        for (var i in boot_log) {
            count[boot_log[i]._id] = boot_log[i].total
        }
        for (var i in result) {
            if (count[result[i]._id]) {
                result[i].count = count[result[i]._id]
            } else {
                result[i].count = 0;
            }
            if (!(user[result[i].created_by])) {
                user[result[i].created_by] = await db.collection("users").findOne({ _id: ObjectId(result[i].created_by) }, { projection: { _id: 0, first_name: 1 } });
            }
            result[i].created_by = user[result[i].created_by].first_name

            result[i].created_time = new Date(new Date(new Date(result[i].created_time)).toUTCString()).toLocaleString(undefined, { timeZone: 'Asia/Kolkata' })
        }
        console.log(result);
        return responseData(res, true, 200, "success", result);
    } catch (e) {
        console.log("error while searching boot log", e);
        return responseData(res, false, 403, "fail");
    }

}


function routerRequest(ip, requestHeaders) {
    return new Promise(async (resolve, reject) => {
        try {
            let headers = requestHeaders;
            let path = 'http://' + ip + ":" + config.web_router_port + '/reset/simplica';
            let getData = await common.get(path, headers);
            getData.ip = ip;

            resolve(getData);
        }
        catch (error) {
            console.log("error :: ", error);
        }
    })
}
