const rethinkdb = require('rethinkdb');
const MongoClient = require('mongodb').MongoClient;
const db = require('../../config.json');
const mongodb_url = db.mongodb;

var connection;
var _client, _db;

var api_managements_data = []
var applications_data = []

const created_on_for_document = '11'

MongoClient.connect(mongodb_url, { useUnifiedTopology: true }, async function (err, client) {
    _db = client.db("simplika_1");
    _client = client;
    await idandCode()
    for (let i = 0; i <= 200; i++) {
        await select(20, 0);
        console.log("done ", i);
    }
    _client.close();
    process.exit()
})


async function createConnecttion() {
    if (connection == undefined) {
        try {
            connection = await rethinkdb.connect({ host: db.rethink.host, port: db.rethink.port, db: 'simplica_db' })
            return connection;
        } catch (e) {
            return null;
        }
    } else {
        return connection;
    }
}

async function select(limit, offset) {
    console.log("---offset----", limit, offset)
    return rethinkdb.table('logJul2020')
        .slice(offset, limit + offset)
        .run(await createConnecttion())
        .then(async cursor => {
            var result = await cursor.toArray();
            if (result.length == limit) {
                // console.log("---res----", result.length)
                // console.log("---res----", result)
                // result.forEach(res => {
                // res.mid = "Interbook 3.0"
                // res.mid = "Hotels 3.0 application"
                // if (res.apicode != null) {
                // console.log(res.apicode.appid);
                // res.apicode.appid = "interbook"
                // res.apicode.appid = "hotels3.0"
                // }
                // });
                // // process.exit()
                let newResult = await newDataCreator(result)
                await createAndInsert(newResult)
                await select(limit, limit + offset)
                return;
            } else
                return;
        })
}


function createAndInsert(result) {
    return new Promise(async (resolve, reject) => {
        try {
            let collectionOne = "zt_appdata_<CNAME>_122020";
            let collectionTwo = "zt_appresponse_<CNAME>";
            for (element of result) {
                if (element.client_code != null) {
                    // console.log(element);
                    collectionOne = collectionOne.replace('<CNAME>', element.client_id)
                    collectionTwo = collectionTwo.replace('<CNAME>', element.client_id)
                    // console.log(collectionOne, collectionTwo);
                    await _db.collection(collectionTwo)
                        .insertOne({
                            trace_id: element.trace_id,
                            response: element.response,
                            created_on: element.created_on
                        })
                        .then(result => {
                            // console.log("collectionTwo : ", result.result, result.insertedCount, result.insertedId);
                        })
                        .catch(e => {
                            console.log("collectionTwo error : ", e);
                        })
                    delete element.response
                    await _db.collection(collectionOne)
                        .insertOne(element)
                        .then(result => {
                            // console.log("collectionOne : ", result.result, result.insertedCount, result.insertedId);
                        })
                        .catch(e => {
                            console.log("collectionOne error : ", e);
                        })
                }
            }
            resolve(true)
        }
        catch (e) {
            console.log("e :", e);
            resolve(true)
        }
    })
}

async function idandCode() {
    _db.collection('api_managements')
        .aggregate([
            {
                $project: { _id: 1, code: 1, short_description: 1 }
            }
        ])
        .toArray()
        .then(api_managements => {
            console.log(true);
            api_managements_data = api_managements
        })

    _db.collection('applications')
        .find()
        .project({ _id: 1, code: 1, name: 1 })
        .toArray()
        .then(applications => {
            if (applications.length > 0) {
                console.log(true)
                applications_data = applications
            }
            else {
                console.log(false)
            }
        })
}


function newDataCreator(data) {
    return new Promise(async (resolve, reject) => {
        let newdata = []
        for (element of data) {
            if (element.type == 'response') {
                let sampleObj = {
                    api: element.api,
                    type: element.type,
                    trace_id: element.id,
                    api_info: await getapi_info(element.apicode),
                    method: element.method,
                    agent: element.agent,
                    headers: element.headers,
                    browserip: element.browserip,
                    client_id: await getClientId(element.mid),
                    client_code: element.mid,
                    request_url: element.url,
                    request_body: element.body,
                    status_code: element.status,
                    created_on: await dateChanger(element.created_on),
                    response_size: 0,
                    response_time: element.time,
                    response: element.response
                }
                // console.log("sampleObj :", sampleObj);
                newdata.push(sampleObj)
            }
        }
        // console.log("newData = : ", newdata);
        resolve(newdata)
    })
}

function dateChanger(date) {
    return new Promise((resolve, reject) => {
        date.setMonth(created_on_for_document)
        resolve(date)
        // process.exit()
    })
}

function getapp_id(appid) {
    return new Promise((resolve, reject) => {
        if (appid == null) {
            resolve(null)
        }
        else {
            applications_data.forEach(element => {
                if (element.code == appid) {
                    resolve(element._id)
                }
            })
            resolve(null)
        }
    })
}

function getClientId(mid) {
    return new Promise((resolve, reject) => {
        if (mid == null) {
            resolve(null)
        }
        else {
            applications_data.forEach(element => {
                // console.log(mid,"mid", element.code);
                if (element.code.toLowerCase() == mid.toLowerCase()) {
                    resolve(element._id)
                }
            })
            resolve(null)
        }
    })
}

function getapi_id(apiid) {
    return new Promise((resolve, reject) => {
        if (apiid == null) {
            resolve(null)
        }
        else {
            api_managements_data.forEach(element => {
                if (element.code == apiid) {
                    resolve(element._id)
                }
            })
            resolve(null)
        }
    })
}

function getapi_info(apicode) {
    return new Promise(async (resolve, reject) => {
        if (apicode == null) {
            resolve(null)
        }
        else {
            resolve({
                app_id: await getapp_id(apicode.appid),
                app_code: apicode.appid,
                api_id: await getapi_id(apicode.id),
                api_code: apicode.id,
                type: apicode.type,
                route: apicode.route,
                params: apicode.params
            })
        }
    })
}

