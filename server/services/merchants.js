const { responseData } = require('../utils/responseHandler');
const getDb = require('../utils/database').getDb;
const jwt = require('jsonwebtoken');
const ObjectId = require('mongodb').ObjectId;
const common = require('../utils/common')
const systemLog = require('../services/systemLog');
const ipAddress = require('../utils/common');
const cache = require('../utils/nodeCache');

module.exports.checkMIDCodeExists = async function (req, res) {
    try {
        const db = getDb()
        let collecName = common.collectionNameGenerator(req.headers, 'partners')

        var codeExists = await db.collection(collecName)
            .find({ code: req.body.code })
            .count()
        if (codeExists > 0) {
            return responseData(res, true, 200, "success");
        } else {
            return responseData(res, false, 200, "failure");
        }
    } catch (err) {
        console.log("error : ", error);
        return responseData(res, false, 500);
    }
}

module.exports.getApiAccessKey = async function (req, res) {
    try {
        let newApiKey = await common.sha1Hash("new_api_key", true)
        const db = getDb();
        let collecName = common.collectionNameGenerator(req.headers, 'access_keys')

        db.collection(collecName)
            .insertOne({
                user_id: ObjectId(req.user._id),
                api_key: newApiKey
            })
            .then(response => {
                // console.log(response.result)
                return responseData(res, true, 200, "success", newApiKey);
            })
    } catch (error) {
        console.log("error : ", error);
        return responseData(res, false, 500);
    }
}

module.exports.getAllMerchants = async function (req, res) {
    try {
        const db = getDb();


        // console.log('merchants--------->', merchants);
        // var cacheMerchants;
        // if (!cache.has("applications")) {
        let collecName = common.collectionNameGenerator(req.headers, 'partners')
        var allMerchants = await db.collection(collecName)
            .find()
            .project({
                _id: 1,
                application_code: 1,
                name: 1,
                code: 1,
                status: 1,
                modified_time: 1,
                created_time: 1,

            })
            .sort({ modified_time: -1 })
            .toArray()
        // if (allMerchants.length) {
        //     cacheMerchants = allMerchants
        //     await cache.set("merchants", cacheMerchants)
        // }
        // } else {
        //     cacheMerchants = cache.get('merchants');
        // }
        // console.log("cacheMerchants : ", cacheMerchants);
        if (allMerchants.length > 0) {
            let collecName1 = common.collectionNameGenerator(req.headers, 'applications')

            let apps = await db.collection(collecName1)
                .find()
                .project({ _id: 1, name: 1 })
                .toArray()
            if (apps && apps.length > 0) {
                for (const element of allMerchants) {
                    let tempArray = [];
                    if (element.modified_time == element.created_time) {
                        element.last_update = "NA"
                    } else {
                        element.last_update = common.momentTimeZone(req, element.modified_time);
                    }


                    element.application_code.forEach(aElement => {
                        apps.forEach(app => {
                            if (typeof (aElement) != 'string' && aElement.equals(app._id)) {
                                tempArray.push({
                                    _id: app._id,
                                    name: app.name
                                })
                            }
                        })
                    })
                    element.application_code = tempArray
                }
            }
            // console.log(merchants);
            return responseData(res, true, 200, "success", allMerchants);
        } else {
            return responseData(res, false, 200, "failure");
        }
    } catch (error) {
        console.log("error : ", error);
        return responseData(res, false, 500);
    }
}

module.exports.getMerchantById = async function (req, res) {
    try {
        const db = getDb();
        let collecName = common.collectionNameGenerator(req.headers, 'partners')

        db.collection(collecName)
            .find(ObjectId(req.body.id))
            .toArray()
            .then(merchant => {
                if (merchant.length > 0) {
                    console.log(true)
                    return responseData(res, true, 200, "success", merchant);
                } else {
                    console.log(false)
                    return responseData(res, false, 200, "failure");
                }
            })
    } catch (error) {
        console.log("error : ", error);
        return responseData(res, false, 500);
    }
}

module.exports.getMerchantByIdForAccess = function (req, res) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        let collecName = common.collectionNameGenerator(req.headers, 'partners')

        db.collection(collecName)
            .find(ObjectId(req.id))
            .project({ application_code: 1 })
            .toArray()
            .then(merchant => {
                if (merchant.length > 0) {
                    console.log(true)
                    resolve(merchant);
                } else {
                    console.log(false);
                    reject(null)
                }
            })
    })
}

module.exports.insertMerchant = async function (req, res) {
    try {
        let { body } = req
        let { partnerData } = body
        let { apiData } = body
        let { appPathData } = body
        partnerData.application_code = partnerData.application_code.map(element => ObjectId(element))
        let created_by = req.user._id
        // console.log("insertMerchant : ", partnerData, apiData, appPathData)
        var insertedClient;
        const db = getDb();
        let collecName = common.collectionNameGenerator(req.headers, 'partners')

        db.collection(collecName)
            .insertOne({
                application_code: partnerData.application_code,
                supplier_id: partnerData.supplier_id,
                name: partnerData.name,
                email: partnerData.email,
                contact: partnerData.contact,
                code: partnerData.code,
                password: partnerData.password || null,
                currency: partnerData.currency || "INR",
                active_from: partnerData.active_from,
                active_to: partnerData.active_to,
                status: partnerData.status,
                api_key: partnerData.api_key,
                contact_name: partnerData.contact_name,
                private_api_key: partnerData.private_api_key,
                created_by: created_by,
                created_time: Math.floor(((new Date()).getTime()) / 1000),
                modified_time: Math.floor(((new Date()).getTime()) / 1000)
            })
            .then(result => {
                console.log(true)
                // console.log(result.ops[0])
                insertedClient = result.ops[0]
                if (result && result.insertedId) {
                    let collecName1 = common.collectionNameGenerator(req.headers, 'api_partner_access')

                    db.collection(collecName1)
                        .insertOne({
                            client_id: ObjectId(result.insertedId),
                            api: apiData,
                            app: appPathData,
                            created_by: created_by,
                            created_time: Math.floor(((new Date()).getTime()) / 1000),
                            modified_time: Math.floor(((new Date()).getTime()) / 1000),
                        })
                        .then(response => {
                            return responseData(res, true, 200, "success", response);
                        })
                    let dataObj = systemLog.auditLogFieldsObject(insertedClient)
                    let obj1 = {
                        action: "partner_created",
                        data: dataObj,
                        user_id: req.session.user_id,
                        ip_address: ipAddress.ipAddress(req)
                    }
                    systemLog.logData(obj1)
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

module.exports.updateMerchant = async function (req, res) {
    try {
        let { body } = req
        let { partnerData } = body
        let { apiData } = body
        let { appPathData } = body
        partnerData.application_code = partnerData.application_code.map(element => ObjectId(element))
        let modified_by = req.user._id
        const db = getDb();
        if (partnerData.apiAccessKey) {
            let collecName = common.collectionNameGenerator(req.headers, 'access_keys')

            db.collection(collecName)
                .aggregate([{
                    $match: {
                        user_id: ObjectId(modified_by),
                        api_key: partnerData.api_key
                    }
                }])
                .toArray()
                .then(result => {
                    if (result.length != 1) {
                        // console.log(false, result.length)
                        return responseData(res, false, 204, "failure");
                    } else {
                        // console.log(true, result.length)
                    }
                })
        }
        let collecName1 = common.collectionNameGenerator(req.headers, 'partners')

        var oldData = await db.collection(collecName1)
            .find({ _id: ObjectId(partnerData.client_id) })
            .toArray()
        oldData = oldData[0]
        var newData = {
            application_code: partnerData.application_code,
            supplier_id: partnerData.supplier_id,
            name: partnerData.name,
            email: partnerData.email,
            contact: partnerData.contact,
            code: partnerData.code,
            password: partnerData.password || null,
            currency: partnerData.currency || "INR",
            active_from: partnerData.active_from,
            active_to: partnerData.active_to,
            status: partnerData.status,
            api_key: partnerData.api_key,
            contact_name: partnerData.contact_name,
            private_api_key: partnerData.private_api_key,
            modified_by: modified_by,
            modified_time: Math.floor(((new Date()).getTime()) / 1000),
        }
        db.collection(collecName1)
            .updateOne({
                _id: ObjectId(partnerData.client_id)
            }, {
                $set: newData
            })
            .then(result => {
                // console.log(oldData, newData);
                var data = { before: oldData, after: newData }
                let dataObj = systemLog.auditLogFieldsObject(data)
                let obj1 = {
                    action: "partner_updated",
                    data: dataObj,
                    user_id: req.session.user_id,
                    ip_address: ipAddress.ipAddress(req)
                }
                systemLog.logData(obj1)
                if (result) {
                    let collecName2 = common.collectionNameGenerator(req.headers, 'api_partner_access')

                    db.collection(collecName2)
                        .updateOne({
                            client_id: ObjectId(partnerData.client_id)
                        }, {
                            $set: {
                                api: apiData,
                                app: appPathData,
                                modified_by: modified_by,
                                modified_time: Math.floor(((new Date()).getTime()) / 1000)
                            }
                        }, { upsert: true })
                        .then(response => {
                            // console.log("update api partner access : ", response.result)
                            return responseData(res, true, 200, "success", response);
                        })
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

module.exports.updateStatus = async function (req, res) {
    try {
        let { body } = req
        let modified_by = req.user._id
        console.log("body : ", body);
        const db = getDb();
        let collecName = common.collectionNameGenerator(req.headers, 'partners')

        var olddata = await db.collection(collecName)
            .find({ _id: ObjectId(body.usr_id) })
            .project({ name: 1, status: 1 })
            .toArray()
        olddata = olddata[0]
        console.log("::::::::::::::::::::::::::::: ", olddata, body.status == 1 ? true : false);
        olddata.status = olddata.status == 1 ? true : false
        var newdata = {
            name: olddata.name,
            status: body.usr_status == 1 ? true : false
        }
        db.collection(collecName)
            .updateOne({
                _id: ObjectId(body.usr_id)
            }, {
                $set: {
                    status: body.usr_status ? 1 : 0,
                    modified_by: modified_by,
                    modified_time: Math.floor(((new Date()).getTime()) / 1000),
                }
            })
            .then(result => {
                if (result) {
                    // console.log(true, result.result)
                    let dataObj = { before: olddata, after: newdata }
                    dataObj = systemLog.auditLogFieldsObjectStatus(dataObj)
                    let obj1 = {
                        action: "partner_status_updated",
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

module.exports.deleteMerchant = async function (req, res) {
    try {
        let dataToDelete = { _id: ObjectId(req.body.id) }
        const db = getDb();
        let collecName = common.collectionNameGenerator(req.headers, 'partners')

        let appdata = await db.collection(collecName)
            .find({ _id: ObjectId(req.body.id) })
            .toArray()
        // console.log(appdata);

        let created_by = req.user._id;
        let created_on = Math.floor(((new Date()).getTime()) / 1000);

        let collecName1 = common.collectionNameGenerator(req.headers, 'raw_appdata')

        db.collection(collecName1)
            .insertOne({
                type: "client",
                app_data: JSON.stringify(appdata[0]),
                created_by: created_by,
                created_on: created_on,
                name: appdata.length > 0 ? appdata[0].name : "",
                code: appdata.length > 0 ? appdata[0].code : ""
            })
            .then(result => {
                if (result) {
                    db.collection(collecName).deleteOne(dataToDelete, function (err, obj) {
                        if (obj.deletedCount > 0) {
                            let dataObj = systemLog.auditLogFieldsObject(appdata[0])
                            let obj1 = {
                                action: "partner_deleted",
                                data: dataObj,
                                user_id: req.session.user_id,
                                ip_address: ipAddress.ipAddress(req)
                            }
                            systemLog.logData(obj1)
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

module.exports.getMerchantBypagination = async function (req, res) {
    try {
        let pageNumber = Number(req.query.page)
        let nPerPage = Number(req.query.limit)
        const db = getDb();
        let collecName = common.collectionNameGenerator(req.headers, 'partners')

        db.collection(collecName)
            .find({})
            .project({ _id: 1, application_code: 1, name: 1, user_id: 1, status: 1 })
            .skip(pageNumber > 0 ? ((pageNumber - 1) * nPerPage) : 0)
            .limit(nPerPage)
            .toArray()
            .then(merchants => {
                if (merchants.length > 0) {
                    console.log(true)
                    return responseData(res, true, 200, "success", merchants);
                } else {
                    console.log(false)
                    return responseData(res, false, 204, "failure");
                }
            });
    } catch (error) {
        console.log("error : ", error);
        return responseData(res, false, 500);
    }
}