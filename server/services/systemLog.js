const { responseData } = require('../utils/responseHandler');
const getDb = require('../utils/database').getDb;
const ObjectId = require('mongodb').ObjectId;
const ipAddress = require('../utils/common').ipAddress();
const roleJSON = require('../utils/role.json')

function recordAction(action, data, user_id, ip_address) {
    // console.log("data is", action, data, user_id, ip_address);
    let ip = ip_address;
    const db = getDb();
    // console.log(ip);
    db.collection('system_logs')
        .insertOne({
            action: action,
            data: data,
            user_id: user_id,
            ip_address: ip,
            created_on: Math.floor(((new Date()).getTime()) / 1000)
        })
        .then(result => {
            if (result) {
                console.log("system logged", true);
                return result
            }
        })
}

module.exports.getObjectData = async function (req, res) {

    try {
        const db = getDb();
        db.collection('system_logs')
            .find({ _id: ObjectId(req.body.id) })
            .toArray()
            .then(result => {
                // console.log("sys logs = > ", result)
                return responseData(res, true, 200, "success", result);
            })

    } catch (error) {
        console.log("Error ", error);
        return responseData(res, false, 500);
    }
}

module.exports.getLogData = async function (req, res) {
    try {
        const db = getDb();
        let findObj = {};
        var userdata;
        let selected_date = req.body.date ? new Date(req.body.date) : "";
        let selected_date1 = req.body.date1 ? new Date(req.body.date1) : "";
        let user = req.body.username ? (req.body.username) : "";
        let action = req.body.action ? (req.body.action) : "";

        var roledata = []

        if (selected_date && selected_date1) {
            selected_date = Math.floor(((selected_date).getTime()) / 1000);
            selected_date1 = Math.floor(((selected_date1).getTime()) / 1000);
            findObj.created_on = { $gte: selected_date, $lt: selected_date1 }
        }

        if (selected_date && selected_date1 == "") {
            selected_date = Math.floor(((selected_date).getTime()) / 1000);
            findObj.created_on = { $gte: selected_date }
        }
        if (req.user.role_code) {
            let roleCode = req.user.role_code;

            roledata = roleJSON[roleCode].role_child

        }

        roledata = !roledata || roledata.length == 0 ? [] : roledata;

        if (user) {

            userdata = await db.collection('users')
                .find({
                    $or: [{ "first_name": new RegExp(user, 'i') },
                    { "last_name": new RegExp(user, 'i') }
                    ],
                    role_code: { $in: roledata }
                })
                .project({ _id: 1 })
                .toArray()


            console.log("roleddd and userddd", userdata, roledata)
        } else {


            let findUserobj = {}

            findUserobj = { role_code: { $in: roledata }, }

            userdata = await db.collection('users')
                .find(findUserobj)
                .project({ _id: 1, is_super_admin: 1 })
                .toArray()
        }
        let usersId = [];
        userdata.forEach(element => {
            // console.log("element :: ",element);
            usersId.push(element._id)
        })
        findObj.user_id = { $in: usersId }

        if (action)
            findObj.action = action
        let limit = req.body.limit
        let offset = req.body.offset
        console.log("roledata ..... ", roledata, findObj);
        var logsData = await db.collection('system_logs')
            .aggregate([{
                $match: findObj,
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "username"
                }
            },
            {
                "$project": {
                    "_id": 1,
                    "action": 1,
                    "data": 1,
                    "user_id": 1,
                    "ip_address": 1,
                    "created_on": 1,
                    "username": { "$arrayElemAt": ["$username.first_name", 0] }
                }
            }

            ])
            .sort({ created_on: -1 })
            .skip(offset ? offset : 0)
            .limit(limit ? limit : 10)
            .toArray()
        // console.log("dddddddd", logsData)
        var logsDataCount = await db.collection('system_logs')
            .countDocuments(findObj)
        let arr = [];
        // console.log("req. user ::: ",req.user);
        for (let i of logsData) {
            const element = i;
            element.username = element.username ? element.username : 'NA';
            element.created_on = new Date(element.created_on * 1000)
            let checkObj = Object.keys(element.data).length === 0 && element.data.constructor === Object
            element.data = checkObj ? "NA" : element.data

        }

        return res.status(200).send({ status: 'success', data: logsData, count: logsDataCount });

    } catch (error) {
        console.log("Error ", error);
        return responseData(res, false, 500);
    }
}

//recursive function to compare changes
function compareChangesInside(dataafter, databefore, before, after) {
    var keys = Object.keys(after);
    var keys2 = Object.keys(before);

    for (var i = 0; i < keys2.length; i++) {
        if (!after[keys2[i]])
            keys.push(keys2[i]);
    }

    for (var i = 0; i < keys.length; i++) {
        if (typeof after[keys[i]] !== "undefined" && typeof before[keys[i]] !== "undefined") {
            if (typeof after[keys[i]] == "object") {
                if (Array.isArray(after[keys[i]]) && JSON.stringify(after[keys[i]]) != JSON.stringify(before[keys[i]])) {
                    databefore[keys[i]] = before[keys[i]];
                    dataafter[keys[i]] = after[keys[i]];
                } else {
                    if (!databefore[keys[i]])
                        databefore[keys[i]] = {};
                    if (!dataafter[keys[i]])
                        dataafter[keys[i]] = {};

                    compareChangesInside(dataafter[keys[i]], databefore[keys[i]], before[keys[i]], after[keys[i]]);
                    if (typeof dataafter[keys[i]] == "object" && typeof databefore[keys[i]] == "object" && Object.keys(dataafter[keys[i]]) == 0 && Object.keys(databefore[keys[i]]) == 0) {
                        delete databefore[keys[i]];
                        delete dataafter[keys[i]];
                    }
                }
            } else {
                if (after[keys[i]] != before[keys[i]]) {
                    databefore[keys[i]] = before[keys[i]];
                    dataafter[keys[i]] = after[keys[i]];
                }
            }
        } else {
            if (typeof after[keys[i]] == 'undefined') {
                dataafter[keys[i]] = {};
                databefore[keys[i]] = before[keys[i]];
            } else {
                dataafter[keys[i]] = after[keys[i]];
                databefore[keys[i]] = {};
            }
        }
    }
    return { old: databefore, new: dataafter }
}

function compareChanges(data, before, after) {
    if (before && after) {
        if (typeof before._id != "undefined")
            before._id += "";
        if (typeof after._id != "undefined")
            after._id += "";
        var data = compareChangesInside(data.after, data.before, before, after);
    }
    return data;
}

exports.logData = function (ob) {
    if (typeof ob.data.before != "undefined" && typeof ob.data.update != "undefined") {
        var data = {};
        for (var i in ob.data) {
            if (i != "before" && i != "after") {
                data[i] = ob.data[i];
            }
        }
        data.before = {};
        data.after = {};
        compareChanges(data, ob.data.before, ob.data.update);
        recordAction(ob.action, data, ob.user_id, ob.ip_address);
    } else {
        console.log("inside else");
        recordAction(ob.action, ob.data, ob.user_id, ob.ip_address);
    }
}

function removeFields(keyArray, data) {
    keyArray.forEach(e => {
        delete data[e]
    })
    return data;
}

function removeSimilarFields(keyArray, olddata, newdata) {
    keyArray.forEach(i => {
        if (i == "app_id" && parseInt(olddata[i]) == parseInt(newdata[i])) {
            delete olddata[i]
            delete newdata[i]
        } else if (olddata[i] == newdata[i]) {
            delete olddata[i]
            delete newdata[i]
        }
    })
    return { old: olddata, new: newdata }
}

function checkJSON(keyArray, olddata, newdata) {
    keyArray.forEach(i => {
        console.log("olddata[i] ::: ", i, olddata[i], newdata[i]);
        if (JSON.stringify(olddata[i]) && JSON.stringify(newdata[i])) {
            if (i == 'api_query_params') {
                if (olddata[i] == newdata[i][0]['name'] == '') {
                    delete olddata[i]
                    delete newdata[i]
                }
            }
            if (JSON.stringify(olddata[i]) == JSON.stringify(newdata[i])) {
                delete olddata[i]
                delete newdata[i]
            }

        }
    })
    return { old: olddata, new: newdata }
}

function deleteNulls(obj) {
    Object.keys(obj).forEach(e => {
        if (obj[e] == null || obj[e] == "" || obj[e].length == 0) {
            delete obj[e]
        }
    })
    return obj;
}


module.exports.auditLogFieldsObjectStatus = function (data) {

    if (data['before'] != undefined) {
        console.log('updated fields', data);
        let olddata = data.before
        let newData = data.after
        delete olddata['_id']
        if (olddata['status'] == newData['status']) {
            delete olddata['status']
            delete newData['status']
        }
        olddata.status = olddata.status == 1 ? true : false
        newData.status = newData.status == 1 ? true : false
        let dataObj = { before: olddata, after: newData }
        console.log("dataObj ::: ", dataObj);
        return dataObj;
    }

}

module.exports.auditLogFieldsObject = function (data) {

    if (data['before'] != undefined) {
        console.log('updated fields', data);
        let unwantedFields = ['_id', 'modified_by', 'usr_status', 'created_time', 'email_sent_time', 'is_email_sent', 'modified_time', 'created_by', 'access_controls', 'upload_id']
        let olddata = data.before
        let newData = data.after
        if (!olddata['fun_name']) {
            olddata.status = olddata.status == 1 ? true : false
            newData.status = newData.status == 1 ? true : false
        }
        // if (old)
        olddata = removeFields(unwantedFields, olddata)
        newData = removeFields(unwantedFields, newData)
        if (olddata['other_params'] || olddata['other_params'] == null || olddata['other_params'] == '') {
            delete olddata['other_params']
        }
        if (olddata['country_code'] && olddata['country_code'] == null) { newData['country_code'] = null }
        if (olddata['application_code']) {
            let array = ['supplier_id', 'password', 'currency', 'private_api_key', 'attempt', 'lastAttemptTime']

            delete olddata['active_from']
            delete newData['active_from']
            olddata = removeFields(array, olddata)
            newData = removeFields(array, newData)
        }
        if (olddata['role_id']) {
            if (JSON.stringify(newData['role_id']) == JSON.stringify(olddata['role_id'])) {
                delete newData['role_id']
                delete olddata['role_id']
            }
        }
        if (olddata['api_headers']) {
            console.log("trueeeeeeeeeeeeeeeeeeeeeeee");
            let api_manager_keys = ['api_headers', 'api_query_params', 'api_request', 'api_response', 'sample_request', 'sample_response', 'conditional_route']
            let keys = ['subscription_type', 'subscription_price', 'direct_route']
            olddata = removeFields(keys, olddata)
            newData = removeFields(keys, newData)
            let checkJsondata = checkJSON(api_manager_keys, olddata, newData)
            console.log("checkJsondata ::: ", checkJsondata);
            olddata = checkJsondata.old
            newData = checkJsondata.new
        }
        const oldKeys = Object.keys(olddata);
        const newKeys = Object.keys(newData);
        let similarData = removeSimilarFields(oldKeys, olddata, newData)
        olddata = similarData.old
        newData = similarData.new
        if (JSON.stringify(olddata['application_code']) == JSON.stringify(newData['application_code'])) {
            delete olddata['application_code']
            delete newData['application_code']
        } else {
            if (!newData['application_code']) {
                for (let i = 0; i < newKeys.length; i++) {
                    if (typeof newData[newKeys[i]] != 'string' && typeof newData[newKeys[i]] != 'number' && newData[newKeys[i]] != null && newData[newKeys[i]] != '' && newData[newKeys[i]] != undefined && olddata[newKeys[i]] != null) {
                        for (let j = 0; j < newData[newKeys[i]].length; j++) {
                            if (olddata[newKeys[i]].length > 0) {
                                if (newData[newKeys[i]].length < 0 || newData[newKeys[i]][j] == undefined || newData[newKeys[i]][j] == '' || newData[newKeys[i]][j] == null || newData[newKeys[i]][j] == {}) { } else {
                                    const newsubKeys = Object.keys(newData[newKeys[i]][j])
                                    if (newsubKeys.length > 0) {
                                        for (let k = 0; k < newsubKeys.length; k++) {
                                            // console.log(".................." ,olddata[newKeys[i]][j],olddata[newKeys[i]][j][newsubKeys[k]],newData[newKeys[i]][j][newsubKeys[k]],olddata[newKeys[i]][j][newsubKeys[k]]=='ObjectID');
                                            if (newsubKeys[k] == 'imgValue') {
                                                delete olddata[newKeys[i]][j][newsubKeys[k]]
                                                delete newData[newKeys[i]][j][newsubKeys[k]]
                                            } else
                                                if (olddata[newKeys[i]][j][newsubKeys[k]] && olddata[newKeys[i]][j][newsubKeys[k]] === newData[newKeys[i]][j][newsubKeys[k]]) {
                                                    delete olddata[newKeys[i]][j][newsubKeys[k]]
                                                    delete newData[newKeys[i]][j][newsubKeys[k]]
                                                }

                                        }
                                    } else {
                                        delete olddata['add_section_params']
                                        delete newData['add_section_params']
                                    }
                                }
                            }

                        }
                    }
                }
            }
        }
        if (olddata['contact_name']) {
            olddata.active_from = dataOLD['active_from']
            newData.active_from = dataNEW['active_from']
            olddata.active_to = dataOLD['active_to']
            newData.active_to = dataNEW['active_to']
        }
        console.log("!olddata['fun_status'] : ", !olddata['fun_status']);

        let dataObj = { before: olddata, after: newData }
        console.log("dataObj ::: ", dataObj);
        return dataObj;
    } else {
        let unwantedFields = ['_id', 'modified_by', 'status', 'created_time', 'email_sent_time', 'is_email_sent', 'modified_time', 'created_by', 'access_controls']
        data = removeFields(unwantedFields, data)
        if (data['preferred_name']) { delete data['preferred_name'] }
        if (data['application_code']) {
            let array = ['application_code', 'supplier_id', 'password', 'currency', 'private_api_key']
            data.contact_person_name = data['contact_name']
            data = removeFields(array, data)
        }
        return data;

    }

}

module.exports.getLogAction = async function (req, res) {

    try {

        var data = [
            "api_inserted",
            "api_updated",
            "api_deleted",
            "api_bulk_upload",
            "product_created",
            "product_updated",
            "product_deleted",
            "login_attempt_multiple_times",
            "login_attempt_once",
            "login_successful",
            "partner_created",
            "partner_updated",
            "partner_deleted",
            "status_code_created",
            "status_code_updated",
            "status_code_deleted",
            "user_created",
            "user_updated",
            "user_deleted",
            "api_restored",
            "product_restored",
            "partner_restored",
            "status-code_restored",
            "api_deleted_forever",
            "product_deleted_forever",
            "partner_deleted_forever",
            "status-code_deleted_forever",
            "api_bulk_delete",
            "products_bulk_delete",
            "partners_bulk_delete",
            "status-codes_bulk_delete",
            "access_controls_bulk_delete",
            "report_download",
            "organization_created",
            "organization_updated",
            "purge_init",
            "purge_confirm"
        ]
        console.log("data list : ",data);
        return responseData(res, true, 200, "success", data);

    } catch (error) {
        console.log("Error ", error);
        return responseData(res, false, 500);
    }
}