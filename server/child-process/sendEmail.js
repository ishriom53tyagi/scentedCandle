
const nodemailer = require('nodemailer');
const configSMTP = require('../config.json').smtp_config;
const ObjectId = require('mongodb').ObjectId;

module.exports.sendEmail = async function (db, data) {
    try {
        var id;
        var val = await db.collection('send_email').find({ status: 'Pending' }).toArray()
        if (val.length > 0) {
            for (const element of val) {
                var mailOptions = {
                    from: [element.from],
                    to: [element.to],
                    cc: [element.cc],
                    bcc: [element.bcc],
                    subject: element.subject,
                    html: element.body
                };
                id = element._id;
                await outGoing(mailOptions, id, db);
            }
            onExit();
        }
        else {

            console.log("No email Found");
            onExit();
        }
    }
    catch (err) {
        onExit();
        console.log("error ", err);
        onExit();
        //return responseData(res, false, 500);
    }
}

function outGoing(mailOptions, id, db) {
    return new Promise((resolve, reject) => {
        var transporter = nodemailer.createTransport({
            host: configSMTP.host,
            secure: true, // use SSL
            auth: {
                user: configSMTP.auth.user, // neeta
                pass: configSMTP.auth.pass, //pwd
            },
        });
        transporter.sendMail(mailOptions, async function (error, info) {
            if (error) {
                console.log(error);

                resolve(error)
                onExit();
                // return responseData(info, true, 400, 'Error in Sending Email', { error });
            } else {
                // return responseData(info, true, 200, 'Email Sent', { info });
                try {
                    await db.collection('send_email')
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
                catch (e) {
                    console.log(e);
                    onExit();
                }
                console.log("============ Email Sent ============");
                resolve(info.response);
            }
        });
    })
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