const { responseData } = require('../utils/responseHandler');
const jwt = require('jsonwebtoken');
const common = require('../utils/common');
const Email = require('../utils/sendMail');
const config = require('../config.json');
const { smtp_config } = require('../config.json')
const cache = require('../utils/nodeCache');
const request = require('request');
const userService = require('./user');
const ObjectId = require('mongodb').ObjectId;
const systemLog = require('../services/systemLog');
const ipAddress = require('../utils/common');
const roleJSON = require('../utils/role.json')
const fs = require('fs');
var path = require('path');
var privateKEY = fs.readFileSync(path.join(__dirname, config.authUrl + 'private.key'), 'utf8');



module.exports.login = async function (req, res) {
    try {
        // console.log("in login");
        let { email, password } = req.body;
        if (!req.body['gRecaptchaResponse']) {
            return responseData(req, false, 204, 'Please select captcha', null);
        }
        let secretKey = config.secretKey;
        let verificationUrl = config.verificationUrl + secretKey + "&response=" + req.body['gRecaptchaResponse'] + "&remoteip=" + req.connection.remoteAddress;

        request(verificationUrl, async function (error, response, body) {
            body = JSON.parse(body);
            if (body.success !== undefined && !body.success) {
                let errmsg = "Failed captcha verification";
                return responseData(res, false, 200, errmsg);
            }
            const db = req.app.db;
            db.collection('users')
                .findOne({ email: email })
                .then(async (user) => {
                    // console.log("user ::", user);
                    if (user == null) {
                        let errmsg = "The username or password entered is incorrect.";
                        return responseData(res, false, 200, errmsg);
                    }
                    var loginAttempt = {};
                    let result = await db.collection('login_attempt').findOne({ email: email })
                    if (result != null) {
                        loginAttempt = result
                        // console.log("req.session.user_id = > ",user._id);
                    }
                    else {
                        loginAttempt.attempt = 0;
                        loginAttempt.lastAttemptTime = 0;
                        db.collection('login_attempt')
                            .findOneAndUpdate({ email: email }, { $set: { attempt: 0, lastAttemptTime: 0, email: email } }, { upsert: true })
                            .then(result => {
                                // console.log("attempt-------1 :", result)
                            })
                    }

                    var output = await common.sha1Hash(password, false);
                    var configuration = await db.collection("configurations").findOne({}, { projection: { _id: 0, frontend: 1 } });
                    var settings = await db.collection("settings").findOne({}, { projection: { _id: 0, security: 1 } });
                    var time1 = new Date().getTime();
                    user.timeZone = configuration && configuration.frontend && configuration.frontend.timezone ? configuration.frontend.timezone : ''

                    if (settings) {
                        console.log("settings : ", settings);
                        settings = settings.security;

                        var days = parseInt((time1 - ((user.last_password_update_time ? user.last_password_update_time : user.created_time) * 1000)) / (1000 * 60 * 60 * 24));

                        if (settings.expire_pwd_days && days >= settings.expire_pwd_days && output === user.password) {
                            let randomeCode = await passwordExpire(db, email);
                            return responseData(res, false, 200, 'reset', randomeCode);
                        }

                        if (settings.login_attempts && loginAttempt.attempt >= (settings.login_attempts - 1) && (time1 - user.lastAttemptTime) < parseInt(settings.login_block_time * 1000)) {
                            let seconds = parseInt((time1 - user.lastAttemptTime) / 1000);
                            await db.collection('login_attempt').updateOne({ email: email }, { $set: { attempt: loginAttempt.attempt + 1 } })
                            let errmsg = "Your account has been blocked due to too many failed attempts Please try after sometime";
                            let obj = {
                                action: "login_attempt_multiple_times",
                                data: {},
                                user_id: req.session.user_id,
                                ip_address: ipAddress.ipAddress(req)
                            }
                            systemLog.logData(obj)
                            return responseData(res, false, 200, errmsg);

                        }
                    }

                    if (output !== user.password) {
                        // errmsg = user ? "Incorrect Password" : "Incorrect Username"
                        let errmsg = "The username or password entered is incorrect."
                        if (settings && loginAttempt.attempt < settings.login_attempts) {
                            await updateLoginAttempt(db, email, (loginAttempt.attempt + 1), time1);
                        }
                        return responseData(res, false, 200, errmsg);
                    }
                    if (user.user_status != 1) {
                        return responseData(res, false, 200, 'User is Inactive');
                    }

                    var api_token = await SuccessfullLogin(req, user);
                    // if(api_token){
                    //     let obj = {
                    //         action: "login_attempt_once",
                    //         data: {},
                    //         user_id: req.session.user_id,
                    //         ip_address: ipAddress.ipAddress(req)
                    //     }
                    //     systemLog.logData(obj)
                    // }
                    return responseData(res, true, 200, 'success', api_token);

                });

        })
    } catch (error) {
        console.log('error ============================================: ', error);
        return responseData(res, false, 500);
    }
};

async function passwordExpire(db, email) {

    let random_code = common.randomStr(20, '1234567890aBcDeFgHiJkLmN');

    let created_pwd_reset_time = new Date();
    let objtoInsert = {
        email: email,
        created_pwd_reset_time: created_pwd_reset_time,
        pwd_code: random_code,
    };
    try {
        await db.collection('reset_passwords').insertOne(objtoInsert);
        return random_code;
    } catch (err) {
        console.log(err);
        return false;
    }



}

async function updateLoginAttempt(db, email, attempt, AttemptTime) {

    await db.collection('login_attempt')
        .updateOne({ email: email }, { $set: { attempt: attempt, lastAttemptTime: AttemptTime } })
    await db.collection('users')
        .updateOne({ email: email }, { $set: { attempt: attempt, lastAttemptTime: AttemptTime } })

}

async function SuccessfullLogin(req, user) {
    console.log(true);
    console.log("successFul  login user :: ", user);
    const db = req.app.db

    if (req.session) {
        req.session.user_id = user._id;
    }
    var role = roleJSON[user.role_code]
    // console.log("role_name : ", role.desc);
    user['role_name'] = role ? role.role_desc : ''
    console.log("successfull user ....... ", user);
    await updateLoginAttempt(db, req.body.email, 0, 0);
    let lastLoggedIn = Math.floor(((new Date()).getTime()) / 1000);
    let obj = {
        action: "login_successful",
        data: {},
        user_id: req.session.user_id,
        ip_address: ipAddress.ipAddress(req)
    }
    systemLog.logData(obj)
    let signOptions = {
        issuer: config.organization_name,
        subject: user._id.toString(),
        audience: req.headers.host,
        expiresIn: config.encryption.jwt.jwt_expires_in,
        algorithm: "RS256"
    };

    user.version = user.version == undefined ? '' : user.version;
    if (user.version != req.query.version) {
        user.is_upgraded = user.is_upgraded == undefined || user.is_upgraded == false ? true : false
    }
    let api_token = jwt.sign({ "_id": user._id, "first_name": user.first_name, "last_name": user.last_name, "status": user.user_status, "timeZone": user.timeZone, "role_name": user.role_name,"role_code":user.role_code, "is_upgraded": user.is_upgraded, "environment": config.appdata_initials, "t_id": user.tenants ? user.tenants[0] : '' }, privateKEY, signOptions);
    db.collection("users").updateOne({ '_id': ObjectId(req.session.user_id) }, { $set: { last_login: lastLoggedIn, version: req.query.version } }, function (err, result) {
        if (result) {
            console.log("last login logged", true, user);
        }
        else {
            console.log(false);
            return responseData(res, false, 404, "Error");
        }
    });
    return api_token;
}

module.exports.forgotPasswordCheckUser = async function (req, res) {
    try {
        let random_code = common.randomStr(20, '1234567890aBcDeFgHiJkLmN');

        let created_pwd_reset_time = new Date();
        let objtoInsert = {
            email: req.body.email,
            created_pwd_reset_time: created_pwd_reset_time,
            pwd_code: random_code
        };
        console.log("===------------", req.body);
        let url = req.body.url
        const db = req.app.db
        db.collection('users')
            .find({ email: req.body.email }, { $exists: true })
            .toArray(function (err, result) {
                if (result && result.length) {
                    db.collection('reset_passwords')
                        .insertOne(objtoInsert)
                        .then((result) => {
                            let obj = {
                                hbsFileName: 'forgotPwdreset.handlebars',
                                from: smtp_config.mailfrom,
                                to: req.body.email,
                                subject: 'Reset Password Link for your Simplica Account',
                                template: 'forgotPwdreset',
                                context: {
                                    title: 'Forgot your Password?',
                                    textLine1:
                                        "We received a request to reset your Simplika's Account password.",
                                    textLine2:
                                        'To reset your new password, Click on the link below to change your password :-',
                                    BtnLink:
                                        url + '/authentication/reset-password/' + random_code,
                                    regards: 'Regards , Simplika Team',
                                }
                            };
                            Email.sendMail(obj);
                            return responseData(res, true, 200, 'Password Reset Link has been Successfully sent to the Registered Email Address', { result });
                        });
                }
                else {
                    return responseData(res, false, 200, 'Email does not Exists', {
                        result,
                    });
                }
            });
    }
    catch (err) {
        console.log('error ', err);
        return responseData(res, false, 500);
    }
};

module.exports.resetPassword = async function (req, res) {
    try {
        const db = req.app.db
        let passwordEncrypted = await common.sha1Hash(req.body.password, false);
        let url = req.body.url

        var limit_password = await db.collection("settings").find().project({ _id: 0, security: 1 }).toArray();
        if (limit_password.length != 0) {
            var limit_password_resuse = limit_password[0].security.amt_pwd_reuse
        }

        let user = await db.collection('users')
            .find({ email: req.body.email })
            .project({ _id: 0, old_password: 1 })
            .toArray()
        if (limit_password_resuse && user && user[0].old_password) {
            let isencryptpswd = await common.sha1Hash(req.body.reset_password)
            let oldPassword = user[0].old_password
            oldPassword.reverse();
            let checkPassword = oldPassword.slice(0, limit_password_resuse - 1);
            let includes = checkPassword.includes(isencryptpswd);
            if (includes) {
                return responseData(res, false, 200, "passExist", includes);
            }
        }

        db.collection('reset_passwords')
            .find({ pwd_code: req.body.code }, { $exists: true })
            .toArray(function (err, result) {
                if (result && result.length) {
                    // console.log(' pwdcode already exists ', result);
                    var time1 = new Date().getTime();
                    var email = result[0].email;
                    var oldValues = { email: email };
                    var newValues = { $set: { password: passwordEncrypted, last_password_update_time: time1 } };
                    var oldTime = result[0].created_pwd_reset_time; // db time
                    oldTime.setMinutes(oldTime.getMinutes() + 15);
                    var newTime = new Date();
                    if (oldTime.getTime() >= newTime.getTime()) {
                        db.collection('users')
                            .updateOne(oldValues, newValues, function (err, obj) {
                                if (obj) {
                                    var obj = {
                                        hbsFileName: 'forgotPwdreset.handlebars',
                                        from: smtp_config.mailfrom,
                                        to: email,
                                        subject: 'Password Reset Info',
                                        template: 'forgotPwdreset',
                                        context: {
                                            title: ' Hi ' + email,
                                            textLine1:
                                                "Password has been Reset Successfully for your Simplika Account.",
                                            textLine2:
                                                'Not You? Click below Button to Reset Your Password   :- ',
                                            BtnLink:
                                                url + '/authentication/forgot-password',
                                            regards: 'Regards , Simplika Team',
                                        }

                                    };
                                    Email.sendMail(obj);
                                    return responseData(res, true, 200, 'success', { newValues });
                                } else {
                                    var err = [err];
                                    return responseData(res, false, 404, 'Error in Updating Password', { err });
                                }
                            });
                    } else {
                        this.checkValidityofResetPasswordLink(req, res)

                        return responseData(res, false, 404, 'fail', { err });
                    }
                }
            });
    }
    catch (err) {
        console.log('error ', err);
        return responseData(res, false, 500);
    }
};

module.exports.checkValidityofResetPasswordLink = async function (req, res) {
    try {
        const db = req.app.db
        db.collection('reset_passwords')
            .find({ pwd_code: req.body.code }, { $exists: true })
            .toArray(function (err, result) {
                if (result && result.length) {
                    var oldTime = result[0].created_pwd_reset_time; // db time
                    oldTime.setMinutes(oldTime.getMinutes() + 15);
                    var newTime = new Date(); // now time
                    if (oldTime.getTime() >= newTime.getTime()) {
                        return responseData(res, true, 200, 'success', result);
                    } else {
                        return responseData(res, false, 503, 'fail', { err });
                    }
                }
            });
    }
    catch (err) {
        console.log('error ', err);
        return responseData(res, false, 500);
    }
}

module.exports.getSession = async function (req, res) {
    // console.log("req.session.user_id:",req.session.user_id);
    try {
        if (req.session.user_id) {
            req.session.cookie.expires = new Date((req.session.cookie.expires).getTime() - req.session.updateDiff)
            var currTime = Date.now();
            // console.log("timeeeeeeeeeee remaining", req.session.cookie.expires, (req.session.cookie.expires).getTime() - currTime, req.session)
            if (((req.session.cookie.expires).getTime() - currTime) > 0) {
                return res.status(200).send({ status: "200", message: "Success" });
            }
            else {
                // console.log('else ===req.session------->', req.session,);
                // console.log('usrId============>', usrId);
                // await systemService.logData({ action: "logout_inactivity", data: "null", user_id: usrId, ip_address: req.additional.clientIp });
                return res.status(403).send({ status: "403", message: "Access Denied" });
            }

        }
        else {
            // console.log('usrId============>', usrId);
            // await systemService.logData({ action: "logout_inactivity", data: "null", user_id: usrId, ip_address: req.additional.clientIp });
            return res.status(403).send({ status: "403", message: "Access Denied" });
        }

    } catch (err) {
        console.log("Error ", err);
        responseHandler.error(req, res, 'error', err);
    }
}

module.exports.lastLogin = async function (req, res) {
    try {
        // console.log("user id = > ", req.session.user_id);
        const db = req.app.db
        // let lastLoggedIn = Math.floor(((new Date()).getTime()) / 1000);
        let obj = {
            action: "logout_successful",
            data: {},
            user_id: req.session.user_id,
            ip_address: ipAddress.ipAddress(req)
        }
        systemLog.logData(obj)
    }
    catch (err) {
        console.log("Error ", err);
        responseHandler.error(req, res, 'error', err);
    }
}
module.exports.checkConfiguration = async function (req, res) {
    try {
        // console.log("user id = > ", req.session.user_id);
        const db = req.app.db
        // let lastLoggedIn = Math.floor(((new Date()).getTime()) / 1000);
        let settings = await db.collection("settings").find().project({ _id: 0, security: 1 }).toArray();
        return responseData(res, true, 200, 'success', settings);
    }
    catch (err) {
        console.log("Error ", err);
        responseHandler.error(req, res, 'error', err);
    }
}


