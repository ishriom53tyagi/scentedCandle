const getDb = require('../utils/database').getDb;
const config = require('../config');
const { responseData } = require('../utils/responseHandler');
const Email = require('../utils/sendMail');
const common = require('../utils/common');
const ObjectId = require('mongodb').ObjectId;
const systemLog = require('../services/systemLog');
const ipAddress = require('../utils/common');

module.exports.getStorageData = async function (req, res) {
    try {
        const db = getDb();
        let storageCollection = {}
        let storage = await db.stats();
        if (storage && storage.storageSize) {

            storageCollection.usedStorage = storage.storageSize;
            storageCollection.totalStorage = config.storageSize;
            storageCollection.percentage = Math.floor((storage.storageSize / config.storageSize) * 100)
        }
        return responseData(res, true, 200, "success", storageCollection)
    } catch (err) {
        console.log("error ", err);
        return responseData(res, false, 500);
    }
}


const readableSize = (size) => {
    const scale = (Math.log(size) / Math.log(1024)) | 0;
    return (size / Math.pow(1024, scale)).toFixed(3) + [' B', ' kB', ' MB', ' GB', ' TB', ' PB', 'EB', ' ZB', ' YB'][scale];
}

module.exports.printStats = async (req, res) => {
    try {
        const db = getDb();
        if (!req.body.date) {
            return responseData(res, false, 400);
        }
        let requestDate = req.body.date.replace(/-/g, "");
        let collectionList = await db.listCollections().toArray();
        let collecName = common.collectionNameGenerator(req.headers, 'applications')

        let applicationList = await db.collection(collecName).find({}).project({ _id: 1, name: 1 }).toArray();
        let applicationData = {}
        let requestBodyValue = requestDate
        let expression = `zt_[a-z]+_[a-z0-9]+_${requestBodyValue}`;
        var re = new RegExp(expression, 'g');

        let promises = collectionList.filter(function (c) { return re.test(c.name) })
            .map((i) => db.collection(i.name).stats())

        applicationList.forEach(ele => {
            applicationData[ele._id] = ele.name;
        })
        console.log(applicationList);
        Promise.all(promises).then(function (results) {
            let finalCollectionList = {};

            results.forEach(ele => {
                let id = ele.ns.split('.')[1].split('_', 3)[2]
                if (applicationData[id]) {
                    if (!finalCollectionList[id]) {
                        finalCollectionList[id] = {}
                    }
                    //if we want appdata to be deleted uncomment this code and replace below if with else-
                    // if (ele.ns.includes("appdata")) {                                                  |
                    //     if (ele.size > 0) {                                                            |
                    //         finalCollectionList[id]["analytical"] = readableSize(ele.size)             |
                    //     }                                                                              |
                    // }                                                                              <-- |
                    if (!ele.ns.includes("appdata")) {
                        if (finalCollectionList[id] && finalCollectionList[id].appResponseData) {
                            finalCollectionList[id].appResponseData = readableSize(parseInt(finalCollectionList[id].appResponseData) + ele.size);
                        } else {

                            if (ele.size > 0 && finalCollectionList[id]) {
                                finalCollectionList[id]["response"] = readableSize(ele.size)
                            } else if (ele.size > 0) {
                                finalCollectionList[id]["response"] = readableSize(ele.size);
                            }
                        }
                    }
                    if (finalCollectionList[id] && !(finalCollectionList[id].appName)) {
                        finalCollectionList[id]["appName"] = applicationData[id]
                    }
                    if (!(finalCollectionList[id].analytical || finalCollectionList[id].response)) {
                        delete finalCollectionList[id]
                    }
                }
            })
            return responseData(res, true, 200, "success", finalCollectionList);

        })
    } catch (e) {
        console.log(e, "error while colllecting data");
        return responseData(res, false, 403, "fail");
    }
}

async function purgeCollection(id, headers) {
    return new Promise(async (resolve, reject) => {
        try {
            const db = getDb();
            let collecName = common.collectionNameGenerator(headers, 'purge_data')

            let purgeData = await db.collection(collecName).findOne({ _id: ObjectId(id) }, {
                projection: {
                    data: 1
                }
            })
            let body = purgeData.data.selectedCol;
            let requestDate = purgeData.data.requestDate.replace(/-/g, "");
            let collectionList = [];
            for (var key of Object.keys(body)) {
                for (var item of Object.keys(body[key])) {
                    if (body[key][item] == 1) {
                        let collectionName
                        if (item == "analytical") {
                            collectionName = config.appdata_initials + "_" + "appdata" + "_" + key + "_" + requestDate
                            collectionList.push(collectionName);
                        } else {
                            collectionName = config.appdata_initials + "_" + "appresponse" + "_" + key + "_" + requestDate
                            collectionList.push(collectionName);
                            collectionName = config.appdata_initials + "_" + "apierror" + "_" + key + "_" + requestDate
                            collectionList.push(collectionName);
                        }
                    }
                }
            }
            let promises = collectionList.map((i) =>
                db.listCollections({ name: i })
                    .next(function (err, collinfo) {
                        if (collinfo) {
                            db.collection(i).drop()
                        }
                    })
            )
            Promise.all(promises).then(function (result) {
                console.log(result, "Promise result");
                resolve(true);
            })

        } catch (e) {
            console.log("error is here", e);
            reject()
        }
    })
}

module.exports.purgeInit = async (req, res) => {
    const db = getDb();
    let randomCode = common.randomStr(6, '1234567890');
    let increptedCode = common.sha1Hash(randomCode, false)
    let dataLogs = [];
    let data = {
        "selectedCol": req.body.selectedCol,
        "requestDate": req.body.date
    }
    let list = {}
    let collecName = common.collectionNameGenerator(req.headers, 'applications')

    for (var key of Object.keys(req.body.selectedCol)) {
        let ApplicationnName = await db.collection("applications").findOne({ _id: ObjectId(key) }, { projection: { _id: 0, name: 1 } });
        ApplicationnName["ProductName"] = ApplicationnName["name"];
        delete ApplicationnName["name"];
        dataLogs.push(ApplicationnName)
    }
    let date = {
        "requestDate": req.body.date
    }
    dataLogs.push(date);
    let objtoInsert = {
        created_by: req.body.createdBy,
        created_time: Math.floor(((new Date()).getTime()) / 1000),
        verification_code: increptedCode,
        data: data
    };
    let logstoInsert = {
        created_by: req.body.createdBy,
        created_time: Math.floor(((new Date()).getTime()) / 1000),
        verification_code: increptedCode,
        data: dataLogs
    }
    try {
        let userEmail = await db.collection('users').findOne({ _id: ObjectId(req.body.createdBy) }, { projection: { email: 1 } });
        let collecName1 = common.collectionNameGenerator(req.headers, 'purge_data')

        db.collection(collecName1)
            .insertOne(objtoInsert)
            .then(async (result) => {
                let id = result.insertedId
                let html = generateEmailBody(randomCode, userEmail.email);
                let emailObj = {
                    from: config.smtp_config.mailfrom,
                    to: userEmail.email,
                    subject: "[" + config.organization_name + "]" + "- Your Verfifcation Code",
                    html: html
                }
                await Email.sendMail(emailObj);
                let obj = {
                    action: "purge_init",
                    data: logstoInsert,
                    user_id: req.session.user_id,
                    ip_address: ipAddress.ipAddress(req)
                }
                systemLog.logData(obj)
                return responseData(res, true, 200, 'code set successfully', { id });
            });
    } catch (err) {
        console.log(err);
        return false;
    }
}

module.exports.purgeconfirm = async (req, res) => {
    const db = getDb();
    if (!(req.body.code && req.body.id)) {
        return responseData(res, false, 503, 'fail');
    }
    let hashedCode = common.sha1Hash(req.body.code, false);
    let collecName = common.collectionNameGenerator(req.headers, 'purge_data')

    db.collection(collecName)
        .find({ _id: ObjectId(req.body.id) }, { $exists: true })
        .toArray(async function (err, result) {
            if (result && result.length) {
                if (result[0].verification_code != hashedCode) {
                    return responseData(res, false, 200, 'fail');
                }
                var oldTime = result[0].created_time; // db time
                var newTime = Math.floor(((new Date()).getTime()) / 1000);
                if ((newTime - oldTime) / 60 <= 5) {
                    let purgeStatus = await purgeCollection(req.body.id, req.headers);
                    console.log(purgeStatus, "purge final Status value is here");
                    if (purgeStatus) {
                        let obj = {
                            action: "purge_confirm",
                            user_id: req.session.user_id,
                            data: {},
                            ip_address: ipAddress.ipAddress(req)
                        }
                        systemLog.logData(obj)
                        return responseData(res, true, 200, 'success');
                    }
                    return responseData(res, false, 503);
                } else {
                    return responseData(res, false, 200, 'failed', { err });
                }
            }
        });
}

function generateEmailBody(random_code, email) {
    return `<!DOCTYPE html>
                <html lang="en">

                <head>
                    <link href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.0/css/bootstrap.min.css" rel="stylesheet" id="bootstrap-css">
                    <script src="//maxcdn.bootstrapcdn.com/bootstrap/3.3.0/js/bootstrap.min.js"></script>
                    <script src="//cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
                    <!------ Include the above in your HEAD tag ---------->
                    <style>
                        /* Basics */
                        body {
                            Margin: 0;
                            padding: 0;
                            min-width: 100%;
                            background-color: #e2e2e2;
                        }

                        table {
                            border-spacing: 0;
                            font-family: sans-serif;
                            color: #333333;
                        }

                        td {
                            padding: 0;
                        }

                        img {
                            border: 0;
                        }

                        .wrapper {
                            width: 100%;
                            table-layout: fixed;
                            -webkit-text-size-adjust: 100%;
                            -ms-text-size-adjust: 100%;
                        }

                        .webkit {
                            max-width: 600px;
                        }

                        .outer {
                            Margin: 0 auto;
                            width: 100%;
                            max-width: 600px;
                        }

                        .inner {
                            padding: 10px;
                        }

                        a {
                            text-decoration: none !important;
                        }

                        .h1 {
                            font-size: 21px;
                            font-weight: bold;
                            Margin-bottom: 18px;
                        }

                        .h2 {
                            font-size: 18px;
                            font-weight: bold;
                            Margin-bottom: 12px;
                        }

                        .full-width-image img {
                            width: 100%;
                            max-width: 600px;
                            height: auto;
                            margin: 16px 146px;
                        }

                        /* One column layout */
                        .one-column .contents {
                            text-align: left;
                        }

                        .one-column p {
                            font-size: 14px;
                            Margin-bottom: 10px;
                        }

                        /*Media Queries*/
                        @media screen and (max-width: 400px) {

                            .two-column .column,
                            .three-column .column {
                                max-width: 100% !important;
                            }

                            .two-column img {
                                max-width: 100% !important;
                            }

                            .three-column img {
                                max-width: 50% !important;
                            }
                        }

                        @media screen and (min-width: 401px) and (max-width: 620px) {
                            .three-column .column {
                                max-width: 33% !important;
                            }

                            .two-column .column {
                                max-width: 50% !important;
                            }
                        }

                        .resetBtn {
                            /* -webkit-column-break-before: always; */
                            margin: 15px 207px 14px;
                            border: none;
                            padding: 14px 18px;
                            font-size: inherit;
                            background-color: #1360a1;
                            color: white;
                            font-weight: 549;
                            cursor: pointer !important;
                        }

                        .resetBtn:hover {
                            /* -webkit-column-break-before: always; */
                            margin: 15px 207px 14px;
                            border: none;
                            padding: 14px 18px;
                            font-size: inherit;
                            background-color: #1a4569;
                            color: white;
                            font-weight: 549;
                            cursor: pointer !important;
                        }

                        h3 {
                            text-align: center;
                            margin-left: -485px !important;
                            color: white;
                            font-size: x-large;
                            margin-right: -27px !important;
                        }
                    </style>
                </head>

                <body>
                    <center class="wrapper">
                        <div class="webkit">
                            <!--[if (gte mso 9)|(IE)]>
                            <table width="600" align="center">
                            <tr>
                            <td>
                            <![endif]-->
                            <table class="outer" align="center">
                                <tbody>
                                    <tr>
                                        <td class="full-width-image" style="background: -webkit-linear-gradient(left, #296490, #5eb95d);">
                                            <div id="template">
                                                <h3 style="text-align: center; margin-left: -485px !important;color: white;font-size: x-large;margin-right: -27px !important;">Simplika</h3>
                                            </div>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td class="one-column">
                                            <table width="100%">
                                                <tbody>
                                                    <tr>
                                                    <td class="inner contents" bgcolor="ffffff">
                                                    <span>Hi,</span>
                                                    </td>
                                                    </tr>
                                                    <tr>
                                                        <td class="inner contents" bgcolor="ffffff">
                                                        <span> Here is the confirmation code as requested to delete collection </span>
                                                        <br>
                                                        <span><b>${random_code}</b></span>
                                                        <br>
                                                        <br>
                                                        <span>If you did not request this code , it is possible that someone else is trying to access Simplika</span>
                                                        <span>Account - <b>${email}</b></span>
                                                        <br>
                                                        <br>
                                                        <span><b>Do not forward or give this code to anyone </b> </span>
                                                        <br>
                                                        <br>
                                                        Regards,<br>
                                                        SimplikA Team
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="one-column" bgcolor="#f2f2f2">
                                            <table width="100%">
                                                <tbody>
                                                    <tr>
                                                        <td class="inner contents" style="background: -webkit-linear-gradient(left, #296490, #5eb95d);color: white;">
                                                        
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>

                                </tbody>
                            </table>
                        </div>
                    </center>

                </body>

                </html>`

}
