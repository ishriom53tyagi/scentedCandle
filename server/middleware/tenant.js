const config = require('../config.json');
const ObjectId = require('mongodb').ObjectId;
module.exports = async function (req, res, next) {


    if (config.tenant == 'multi') {

        if (req.headers && req.headers.hasOwnProperty('t_id')) {
            try {
                // if (req.headers.t_id == 'authentication')
                //     return next()
                const db = req.app.db
                let user_id = req.session.user_id
                let list = [];
                console.log(user_id, "wwqqqqq", req.headers.t_id,)
                list = await db.collection('users')
                    .find({ _id: ObjectId(user_id), tenants: ObjectId(req.headers.t_id) })
                    .toArray()
                if (list && list.length > 0)
                    return next();
                else
                    return res.status(403).send({ status: "403", message: "Access Denied" });

            }
            catch (err) {
                console.log("tennn", err)
                return responseData(res, false, 500);
            }

        }
        else {
            return res.status(403).send({ status: "403", message: "Access Denied" });

        }

    }
    else {
        console.log('insideeee tenant midlleware elseeeeee')
        return next();
    }

}