const { responseData } = require('../utils/responseHandler');
const ObjectId = require('mongodb').ObjectId;
const roleJSON = require('../utils/role.json')
const systemLog = require('../services/systemLog');
const ipAddress = require('../utils/common');
module.exports.mappedTenant = async function (req, res) {
    try {
        const db = req.app.db
        let resp = ''
        let user_id = req.session.user_id
        let roleCode = req.user.role_code;
        console.log("tenant rolecodeeee", roleCode)

        let list = await db.collection('users')
            .find({ _id: ObjectId(user_id) })
            .project({ tenants: 1, _id: 0 })
            .toArray()
        console.log("uiiiiii", list)
        if (list && list.length > 0) {
            let data = await db.collection('tenants')
                .find({ _id: { $in: list[0].tenants } })
                .toArray()

            resp = { 'data': data, 'total': data ? data.length : 0 }
            // return responseData(res, true, 200, "success", resp);
        } else {
            return responseData(res, false, 204, "failure");
        }

        if (resp && resp.data && resp.data.length > 0) {
            resp.data.forEach(item => {
                if (item.created_time != undefined) { item.created_time = item.created_time * 1000 } else { item.created_time = 0 }
                if (item.modified_time != undefined) { item.modified_time = item.modified_time * 1000 } else { item.modified_time = 0 }

            })
        }
        return responseData(res, true, 200, "success", resp);
    } catch (err) {
        console.log("tennn", err)
        return responseData(res, false, 500);
    }
}

module.exports.addUpdate = async function (req, res) {
    try {
        const db = req.app.db
        let user_id = req.session.user_id
        // let roleCode = req.user.role_code;
        let reqBody = req.body

        if (reqBody && reqBody.type == 'add') {

            let code = await getRandomString(db)
            console.log("ccccccodqq", code)
            let tenants = await db.collection('tenants')
                .insertOne(
                    {
                        name: reqBody.data,
                        code: code,
                        base_url: reqBody.base_url,
                        created_by: user_id,
                        created_time: Math.floor(((new Date()).getTime()) / 1000)
                    })
                .then(async result1 => {

                    let frontend = {
                        "header_keys": [],
                        "query_params_keys": []
                    }

                    let newValues = {
                        frontend: frontend
                    }

                    await db.collection('configurations_' + result1.insertedId)
                        .insertOne(newValues)

                    console.log(result1)
                    let usrdata = result1.ops[0]
                    usrdata = systemLog.auditLogFieldsObject(usrdata)
                    let obj1 = {
                        action: "organization_created",
                        data: usrdata,
                        user_id: req.session.user_id,
                        ip_address: ipAddress.ipAddress(req)
                    }
                    // //console.log("========obj========", obj1);
                    systemLog.logData(obj1)


                    await db.collection('users')
                        .updateOne(
                            { _id: ObjectId(user_id) },
                            { $push: { tenants: result1.insertedId } })


                    return responseData(res, true, 200, "success", result1);
                })
        }


        if (reqBody && reqBody.type == 'edit' && reqBody.t_id) {
            console.log("editttt", reqBody)

            var olddata = await db.collection('tenants')
                .find({ _id: ObjectId(reqBody.t_id) })
                .toArray()
            olddata = olddata[0]
            // console.log("1111111111,", olddata)
            var newData;
            const result = await db.collection("tenants")
                .find({
                    $and: [
                        { "name": reqBody.data },
                        { "_id": { "$ne": ObjectId(reqBody.t_id) } }
                    ]
                })
                .toArray();
            if (result && result.length > 0) {
                return responseData(res, false, 200, "organization already exists");
            }
            await db.collection('tenants')
                .findOneAndUpdate(
                    {
                        _id: ObjectId(reqBody.t_id)
                    },
                    {
                        $set: {
                            base_url: reqBody.base_url,
                            name: reqBody.data,
                            modified_by: user_id,
                            modified_time: Math.floor(((new Date()).getTime()) / 1000)

                        }
                    }, { upsert: false, returnOriginal: false, returnNewDocument: true })
                .then(result1 => {
                    console.log("afterrrrr update  ", result1)
                    newData = result1.value;

                    let dataObj = { before: olddata, after: newData }
                    dataObj = systemLog.auditLogFieldsObject(dataObj)
                    let obj = {
                        action: "organization_updated",
                        data: dataObj,
                        user_id: req.session.user_id,
                        ip_address: ipAddress.ipAddress(req)
                    }
                    systemLog.logData(obj)
                    return responseData(res, true, 200, "success", result1);

                })

            // return responseData(res, true, 200, "success");
        }
    }

    catch (err) {
        console.log("tennnaddupdatee", err)
        return responseData(res, false, 500);
    }
}

async function getRandomString(db) {
    return new Promise(async (resolve, reject) => {
        let istcodeexists = true;
        let length = 6;
        let randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        while (istcodeexists) {
            for (var i = 0; i < length; i++) {
                result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
            }
            let Tcode = {
                code: `T-${result}`,
            }
            let response = await isTcodeAlreadyExist(db, Tcode)

            if (response && response.length > 0) {
                istcodeexists = true;
            }
            else {
                istcodeexists = false;
            }
        }
        resolve(`T-${result}`);
    })
}
module.exports.getRandomString = getRandomString
async function isTcodeAlreadyExist(db, Tcode) {
    try {
        return await db.collection('tenants').find({ code: Tcode.code }).toArray()
    }
    catch (error) {
        console.log("error : ", error);
    }
}

module.exports.checkTenant = async function (req, res) {

    try {
        console.log("index :: => ",req.body);
        const db = req.app.db;
        const result = await db.collection("tenants")
            .find()
            .project({name:1})
            .toArray();
            console.log(result);
    let index = result.findIndex(e=>e.name.toLowerCase() === req.body.name.toLowerCase())
    console.log("index :: after => ",index);
        if(index)
        return responseData(res, true, 200, "success", index);
    } catch (error) {
        return responseData(res, false, 500);
    }
}