const { responseData } = require('../utils/responseHandler');
const getDb = require('../utils/database').getDb;
const ObjectId = require('mongodb').ObjectId;
const jwt = require('jsonwebtoken');
const common = require('../utils/common')
const Email = require('../utils/sendMail');
const systemLog = require('../services/systemLog');
const ipAddress = require('../utils/common');
const { smtp_config } = require('../config.json')
const roleJSON = require('../utils/role.json')
const config = require('../config.json');

module.exports.getAllUsersDetails = async function (req, res) {
    try {
        var roleCode = req.user.role_code;
        // var isa = req.query.isa;

        // console.log("role id , isa ", roleCode, isa);

        const db = getDb();

        if (roleCode != 'undefined' && roleCode != '' && roleCode != null) {

            var roledata = !roleJSON || !roleJSON[roleCode].role_child ? [] : roleJSON[roleCode].role_child;

            console.log("roledata   after ", roledata);
            let user = await db.collection('users')
                .find({ role_code: { $in: roledata }, is_deleted: { $exists: 0 } })
                .project({ password: 0 })
                .sort({ modified_time: -1 })
                .toArray()
            if (user && user.length > 0) {
                user.forEach(item => {
                    item.role_name = item && item.role_code ? roleJSON[item.role_code].role_code : 'NA'
                    item.last_update = common.momentTimeZone(req, item.modified_time);
                    if (item.last_login != undefined) { item.last_login = item.last_login * 1000 } else { item.last_login = 0 }
                })
            }
            return responseData(res, true, 200, "success", user);
            // }
        } else {
            return responseData(res, false, 204, "failure");
        }
    } catch (error) {
        console.log("error : ", error);
        return responseData(res, false, 500);
    }
}

module.exports.updateStatus = async function (req, res) {
    try {
        let { body } = req
        let modified_by = req.user._id
        const db = getDb();
        console.log("body in user : ", body);
        var olddata = await db.collection('users')
            .find({ _id: ObjectId(body.usr_id) })
            .project({ first_name: 1, user_status: 1 })
            .toArray()
        olddata = olddata[0]
        console.log("::::::::::::::::::::::::::::: ", olddata, body.usr_status);
        olddata.user_status = olddata.user_status == 1 ? true : false
        var newdata = {
            first_name: olddata.first_name,
            user_status: body.usr_status == 1 ? true : false
        }
        db.collection('users')
            .updateOne({ _id: ObjectId(body.usr_id) }, {
                $set: {
                    user_status: body.usr_status ? 1 : 0,
                    modified_by: modified_by,
                    modified_time: Math.floor(((new Date()).getTime()) / 1000),
                }
            })
            .then(result => {
                if (result) {
                    let dataObj = { before: olddata, after: newdata }
                    dataObj = systemLog.auditLogFieldsObjectStatus(dataObj)
                    let obj1 = {
                        action: "user_status_updated",
                        data: dataObj,
                        user_id: req.session.user_id,
                        ip_address: ipAddress.ipAddress(req)
                    }
                    console.log("==========obj1 in System Log Data===========", obj1);
                    systemLog.logData(obj1)
                    return responseData(res, true, 200, "success", result.result);
                } else {
                    return responseData(res, false, 204, "failure");
                }
            })
    } catch (error) {
        return responseData(res, false, 500);
    }
}

module.exports.getUserDetails = async function (req, res) {
    try {
        const db = getDb();
        console.log("......................", req.body);
        let user = await db.collection('users')
            .find(ObjectId(req.body.id))
            .project({ _id: 0, password: 0, old_password: 0 })
            .toArray()
        console.log("user ....... >>>>> ", user);
        if (user) {
            return responseData(res, true, 200, "success", user);
        } else {
            return responseData(res, false, 204, "failure");
        }
    } catch (error) {
        return responseData(res, false, 500);
    }
}

module.exports.getcurrentUserDetails = async function (req, res) {
    try {
        const db = getDb();
        let user = await db.collection('users')
            .find(ObjectId(req.id))
            .toArray()
        if (user) {
            user[0]['role_name'] = roleJSON[user[0].role_code].role_code
            console.log("CURRENT USER :: ", user)
            return user;
        }
    } catch (error) {
        console.log(error)
        return responseData(res, false, 500);
    }
}

module.exports.updateUserDetails = async function (req, res) {
    try {
        const db = getDb();
        let { body } = req
        console.log("BBBBODY : ", body);
        body.data.modified_by = req.user._id;
        body.data.modified_time = Math.floor(((new Date()).getTime()) / 1000);

        var olddata = await db.collection('users')
            .find({ _id: ObjectId(body.id) })
            .toArray()
        olddata = olddata[0]
        // console.log("1111111111,", olddata)
        var newData;
        if (config.tenant == 'multi') {
            body.data.tenants = body.data.tenants.map(x => ObjectId(x));
        }
        const result = await db.collection("users")
            .find({
                $and: [
                    { "email": body.data.email },
                    { "_id": { "$ne": ObjectId(body.id) } }
                ]
            })
            .toArray();
        if (result && result.length > 0) {
            return responseData(res, false, 200, "user already exists");
        }
        console.log("data to updateeeeeee", body.data)
        db.collection('users')
            .findOneAndUpdate({ _id: ObjectId(body.id) }, { $set: body.data }, { upsert: false, returnOriginal: false, returnNewDocument: true })
            .then(result1 => {

                newData = result1.value;
                if (newData.hasOwnProperty('old_password'))
                    delete newData.old_password
                if (olddata.hasOwnProperty('old_password'))
                    delete olddata.old_password
                let dataObj = { before: olddata, after: newData }
                console.log("3333333dataObj ....before .......  ", dataObj);
                dataObj = systemLog.auditLogFieldsObject(dataObj)
                let obj = {
                    action: "user_updated",
                    data: dataObj,
                    user_id: req.session.user_id,
                    ip_address: ipAddress.ipAddress(req)
                }
                systemLog.logData(obj)
                return responseData(res, true, 200, "success", result1);

            })
            .catch(err => {
                console.log("error", err)
                return responseData(res, false, 204, "failure");
            })

    } catch (error) {
        console.log("error", error)
        return responseData(res, false, 500);
    }
}

module.exports.insertUser = async function (req, res) {
    try {
        let { body } = req
        let created_by = req.user._id
        const db = getDb();
        const result = await db.collection("users")
            .find({ "email": body.email }, { $exists: true })
            .toArray();
        if (result && result.length > 0) {
            return responseData(res, false, 200, "user already exists");
        } else {
            var newPassword = common.generatePassword(10, true);
            var genPassword = newPassword;
            let increptedpswd = await common.sha1Hash(newPassword, false)
            let sEmails = body.email.split("@");
            let doaminsplit = sEmails[1].split('.');
            let baseurl = body.url;
            let splitedurl = baseurl.split('//');
            var obj = {
                hbsFileName: 'userAccSuccessMail.handlebars',
                from: smtp_config.mailfrom,
                to: body.email,
                subject: 'Your Simplika Account',
                template: 'userAccSuccessMail',
                context: {
                    title: ' Hi ' + body.first_name,
                    textLine1: "Your Simplika account has been ",
                    textLine2: splitedurl[0],
                    textLine3: "//",
                    textLine4: splitedurl[1],
                    textLine9: "created with the following details.",
                    textLine5: "Username: " + sEmails[0],
                    textLine6: "@",
                    textLine7: doaminsplit[0],
                    textLine10: doaminsplit[1],
                    textLine11: ".",
                    textLine8: "Password: " + genPassword,
                    textLine12: "to login",
                    regards: 'Regards , Simplika Team'
                }
            };
            var stObj = {
                first_name: body.first_name,
                last_name: body.last_name,
                preferred_name: body.preferred_name,
                email: body.email,
                password: increptedpswd,
                address: body.address,
                contact: body.contact,
                user_status: body.user_status ? 1 : 0,
                is_super_admin: body.role_id == 1 ? 1 : 0,
                gender: body.gender,
                country_code: body.country_code,
                role_code: body.role_code,
                created_by: created_by,
                created_time: Math.floor(((new Date()).getTime()) / 1000),
                modified_time: Math.floor(((new Date()).getTime()) / 1000),

            }
            if (config.tenant == 'multi') {
                body.tenants = body.tenants.map(x => ObjectId(x));
                stObj.tenants = body.tenants
            }
            await db.collection('users')
                .insertOne(stObj)
                .then(async result1 => {
                    let usrdata = result1.ops[0]
                    usrdata = systemLog.auditLogFieldsObject(usrdata)
                    let obj1 = {
                        action: "user_created",
                        data: usrdata,
                        user_id: req.session.user_id,
                        ip_address: ipAddress.ipAddress(req)
                    }
                    // //console.log("========obj========", obj1);
                    systemLog.logData(obj1)
                    // //console.log(obj);
                    await Email.sendMail(obj);
                    return responseData(res, true, 200, "success", result1);
                })
        }
    } catch (error) {
        console.log("error : ", error);
        return responseData(res, false, 500);
    }
}

module.exports.deleteUser = async function (req, res) {
    try {
        let deleted_by = req.user._id
        let deleted_time = Math.floor(((new Date()).getTime()) / 1000)
        const db = getDb();
        let user = await db.collection('users')
            .find(ObjectId(req.body.id))
            .toArray()
        user = user[0]
        var userToDelete = await db.collection('users')
            .find(ObjectId(req.body.id))
            .toArray();
        userToDelete = userToDelete[0]
        // //console.log(userToDelete);
        // //console.log('user: ', user);
        user.first_name = "delete#" + user.first_name
        user.last_name = "delete#" + user.last_name
        user.email = "delete#" + user.email
        user.password = "delete#" + user.password
        user.address = "delete#" + user.address
        user.contact = "delete#" + user.contact
        user.user_status = false
        user.deleted_by = deleted_by
        user.deleted_time = deleted_time
        user.is_deleted = 1

        userToDelete = systemLog.auditLogFieldsObject(userToDelete)
        // //console.log(result.ops[0]);
        let obj = {
            action: "user_deleted",
            data: userToDelete,
            user_id: req.session.user_id,
            ip_address: ipAddress.ipAddress(req)
        }
        // //console.log("========obj==user delete=======", obj);
        systemLog.logData(obj)

        var result = await db.collection('users')
            .updateOne({ _id: ObjectId(req.body.id) }, { $set: user })
        // //console.log("delete user result = > ", result);
        if (result) {

            return responseData(res, true, 200, "User Updated");
        } else {
            return responseData(res, false, 200, "error in deleting user");
        }

    } catch (error) {

        return responseData(res, false, 500);
    }
}

module.exports.verifyOldPassword = async function (req, res) {
    try {
        const db = getDb();
        let user = await db.collection('users')
            .find(ObjectId(req.body.id))
            .project({ _id: 0, password: 1 })
            .toArray()
        if (user) {
            let isencryptpswd = await common.sha1Hash(req.body.oldPassword)
            if (user[0].password == isencryptpswd) {
                let increptedpswd = await common.sha1Hash(req.body.ConfirmPassword, false)
                const password = {
                    password: increptedpswd
                }
                db.collection('users')
                    .findOneAndUpdate({ _id: ObjectId(req.body.id) }, { $set: password }, { upsert: false }, (err, updatedUser) => {
                        if (err) { return responseData(res, false, 204, "failure") } else { return responseData(res, true, 200, "success", updatedUser); }
                    })
            } else {
                return responseData(res, false, 204, "failure", 'password does not match');
            }
        } else {
            return responseData(res, false, 204, "failure");
        }
    } catch (error) {
        return responseData(res, false, 500);
    }
}

module.exports.saveOldPassword = async function (req, res) {
    try {
        const db = getDb();
        let user = await db.collection('users')
            .find({ email: req.body.email })
            .project({ _id: 0, password: 1 })
            .toArray()
        if (user) {
            let isencryptpswd = await common.sha1Hash(req.body.oldPassword)
            let last_password_update_time = Math.floor(((new Date()).getTime()) / 1000);
            const old_password = {
                old_password: isencryptpswd
            }
            db.collection('users')
                .findOneAndUpdate({ email: req.body.email }, { $push: old_password, $set: { last_password_update_time: last_password_update_time } }, (err, updatedUser) => {
                    if (err) {
                        console.log(false, err);
                        return responseData(res, false, 204, "failure");
                    } else {
                        return responseData(res, true, 200, "success", updatedUser);
                    }
                })
        } else {
            return responseData(res, false, 204, "failure", 'password does not match');
        }
    } catch (error) {
        return responseData(res, false, 500);
    }
}
module.exports.checkOldPassword = async function (req, res) {
    try {
        console.log("in the check old password we are",req.body);
        const db = getDb();
        var limit_password = await db.collection("settings").find().project({ _id: 0, security: 1 }).toArray();
        console.log(limit_password);
        if (limit_password.length != 0) {
            var limit_password_resuse = limit_password[0].security.amt_pwd_reuse
        }

        let user = await db.collection('users')
            .find({ email: req.body.email })
            .project({ _id: 0, old_password: 1 })
            .toArray()
        if (limit_password_resuse && user && user[0].old_password) {

            let isencryptpswd = await common.sha1Hash(req.body.oldPassword)
            let oldPassword = user[0].old_password
            oldPassword.reverse();
            let checkPassword = oldPassword.slice(0, limit_password_resuse - 1);
            let includes = checkPassword.includes(isencryptpswd);
            if (includes) {
                return responseData(res, true, 200, "true", includes);
            } else {
                return responseData(res, false, 200, "false", includes);
            }
        } else if (user[0].oldPassword == null) {

            return responseData(res, false, 200, "false", false);
        }
        return responseData(res, false, 500);
    } catch (error) {
        return responseData(res, false, 500);
    }
}

// no longer used from 2.6.0 + version
// module.exports.saveUserRole = async function (req, res) {
//     try {
//         var requestBody = req.body;
//         const db = getDb();
//         requestBody.role_data.forEach(element => {
//             element.rac_status = 1
//         })
//             .find({ "role_code": requestBody.role_code }, { $exists: true })
//             .project({ role_child: 1, _id: 0 })
//             .toArray()

//         let rolAccessInsert = await db.collection('roles')
//             .insertOne({
//                 role_code: requestBody.role_code.toLowerCase() == "superadmin" ? '' : requestBody.role_code,
//                 role_desc: requestBody.role_desc,
//                 role_status: 1,
//                 role_access: requestBody.role_data,
//                 role_child: requestBody.role_child
//             })
//         return responseData(res, true, 200, "addRoleAndRoleAccess", rolAccessInsert);
//     } catch (err) {
//         console.log("Error ", err);
//         return responseData(res, false, 500);
//     }
// }

// module.exports.updateUserRole = async function (req, res) {
//     try {
//         var role_id = req.body.role_id;
//         const db = getDb();
//         await db.collection('roles')
//             .updateOne({ _id: ObjectId(role_id) }, {
//                 $set: {
//                     role_code: req.body.role_code,
//                     role_desc: req.body.role_desc,
//                     role_access: req.body.role_data,
//                     role_child: req.body.role_child
//                 }
//             })

//         return responseData(res, true, 200, "role Access update");
//     } catch (error) {
//         console.log("Error : ", error);
//         return responseData(res, false, 500);
//     }
// }

module.exports.getUserId = async function (req) {
    return new Promise((resolve, reject) => {
        try {
            let userId = jwt.decode(req.headers.authorization.split(" ")[1])
            resolve(userId)
        } catch (err) {
            console.log(err);
            resolve()
        }
    })
}

module.exports.checkEmail = async function (req, res) {

    try {
        const db = getDb();
        const result = await db.collection("users")
            .find({ "email": req.body.email }, { $exists: true })
            .toArray();

        return responseData(res, true, 200, "role Access update", result);
    } catch (error) {
        return responseData(res, false, 500);
    }
}


module.exports.createDefaultUser = async function (req, res) {
    try {
        let increptedpswd = "854f55f283a83447fbf06e7273be7d001338f5ff"
        const db = getDb();
        await db.collection('users')
            .insertOne({
                first_name: "Admin",
                last_name: "Super",
                preferred_name: "none",
                email: "admin@vernost.in",
                password: increptedpswd,
                address: "NA",
                contact: "9999999999",
                user_status: 1,
                is_super_admin: 1,
                gender: "",
                country_code: "",
                created_time: Math.floor(((new Date()).getTime()) / 1000)
            })
            .then(result => {
                if (result) {
                    return responseData(res, true, 200, "success", result);
                } else {
                    return responseData(res, false, 200, "fail", result);
                }
            })

    } catch (err) {
        return responseData(res, false, 500);
    }
}