const config = require('../config');
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const dbOptions = config.mongodb.options;
var dbName;
var bulkApiProcess = require('./bulkApiManagement');
var sendEmailProcess = require('./sendEmail');
const { errorStatusCodeMailer } = require("./emailDetailsStore")
var threholdEmailProcess = require('./thresholdEmailGenerator');
var downloadManager = require('./downloadManager');

dbName = (config.mongodb.host + ':' + config.mongodb.port + '/' + config.mongodb.db);

if (config.mongodb.username && config.mongodb.password) {
    dbName = config.mongodb.username + ":" + config.mongodb.password + "@" + dbName;
}

if (dbName.indexOf('mongodb://') !== 0) {
    dbName = 'mongodb://' + dbName;
}

let _db;

const mongoConnect = callback => {
    MongoClient.connect(
        dbName, dbOptions
    )
        .then(client => {
            console.log('Connected!');
            _db = client.db();
            callback();
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
};

const getDb = () => {
    if (_db) {

        return _db;
    }
    throw 'No database found!';
};

const closeDb = () => {
    _db.close();
    return;
}

process.on('message', async (message) => {

    mongoConnect(async () => {
        const db = getDb();
        if (message.process === "bulk-api-process") {
            bulkApiProcess.bulkInsertApiUrl(db, message);
        }
        else if (message.process == "send-email-process") {
            sendEmailProcess.sendEmail(db, message)
        }
        else if (message.process == "add-email-schedular") {
            await errorStatusCodeMailer(db)
            console.log("all email details storing task has been done.");
        }
        else if (message.process == "add-threshold-email-schedular") {
            threholdEmailProcess.createEmail(db, message)
        }
        else if (message.process == "download-manager-process") {
            downloadManager.bulkReportDownload(db, message)
        }
    });

});
