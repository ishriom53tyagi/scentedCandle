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



module.exports.saveAnonymousUserSession = async function (req, res) {
    const db = getDb();

    if(req.body.userCookie) {
        let user = await db.collection('anonymousUser').find({ userId : req.body.userCookie }).toArray();

        if(user && user.length > 0 )
        {
            return responseData(res, true, 200, 'already exist');
        }
       let unused =  await db.collection('anonymousUser').insertOne({ userId : req.body.userCookie });
       return responseData(res, true, 200, 'updated');
    }
    return responseData(res, false, 500, 'internal server error');

}