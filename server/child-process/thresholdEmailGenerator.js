
const ObjectId = require('mongodb').ObjectId;
const { smtp_config } = require('../config.json');
const config = require('../config.json');
var moment = require('moment');

module.exports.createEmail = async function (db, data) {
    try {
        await finalStructure(db);
        onExit();

    } catch (e) {
        console.log("error", e);
        onExit();
    }

}

async function finalStructure(db) {
    try {

        var raw_data_email = await db.collection('threshold_email_data').find({ status: 'Pending' }).toArray()
        if (raw_data_email.length > 0) {
            for (var element of raw_data_email) {
                let template
                let subject
                if (element.type == 'threshold_email_data') {
                    template = emailBodyThreshold(element);
                    subject = "[" + config.organization_name + "] Simplika - Threshold Limit Reached  [" + momentDateTime(element.created_time * 1000) + "]"
                }
                if (element.type == 'metering_email_data') {
                    template = emailBodyMetering(element);
                    subject = "[" + config.organization_name + "] SimplikA - API Rate Limit exceeded  [" + momentDateTime(element.created_time * 1000) + "]"
                }
                let id = element._id
                let spliitedEmailsClient = splitEmails(element.client_email);
                let splittedEmailsApp = splitEmails(element.notification_to);
                console.log("Metering value reached :----->>", splittedEmailsApp, spliitedEmailsClient);
                let send_result = await db.collection('send_email')
                    .insertOne({
                        from: smtp_config.mailfrom,
                        to: spliitedEmailsClient,
                        cc: splittedEmailsApp,
                        bcc: smtp_config.bcc,
                        subject: subject,
                        body: template,
                        created_time: Math.floor(((new Date()).getTime()) / 1000),
                        status: 'Pending'
                    })
                if (send_result) {
                    await db.collection('threshold_email_data')
                        .updateOne(
                            {
                                _id: ObjectId(id)
                            },
                            {
                                $set: {
                                    status: 'completed',
                                }
                            })
                }
            }

        } else {
            console.log("Not found");
        }
    }
    catch (err) {
        console.log("err is here", err);
        onExit();
    }
}

function emailBodyThreshold(data) {

    let msBeforeNext = convertMS(data.msBeforeNext);
    let rem = generateString(msBeforeNext);

    // let type = metric_type(data.metricType);
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
                                                    <span>Dear ${data.client_name},</span>
                                                    </td>
                                                    </tr>
                                                    <tr>
                                                        <td class="inner contents" bgcolor="ffffff">
                                                        <span> You have used </span> <b>${data.threshold}</b> <span>API calls from your <b>${data.metricRate}</b>(max limit) for the API <b>${data.route}</b> </span><span> of application <b>${data.applicationName}.</b></span><br>
                                                        <br>
                                                        Just a friendly reminder that the API would get blocked once the limit is reached and won't be accessible for the next <b>${rem}</b> </span><br>
                                                        <br>
                                                        Thanks for using the API!
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


function emailBodyMetering(data) {

    let msBeforeNext = convertMS(data.msBeforeNext);
    let rem = generateString(msBeforeNext);
    let type = metric_type(data.metricType);
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
                                                    <span>Dear ${data.client_name},</span>
                                                    </td>
                                                    </tr>
                                                    <tr>
                                                        <td class="inner contents" bgcolor="ffffff">
                                                        <span> You have reached your ${type} limit of </span> <b>${data.metricRate}</b> <span>API calls for the API <b>${data.route}</b> </span><span> of application <b>${data.applicationName}.</b></span><br><br>
                                                        This API has been blocked for next <b>${rem}</b> To unblock this API , please contact admin.</span><br>
                                                       
                                                        <br>Thanks for using the API!
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

function convertMS(milliseconds) {
    var day, hour, minute, seconds, month;
    seconds = Math.floor(milliseconds / 1000);
    minute = Math.floor(seconds / 60);
    hour = Math.floor(minute / 60);
    minute = minute % 60;
    day = Math.floor(hour / 24);
    hour = hour % 24;
    month = Math.floor(day / 30);
    day = day % 30;
    return {
        day: day,
        hour: hour,
        minute: minute,
        month: month
    };
}

function generateString(obj) {
    let finalString = '';

    if (obj.month > 0) {
        finalString = obj.month + " month(s)";
    }
    if (obj.day > 0) {
        if (obj.month == 0) {
            finalString = obj.day + " day(s) ";
        } else {
            finalString = obj.day + " day(s).";
        }

    }
    if (obj.hour > 0 && obj.month == 0) {
        if (obj.day == 0) {
            finalString = finalString + obj.hour + " hour(s) ";
        } else {
            finalString = finalString + obj.hour + " hour(s).";
        }

    }
    if (obj.minute > 0 && obj.day == 0) {
        finalString = finalString + obj.minute + " minute(s).";
    }

    return finalString;
}

function metric_type(metric) {
    let duration;
    switch (metric) {
        case 0:
            duration = 'Unlimited';
            break;
        case 1:
            duration = 'Hourly';
            break;
        case 2:
            duration = 'Daily';
            break;
        case 3:
            duration = 'Weekly';
            break;
        case 4:
            duration = 'Monthly';
            break;
        case 5:
            duration = 'Yearly';
            break;
        default:
            duration = 'infinity';
    }
    return duration;

}

function onExit() {
    try {
        console.log("exit now");
        process.kill(process.pid, 'SIGTERM')
    }
    catch (err) {
        console.log(err);
    }
}
function momentDateTime(e) {
    let timeZone = /\((.*)\)/.exec(new Date().toString())[1]
    if (timeZone == "Coordinated Universal Time") {
        return moment().utcOffset("+05:30").format('MMMM Do YYYY, h:mm a');
    }
    return moment(e).format('MMMM Do YYYY, h:mm a');
}

function splitEmails(email) {
    let FinalArray = email.split(";");
    return FinalArray;
}