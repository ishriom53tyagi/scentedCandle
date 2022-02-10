const { smtp_config, appdata_initials } = require('../config.json')
const config = require('../config.json');
const ObjectId = require('mongodb').ObjectId;
const common = require('../utils/common');

// this is the main function for 30 min scheduler
module.exports.errorStatusCodeMailer = async (db) => {
    const promises = []
    const promises2 = []
    const promises3 = []
    // let date = new Date(new Date().setHours(new Date().getHours() + 5))
    // we work for last 30 min so.....
    let timeZone = /\((.*)\)/.exec(new Date().toString())[1]
    let date;
    console.log(timeZone);
    // if (timeZone == "Coordinated Universal Time") {
    // date = new Date(new Date().setHours(new Date().getHours() + 5))
    // }
    // else {
    date = new Date(new Date().setMinutes(new Date().getMinutes() - 30))
    // }
    // to get app the application list for application name and mail id of application owner
    let appsForMailing = await applicationGiver(db)
    console.log("appsForMailing :", appsForMailing.length);
    // here we are generating collection name according to the applications we get
    let apps = await collectionNameGenerator(appsForMailing)
    console.log("refined apps: ", apps.length);
    // we are calling to all the apps simultaniously so we use promise.all
    // here we are creating promise array
    apps.map(app => { promises.push(statudDataRetriver(date, db, app)) })
    await Promise.all(promises).then(async response => {
        console.log("response :", response.length);
        // here we are filterig the response for those with response.length > 0
        response = response.filter(resp => resp.result.length > 0)
        console.log("response after blank result:", response.length);
        if (response.length > 0) {
            // console.log("response after blank result full response:", JSON.stringify(response));
            // now we will search for the clients name only for response client ids
            // and same goes for api names            
            let clientIds = []
            let apiIds = []
            response.forEach(resp => {
                resp.result.forEach(id => {
                    clientIds.push(id._id.client_id)
                    apiIds.push(id._id.api_id)
                })
            })
            console.log("apiIds :", apiIds);
            console.log("clientIds :", clientIds);
            // after getting list of clientIds we do db call in below function
            let clientNameList = await clientNameListGiver(db, clientIds)
            // console.log("clientNameList :", clientNameList);
            // console.log("clientNameList :", JSON.stringify(clientNameList));
            console.log("clientNameList :", clientNameList.length);
            // after getting list of apiIds we do db call in below function

            // here we are mapping all the client name, id & api name, id 
            response.map(resp => { promises2.push(clientNameAndAPINameAdder(clientNameList, resp)) })
            await Promise.all(promises2).then(async finalResponse => {
                // console.log("final resp :", finalResponse,);
                console.log("url is : ", config.frontend_url + "/authentication/signin");
                console.log("final resp :", JSON.stringify(finalResponse))
                // on final response we create template and store in to db with pending status
                finalResponse.map(resp => { promises3.push(emailDetailsStoringFunc(db, resp)) })
                await Promise.all(promises3).then(result => {
                    console.log("email stored into DB done!");
                    return true
                })
            })
        }
    })
    function onExit() {
        try {
            console.log("exit now");
            process.kill(process.pid, 'SIGTERM')
        }
        catch (err) {
            console.log(err);
        }
    }
    onExit()
}

// status should be 1
// created on last 30 min

function applicationGiver(db) {
    return new Promise(async (resolve, reject) => {
        // var applications = await db.collection('applications')
        //     .find({ 'notification_to': { $ne: null } , is_email_alerts: true})
        //     .project({ _id: 1, code: 1, name: 1, notification_to: 1 })
        //     .sort({ modified_time: -1 })
        //     .toArray()
        var applications = await db.collection('applications')
            .aggregate([
                {
                    $match: {
                        $and: [
                            { 'notification_to': { $ne: null } },
                            { 'is_email_alert': { $in: [true] } }
                        ]
                    },
                },
                { $sort: { modified_time: -1 } }
            ])
            .toArray()
        console.log("applications : >>>>>>>>>>>>> ", applications);
        resolve(applications)
    })
}

function collectionNameGenerator(apps) {
    return new Promise(async (resolve, reject) => {
        let month = ("0" + (Number(new Date().getMonth()) + 1)).slice(-2)
        let year = new Date().getFullYear()
        console.log("collection Name genrator", appdata_initials + "_appdata_")
        let collectionPrefix = appdata_initials + "_appdata_"
        let collectionSuffix = "_" + month + year
        apps.forEach(element => { element.collectionName = collectionPrefix + element._id + collectionSuffix });
        // console.log("collectionNameGenerator :", apps);
        resolve(apps)
    })
}

function statudDataRetriver(date, db, app) {
    return new Promise(async (resolve, reject) => {
        try {
            // console.log(date);
            db.collection(app.collectionName)
                .aggregate([
                    {
                        $match: {
                            created_on: { $gte: date },
                            status_code: { $in: config.error_codes },
                            client_id: {
                                "$exists": true,
                                "$ne": null
                            },
                            client_code: {
                                "$exists": true,
                                "$ne": null
                            }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                status_code: "$status_code",
                                client_id: "$client_id",
                                client_code: "$client_code",
                                api_url: "$api",
                                method: "$method"
                            },
                            count: { $sum: 1 }
                        }
                    },
                ])
                .toArray()
                .then((result) => {
                    console.log("result apppp ", result);
                    resolve({
                        app: app,
                        result: result
                    })
                })
        }
        catch (error) {
            console.log("error :: ", error);
        }
    })
}

function clientNameListGiver(db, response) {
    return new Promise((resolve, reject) => {
        try {
            let obj_ids = response.map(function (item) { return ObjectId(item) })
            db.collection('partners')
                .find({ _id: { $in: obj_ids } })
                .project({ _id: 1, code: 1, name: 1, })
                .toArray()
                .then(clients => {
                    resolve(clients);
                })
        }
        catch (error) {
            console.log("error :: ", error);
        }
    })
}

// function apiNameListGiver(db, response) {
//     return new Promise((resolve, reject) => {
//         try {
//             let obj_ids = response.map(function (item) { return ObjectId(item) })
//             db.collection('api_managements')
//                 .find({ _id: { $in: obj_ids } })
//                 .project({ app_id: 1, api_code: 1, short_description: 1, })
//                 .toArray()
//                 .then(apis => {
//                     resolve(apis);
//                 })
//         }
//         catch (error) {
//             console.log("error :: ", error);
//         }
//     })
// }

function clientNameAndAPINameAdder(clientNameList, response) {
    return new Promise((resolve, reject) => {
        try {
            let result = response.result
            result.map(data => {
                let clientId = clientNameList.find(client => client._id == data._id.client_id)
                if (clientId) { data._id.client_name = clientId.name }
                else { data._id.client_name = "Not Found" }
            })
            resolve(response)
        }
        catch (error) {
            console.log("error :: ", error);
        }
    })
}

function emailDetailsStoringFunc(db, app) {
    return new Promise(async (resolve, reject) => {
        try {
            // we create body for email and other data to insert in db
            console.log(app, "app is here we are");
            let body = await bodyCreater(app)
            let notification_to = splitEmails(app.app.notification_to);
            console.log("notification to value is here", notification_to);
            let insertData = {
                from: smtp_config.mailfrom,
                to: notification_to,
                cc: "",
                bcc: smtp_config.bcc,
                subject: "[" + config.organization_name + "] Simplika API - Half Hourly Summary  [" + common.formatDateTime('datetime', '') + "]",
                body: body,
                created_time: new Date(),
                status: "Pending"
            }
            // before resolving we are storing data into db
            resolve(insertEmailDetails(db, insertData))
        }
        catch (error) {
            console.log("error :: ", error);
        }
    })
}

function insertEmailDetails(db, insertData) {
    return new Promise((resolve, reject) => {
        try {
            db.collection('send_email')
                .insertOne(insertData)
                .then(result => {
                    console.log("insertEmailDetails :", result.result);
                    resolve(true)
                })
        }
        catch (error) {
            console.log("error :: ", error);
        }
    })
}

function bodyCreater(app) {
    return new Promise((resolve, reject) => {
        let appdata = Object.keys(app)[0]
        let statusCodeParam = ""
        if (config && config.error_codes && config.error_codes.length > 0) {
            config.error_codes.forEach(el => {
                statusCodeParam += "&status_code=is:" + el.toString()
            })
        }
        else {
            statusCodeParam = "&status_code=is:500"
        }
        console.log("app : ======>>  ", ObjectId(app._id).toString(), app[appdata]._id);
        console.log("click hereee Urlll", `${config.frontend_url}/report?page=1&limit=10&app=${ObjectId(app[appdata]._id).toString()}&startDate=${common.formatDateTime('start-of-day', '')}&endDate=${common.formatDateTime('date-now', '')}${statusCodeParam}`)
        const finalTemplate = []
        const header = `<!DOCTYPE html>
        <html lang="en">
        
        <head>
            <link href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.0/css/bootstrap.min.css" rel="stylesheet" id="bootstrap-css">
            <script src="//maxcdn.bootstrapcdn.com/bootstrap/3.3.0/js/bootstrap.min.js"></script>
            <script src="//cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
            <!------ Include the above in your HEAD tag ---------->
            <script>
            function urlClick(){
                localStorage.setItem('isReport', true)
            }
            </script>
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
                    color: #ffffff !important;
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
        
                .managePadding {
                    padding-top: 0px;
                    padding-bottom: 0px;
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
                    <!--[if (gte mso 9)|(IE)]>            <table width="600" align="center">            <tr>            <td>            <![endif]-->
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
                                                <td class="inner contents" bgcolor="ffffff"> <span>Hi <b>{{APPLICATION_NAME}}</b> Team,</span> </td>
                                            </tr>
                                            <tr>
                                                <td class="inner contents" bgcolor="ffffff"> <span>Here is the client wise summary of your failed APIs in the last half hour :</span> </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>`
        const footer = `<tr>
                        <td class="one-column">
                            <table width="100%">
                                <tbody>
                                    <tr>
                                        <td class="inner contents managePadding" bgcolor="ffffff" style="padding-bottom: 5px;"> <span>To view a detailed report, <a style="text-decoration: none !important;color:blue !important;cursor:pointer" href="${config.frontend_url}/report?page=1&limit=10&app=${ObjectId(app[appdata]._id).toString()}&startDate=${common.formatDateTime('start-of-day', '')}&endDate=${common.formatDateTime('date-now', '')}${statusCodeParam}">click here</a>.</span> </td>
                                    </tr>
                                    <tr>
                                        <td class="inner contents managePadding" bgcolor="ffffff"> <span>Regards,</span> </td>
                                    </tr>
                                    <tr>
                                        <td class="inner contents managePadding" bgcolor="ffffff" style="padding-bottom: 5px;"> <span>SimplikA Team</span> </td>
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
                                        <td class="inner contents" style="background: -webkit-linear-gradient(left, #296490, #5eb95d);color: white;"> </td>
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
        const clientDetails = `
        `
        const tableHeader = `<tr bgcolor="ffffff">
        <td class="one-column" style="padding: 5px 15px 40px 15px">
            <table bgcolor="ffffff" style="border: 1px solid black; width:100%;">
                <thead>
                <tr>
                <th align="center" bgcolor="ffffff" colspan="4" style=" border: 1px solid black;border-collapse: collapse;padding: 5px" scope="col"><span style="font-weight:100"> Client : </span>{{CLIENT_NAME}} [ {{CLIENT_CODE}} ] </th>
                </tr>
                    <tr>
                        <th bgcolor="ffffff" style=" border: 1px solid black;border-collapse: collapse;padding: 5px" scope="col">Sr.No</th>
                        <th bgcolor="ffffff" style=" border: 1px solid black;border-collapse: collapse;padding: 5px" scope="col">API Method</th>
                        <th bgcolor="ffffff" style=" border: 1px solid black;border-collapse: collapse;padding: 5px" scope="col">API Endpoint URL</th>
                        <th bgcolor="ffffff" style=" border: 1px solid black;border-collapse: collapse;padding: 5px" scope="col">API Count</th>
                    </tr>
                </thead>
                <tbody>`
        const tableData = `<tr>
            <td bgcolor="ffffff" style=" border: 1px solid black;border-collapse: collapse;padding: 5px">{{i}}</td>
            <td bgcolor="ffffff" style=" border: 1px solid black;border-collapse: collapse;padding: 5px">{{METHOD}}</td>
            <td bgcolor="ffffff" style=" border: 1px solid black;border-collapse: collapse;padding: 5px">{{API_URL}}</td>
            <td bgcolor="ffffff" style=" border: 1px solid black;border-collapse: collapse;padding: 5px">{{API_COUNT}}</td>
        </tr>`

        const tableBody = `</tbody>
                </table>
            </td>
        </tr>`
        let newHeader = header.replace('{{APPLICATION_NAME}}', app.app.name)
        let finalObj = {}
        // here we structurize the data to make template
        app.result.forEach((client, i) => {
            if (finalObj[client._id.client_code]) {
                finalObj[client._id.client_code]["count"] += client.count
                let newObj = {
                    api_url: client._id.api_url,
                    api_code: client._id.api_code,
                    api_name: client._id.api_name,
                    api_id: client._id.api_id,
                    count: client.count,
                    method: client._id.method
                }
                let data = finalObj[client._id.client_code]["apiData"].some(api => api.api_code == newObj.api_code)
                if (data) {
                    finalObj[client._id.client_code]["apiData"].forEach(api => {
                        if (api.api_code == newObj.api_code) { api.count += newObj.count }
                    })
                }
                else { finalObj[client._id.client_code]["apiData"].push(newObj) }
            }
            else {
                console.log("client is here", client);
                finalObj[client._id.client_code] = {}
                finalObj[client._id.client_code]["client_code"] = client._id.client_code
                finalObj[client._id.client_code]["client_name"] = client._id.client_name
                finalObj[client._id.client_code]["client_id"] = client._id.client_id
                finalObj[client._id.client_code]["count"] = client.count
                finalObj[client._id.client_code]["method"] = client._id.method
                finalObj[client._id.client_code]["apiData"] = []
                let newObj = {
                    api_url: client._id.api_url,
                    api_code: client._id.api_code,
                    api_name: client._id.api_name,
                    api_id: client._id.api_id,
                    count: client.count,
                    method: client._id.method
                }
                finalObj[client._id.client_code]["apiData"].push(newObj)
            }
        })
        // template creation
        // now we are making template and replacing the data in template
        console.log("finalObj : ----> ", finalObj);
        let finalObjKeys = Object.keys(finalObj)
        finalObjKeys.forEach((element) => {
            let TotalAPICount = finalObj[element]["count"]
            let clientName = finalObj[element]["client_name"]
            let clientCode = finalObj[element]["client_code"]
            // let newClientDetails = tableHeader.replace("{{CLIENT_NAME}}", clientName)
            let newClientDetails = tableHeader.replace("{{CLIENT_CODE}}", clientCode)
            newClientDetails = newClientDetails.replace("{{CLIENT_NAME}}", clientName)

            // newClientDetails = newClientDetails.replace("{{TOTAL_API_COUNT}}", TotalAPICount)
            // finalTemplate.push(newClientDetails)
            finalTemplate.push(newClientDetails)
            // finalTemplate.push(tableHeader)
            finalObj[element]["apiData"].forEach((api, i) => {
                let newTableBodyRow = tableData.replace("{{i}}", i + 1)
                newTableBodyRow = newTableBodyRow.replace("{{METHOD}}", api["method"])
                newTableBodyRow = newTableBodyRow.replace("{{API_URL}}", api["api_url"])
                newTableBodyRow = newTableBodyRow.replace("{{API_COUNT}}", api["count"])
                finalTemplate.push(newTableBodyRow)
            })
            finalTemplate.push(tableBody)
        })
        finalTemplate.unshift(newHeader)
        finalTemplate.push(footer)
        resolve(finalTemplate.join(""))
        // console.log("finalObje :", JSON.stringify(finalObj));
        // console.log("template :", finalTemplate.join(""));
    })
}

function splitEmails(email) {
    let FinalArray = email.split(";");
    return FinalArray;
}