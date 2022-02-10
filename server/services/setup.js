const config = require('../config.json')
const common = require('../utils/common')
const tenant = require('./tenant')
const ObjectId = require('mongodb').ObjectId;

module.exports.setupCheck = async function (req, res) {
    try {

        const db = req.app.db

        let setupCheck = await db.collection('users').countDocuments({}, { limit: 1 })
        setupCheck = setupCheck == 1 ? "true" : "false"

        return res.status(200).send({ status: 'success', setupCheck });
    }
    catch (err) {
        console.log("Error ", err);
        return res.status(500).send({ status: 'failure' });
    }
}

module.exports.setup = async function (req, res) {
    try {

        const db = req.app.db;
        let usrexist = await db.collection('users').countDocuments({}, { limit: 1 })
        if (usrexist == 1)
            return res.status(500).send({ status: 'failure' });
        var reqBody = req.body;
        var finalResp = false;

        if (config.tenant == 'multi' && reqBody.t_name) {
            let code = await tenant.getRandomString(db)
            var tenants = await db.collection('tenants')
                .insertOne(
                    {
                        name: reqBody.t_name,
                        created_by: '',
                        code: code,
                        created_time: Math.floor(((new Date()).getTime()) / 1000)
                    })
        }
        console.log("tenantsss", tenants);
        let encryptedpswd = await common.sha1Hash(reqBody.password, false);

        var stObj = {
            first_name: reqBody.first_name,
            last_name: reqBody.last_name ? reqBody.last_name : "",
            preferred_name: "",
            email: reqBody.email,
            password: encryptedpswd,
            address: "NA",
            contact: "",
            user_status: 1,
            role_code: "3247693b",
            is_super_admin: 1,
            gender: "",
            country_code: reqBody.country,
            created_time: Math.floor(((new Date()).getTime()) / 1000)
        }
        if (config.tenant == 'multi' && reqBody.t_name) {

            stObj.tenants = [tenants.insertedId]
        }

        let users = await db.collection('users')
            .insertOne(stObj)
        console.log("usersss", users);

        if (config.tenant == 'multi' && reqBody.t_name) {

            await db.collection('tenants')
                .updateOne(
                    {
                        _id: ObjectId(tenants.insertedId)
                    },
                    {
                        $set: {

                            created_by: users.insertedId,

                        }
                    })

        }
        let frontend = {
            "header_keys": [],
            "query_params_keys": []
        }

        let newValues = {
            frontend: frontend
        }
        if (config.tenant == 'multi' && reqBody.t_name) {
            await db.collection('configurations_' + tenants.insertedId)
                .insertOne(newValues)
        }
        else {
            await db.collection('configurations')
                .insertOne(newValues)
        }

        let settingData = {
            "security": {
                "login_attempts": "",
                "login_block_time": "",
                "password_length": "",
                "number_password": "1",
                "uppercase_password": "0",
                "symbol_password": "1",
                "expire_pwd_days": "",
                "amt_pwd_reuse": ""
            }
        }
        await db.collection('settings')
            .insertOne(settingData)
        finalResp = true;

        return res.status(200).send({ status: 'success', finalResp });


    }
    catch (error) {
        console.log("Error ", error);
        return res.status(500).send({ status: 'failure' });
    }
}