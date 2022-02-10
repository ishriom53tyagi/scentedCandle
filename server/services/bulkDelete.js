
const ObjectId = require('mongodb').ObjectId;
const ipAddress = require('../utils/common');
const systemLog = require('../services/systemLog');
const common = require('../utils/common')
module.exports.bulkDelete = async function (req, res) {
    try {
        const db = req.app.db;
        var reqBody = req.body
        console.log(req.body)



        if (reqBody.confirmText == 'DELETE' && reqBody.data.length && reqBody.key) {

            let key = reqBody.key
            objData = [];
            reqBody.data.forEach(element => {
                objData.push(ObjectId(element))
            });



            let collectionName = key == 'access_controls' ? 'access_controls' : key == 'api' ? 'api_managements' : key == 'applications' ? 'applications' : key == 'clients' ? 'partners' : key == 'status_codes' ? 'status_codes' : ''
            collectionName = common.collectionNameGenerator(req.headers, collectionName)
            let collecName = common.collectionNameGenerator(req.headers, "applicarions")
            let collecName1 = common.collectionNameGenerator(req.headers, "api_managements")

            if (collectionName == '')
                return res.status(500).send({ status: 'failure' });

            console.log(collectionName
            )
            if (collectionName == collecName) {
                for (let i = 0; i < objData.length; i++) {
                    db.collection(collecName1).deleteMany({ app_id: objData[i] }, function (err, obj) {
                        if (obj.deletedCount > 0) {
                            console.log("deleted Api count", obj.deletedCount);
                        }
                    });
                }
            }
            await db.collection(collectionName).deleteMany(
                { _id: { $in: objData } }

            ).then(result => {
                console.log(result)
                if (result && result.deletedCount > 0) {

                    let obj1 = {
                        action: reqBody.key + "_bulk_delete",
                        data: reqBody.key + " : " + result.deletedCount,
                        user_id: req.session.user_id,
                        ip_address: ipAddress.ipAddress(req)
                    }
                    systemLog.logData(obj1)
                    return res.status(200).send({ status: 'success', result });

                }
                else {
                    return res.status(500).send({ status: 'failure' });
                }
            })
        }
        else
            return res.status(500).send({ status: 'failure' });

    }
    catch (err) {
        console.log("error ", err);
        return res.status(500).send({ status: 'failure' });
    }
}