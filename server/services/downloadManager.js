const { responseData } = require('../utils/responseHandler');
const common = require('../utils/common');
const getDb = require('../utils/database').getDb;
const ObjectId = require('mongodb').ObjectId;
const config = require('../config.json');
var moment = require('moment');
// moment.relativeTimeThreshold('m', Number.MAX_VALUE);  // Never display hours
moment.relativeTimeThreshold('s', 60); // Display minutes when 60 seconds has been reached
moment.relativeTimeThreshold('ss', 0); // Never display "a few seconds"

module.exports.getData = async function (req, res) {
    try {

        const db = getDb();
        var body = req.body
        console.log("bboooooo", body);
        let collecName = common.collectionNameGenerator(req.headers, 'applications')

        var appdata = await db.collection(collecName)
            .find()
            .project({ _id: 1, name: 1 })
            .toArray()


        //for all 
        let collecName1 = common.collectionNameGenerator(req.headers, 'download_manager')

        var respData = []
        if (body && body.id) {

            respData = await db.collection(collecName1)
                .find({ _id: ObjectId(body.id) })
                .toArray()
        }
        else {
            respData = await db.collection(collecName1).find()
                .sort({ start_time: -1 })
                // .skip(body.offset ? body.offset : 0)
                // .limit(body.limit ? body.limit : 10)
                .toArray();

            var totalcount = await db.collection(collecName1)
                .countDocuments()
        }

        respData.forEach(element => {
            let index = appdata.findIndex(element1 => element1._id == element.app_id)

            element.name = index >= 0 ? appdata[index].name : "NA"

            element.time_taken = element.end_time && element.start_time ? moment.duration((element.end_time - element.start_time), "seconds").humanize() : 'NA';


            element.report_start_date = common.momentTimeZone(req, element.report_start_date, 'DD-MM-YYYY', false);

            element.report_end_date = common.momentTimeZone(req, element.report_end_date, 'DD-MM-YYYY', false);

            element.start_time = element.start_time ? common.momentTimeZone(req, element.start_time) : 'NA';

            element.end_time = element.end_time ? common.momentTimeZone(req, element.end_time) : 'NA';

            if (element && element.files && element.files.length > 0) {
                let temp = []
                element.files.forEach(el => {
                    temp.push(config.backend_url + config.csv_downoad_url + "/" + el);
                })
                element.files = temp
            }

        })
        if (body && body.id) {
            return res.status(200).send({ status: 'success', data: respData });
        }
        else {
            return res.status(200).send({ status: 'success', data: respData, total: totalcount });

        }
    } catch (error) {
        console.log("Error ", error);
        return responseData(res, false, 500);
    }
}