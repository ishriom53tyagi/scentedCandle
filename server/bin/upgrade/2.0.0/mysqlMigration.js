const mysql = require('mysql');
const MongoClient = require('mongodb').MongoClient;
const config = require('../../config.json');
const mongodb_url = config.mongodb;

var connection = mysql.createConnection(
    {
        host: config.mysql.host,
        user: config.mysql.user,
        password: config.mysql.password,
        database: config.mysql.database
    }
);

connection.connect();

var _client, _db;

MongoClient.connect(mongodb_url, { useUnifiedTopology: true }, async function (err, client) {

    _db = client.db("simplika_1");
    _client = client;

    await usersMigration();
    console.log("---users done---")

    await applicationsMigration();
    console.log("---applications done----")

    await partnersMigration();
    console.log("---partners done----")

    await applicationAccess();
    console.log("---api_access-----");

    await statusCode();
    console.log("---status_code done-----")

    connection.end();
    _client.close();

})

async function applicationsMigration() {

    return executeQuery(connection, 'SELECT * FROM ibh_api_organisation')
        .then(async function (result) {

            for (const row of result) {
                var applications = applicationModel([row])
                var app_id = await _db.collection('applications').insertOne(applications[0])

                var managerResult = await executeQuery(connection, 'SELECT * FROM ibh_api_manager where api_org_code = ?', [row.org_code])
                if (managerResult.length != 0) {

                    var queryParamsResult = await executeQuery(connection, 'SELECT * FROM ibh_api_query_params', [])

                    var apiManager = apiManagerModel(managerResult, app_id, queryParamsResult);

                    await _db.collection('api_managements').insertMany(apiManager)

                }

            }

            return;
        })
}

async function partnersMigration() {

    return executeQuery(connection, 'SELECT * FROM ibh_mst_partner')
        .then(async function (result) {

            // console.log(result);
            for (const row of result) {
                var data = await executeQuery(connection, `SELECT distinct api_org_code from ibh_mst_partner_api_access join ibh_mst_partner on paa_prt_id = prt_id
                join ibh_api_manager on api_code = paa_api_code  where prt_code = ?`, [row.prt_code]);

                var a = [];
                if (data.length != 0) {
                    var arr = [];
                    data.forEach(ele => {
                        var obj = {}
                        obj.code = ele.api_org_code
                        arr.push(obj);
                    })

                    var apps = await _db.collection('applications').find({ $or: arr }, { code: 1 }).toArray()

                    apps.forEach(ele => {
                        a.push(ele._id);

                    })

                }
                row.application_code = a;
            }
            console.log("---a----", result);
            var partners = partnerModel(result)

            return _db.collection('partners').insertMany(partners)
        })
}

async function applicationAccess() {

    return _db.collection('partners').find({}).toArray()
        .then(async partners => {
            // console.log("--partners---", partners);

            for (const iterator of partners) {
                console.log("---it---", iterator);
                var partner_id = iterator._id;

                var access = await executeQuery(connection, 'SELECT paa_api_code ,paa_status, prt_code from ibh_mst_partner_api_access join ibh_mst_partner on paa_prt_id=prt_id where prt_code = ?', [iterator.code])
                console.log("---access---", access);
                if (access.length != 0) {

                    var arr = []

                    access.forEach(a => {
                        var obj = {};
                        obj.code = a.paa_api_code
                        arr.push(obj);
                    });
                    // console.log("--arr---",arr);

                    var apis = await _db.collection('api_managements').find({ $or: arr }).toArray()
                    // console.log("---apis---",apis);
                    var objApi = {};
                    objApi.client_id = partner_id;
                    objApi.api = {}

                    apis.forEach(a => {

                        objApi.api[a._id] = {};
                        objApi.api[a._id].status = 1;
                        objApi.api[a._id].metric_type = 0;
                        objApi.api[a._id].metric_rate = 0;
                    });
                    console.log("---obj----", objApi);

                    var api_access = await _db.collection('api_partner_access').insertOne(objApi);
                    // console.log("---api_acc---", api_access);
                }
            }

        })
}

async function usersMigration() {

    var users = {
        "code": "admin",
        "first_name": "Venkatesh",
        "last_name": "Shetty",
        "preferred_name": "Venkatesh",
        "email": "venkatesh.g@vernost.in",
        "password": "72d224d342638722965fa0df997f91ab2e9ed94d",
        "address": "andheri",
        "contact": "989898989898",
        "user_status": "1",
        "is_super_admin": 1,
        "created_time": Math.floor(new Date().getTime() / 1000),
        "is_email_sent": 2
    }

    return _db.collection('users').insert(users)
}

async function statusCode() {

    var status_code = [{ code: '301', message: 'API authentication failed' },
    { code: '302', message: 'Invalid credentials' },
    { code: '303', message: 'insufficient access' },
    { code: '304', message: 'Autherization Error' },
    {
        code: '305',
        message: 'Authorization header should not be blank'
    },
    { code: '200', message: 'Success' },
    { code: '401', message: 'Invalid Method' },
    { code: '402', message: 'Invalid Parameters' },
    {
        code: '400',
        message:
            'Invalid Request please check documentation or contact to service provider'
    },
    { code: '800', message: 'No results found' },
    { code: '601', message: 'Gateway timeout error' },
    { code: '500', message: 'Internal Server Error' },
    { code: '801', message: 'No results' },
    { code: '700', message: 'Parameters not found' }]

    await _db.collection('status_codes').insertMany(status_code);

    return;
}

function partnerModel(partners) {
    var arr = [];

    partners.forEach(partner => {
        var obj = {};
        obj.application_code = partner.application_code;
        obj.code = partner.prt_code;
        obj.supplier_id = partner.prt_supplier_id;
        obj.name = partner.prt_name;
        obj.email = partner.prt_emailid;
        obj.contact = partner.prt_mobile;
        obj.user_id = partner.prt_code;
        obj.password = partner.prt_api_key;
        obj.active_from = partner.prt_active_from;
        obj.active_to = partner.prt_active_to;
        obj.currency = partner.prt_currency;
        obj.status = partner.prt_status;
        obj.created_time = Math.floor(new Date(partner.prt_created_at).getTime() / 1000);
        obj.api_key = partner.prt_api_key;
        obj.contact_name = partner.prt_contact_name;
        obj.private_api_key = partner.prt_private_api_key;
        arr.push(obj);
    });

    return arr;
}

function applicationModel(applications) {
    var arr = [];

    applications.forEach(app => {
        var obj = {};
        obj.code = app.org_code;
        obj.name = app.org_name;
        obj.description = app.org_desc;
        obj.prod_base_path = app.org_prod_base_path ? app.org_prod_base_path : "NA";
        obj.uat_base_path = app.org_uat_base_path ? app.org_uat_base_path : "NA";
        obj.dev_base_path = app.org_dev_base_path;
        obj.notification_to = app.org_notification_to;
        obj.app_logo = app.org_app_logo;
        obj.postman_collection = app.org_postman_collection;
        obj.status = 1;

        arr.push(obj);
    });

    return arr;
}


function apiManagerModel(manager, app_id, queryParam) {
    var arr = [];

    manager.forEach(app => {
        console.log("--app.api_route_rule--", app.api_route_rule);
        var obj = {};
        obj.code = app.api_code;
        obj.short_description = app.api_short_description;
        obj.description = app.api_description;
        obj.group_code = app.api_group_code;
        obj.api_type = app.api_type;
        obj.api_url = app.api_url;
        obj.api_method = app.api_method == "p" ? "POST" : "GET";
        obj.api_headers = headers(app.api_header);
        obj.api_header_details = app.api_header_details;
        obj.api_request = app.api_request;
        obj.api_response = app.api_response;
        obj.created_time = Math.floor(new Date(app.api_created_at).getTime() / 1000);
        obj.app_code = app.api_org_code;
        obj.app_id = app_id.insertedId;
        obj.api_query_params = queryParams(app.api_code, queryParam)
        obj.terms = app.api_terms;
        obj.subscription_type = app.api_subscription_type;
        obj.subscription_price = app.api_subscription_price;
        obj.query_params_details = app.api_query_params_details;
        obj.body_details = app.api_body_details;
        obj.response_details = app.api_response_details;
        obj.sample_response = app.api_sample_response;
        obj.status = 1;
        obj.direct_route = app.api_route_url;

        try {
            if (app.api_route_rule != null && app.api_route_rule != "")
                obj.conditional_route = JSON.parse(JSON.parse(JSON.stringify(app.api_route_rule).replace(/(?:\\[rn]|[\r\n]+)+/g, "")));
        } catch (err) {
            console.log("---err---", err);
            obj.conditional_route = ""
        }
        arr.push(obj);
    });

    return arr;
}

function headers(str) {
    var arr = [];
    try {
        // console.log("--aaa----", str);
        if (str && str != '') {
            var s = JSON.parse(str);
            for (const a in s) {
                var o = {};
                o.name = a;
                o.value = s[a];
                o.required = true;
                arr.push(o);
            }
        }
        return arr;
    } catch (err) {
        return arr;
    }
}


function queryParams(api_code, param) {

    var arr = [];

    try {
        param.forEach(element => {
            // console.log("--query----", element.qparam_api_code,  api_code);
            if (element.qparam_api_code == api_code) {
                var o = {};
                o.name = element.qparam_name;
                o.description = element.qparam_description;
                o.required = element.qparam_is_req == '1' || element.qparam_is_req == 1 ? true : false;
                arr.push(o);
            }

        });
        return arr;
    } catch (err) {
        return arr;
    }
}

function executeQuery(connection, query, values) {
    return new Promise((result, reject) => {
        connection.query(query, values, function (err, rows, fields) {
            if (err) {
                console.log(err);
                result(err);
            };
            result(rows);
        });
    });
}