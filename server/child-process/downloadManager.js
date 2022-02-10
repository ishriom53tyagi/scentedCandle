const ObjectId = require('mongodb').ObjectId;
var path = require('path');
const async = require('async');
const fastcsv = require("fast-csv");
var fileSystem = require("fs");
var config = require('../config.json')
var report = require('../services/report')
const common = require('../utils/common');
var headers;

module.exports.bulkReportDownload = async function (db, message) {
    try {
        if (message.query === "download") {
            headers = message.headers
            console.log("inside child process bulkReportDownload mainnnnnnn functionnnn");
            bulkDownload(db, message);


        }

    }
    catch (err) {
        console.log(err)
        onExit()
    }

}

function bulkDownload(db, message) {
    if (message && message.request && message.request.query)
        delete message.request.query
    let count = 0;

    // console.log("inside child process bulkDownload functionnnn", message);

    const numsGroup = Math.ceil(message.total / config.limit.large_data);


    const result = new Array(numsGroup)
        .fill('')

    async.eachSeries(result, async (dataPart, callback) => {
        let startInd = count * config.limit.large_data

        let request = { 'body': message.request }
        request.body.offset = startInd
        request.body.limit = config.limit.large_data
        request.db = db

        console.log("start index", request.body.offset)
        console.log("app_id", message.app_id)
        console.log("request for get report", request.body)
        let data = await report.getReportData(request)
        let data1 = data.report

        // data1 = data1.map(({ _id, trace_id, headers, client_code, request_url, response_size, api_info, client_id, created_on, ...rest }) => ({ ...rest }));

        data1 = data1.map(el => {
            let data = {}
            message.columnKey.forEach(e => {
                if (e == 'request_body') {
                    el[e] = report.masking_process(message.maskSet, JSON.parse(el[e]))
                    el[e] = JSON.stringify(el[e])
                }
                if (e === "target_status_code" || e === "proxy_status_code") {
                    if (el[e] == "" || el[e] == undefined || el[e] == null) {
                        el[e] = "NA"
                    }
                }
                data[e] = el[e]
            })
            return data;
        });

        let newurl = await report.fastcsvDownload(message.app_id, data1, startInd, data1.length, message.columnValue)

        let newUrlArray = newurl.split('/')
        let file = newUrlArray[newUrlArray.length - 1]

        console.log("created file", file)
        let collecName = common.collectionNameGenerator(headers, 'download_manager')

        await db.collection(collecName)
            .updateOne(
                { _id: ObjectId(message.idVal) },
                { $push: { files: file }, $set: { total: numsGroup, completed_download: count + 1, status: 'In progress' } }, { upsert: true })
        count += 1;
        return callback()

    }, async function (err, results) {
        let end_time = Math.floor(((new Date()).getTime()) / 1000)
        let collecName = common.collectionNameGenerator(headers, 'download_manager')

        await db.collection(collecName)
            .updateOne({ _id: ObjectId(message.idVal) },
                { $set: { status: 'Completed', end_time: end_time, completed_download: count } }, { upsert: true })
        // .then(result2 => {
        console.log(" child  processss completed")

        onExit();
    });


}


function onExit() {
    try {
        console.log("exit now");
        process.kill(process.pid, 'SIGTERM')
        // process.exit()
    }
    catch (err) {
        console.log(err);
    }
}