const ObjectId = require('mongodb').ObjectId;
const MongoClient = require('mongodb').MongoClient;
const config = require('../../../config.json');
const usernameNpassword = config.mongodb.username && config.mongodb.password ? config.mongodb.username + ":" + config.mongodb.password + "@" : ""
const mongodb_url = "mongodb://" + usernameNpassword + config.mongodb.host + ":" + config.mongodb.port + '/' + config.mongodb.db;
var _client, db;

MongoClient.connect(mongodb_url, { useUnifiedTopology: true }, async function (err, client) {

    db = client.db();
    _client = client;

    await client_access_api_to_app();
    console.log("---update done---")
    _client.close();

})

async function client_access_api_to_app() {
    try {
        let client_access_collection_check = await db.collection('api_partner_access').countDocuments({}, { limit: 1 })

        console.log("client_access_collection_check", client_access_collection_check)
        client_access_collection_check = client_access_collection_check == 1 ? true : false

        if (client_access_collection_check) {

            let apiData = await db.collection('api_managements')
                .find()
                .project({
                    _id: 1,
                    app_id: 1,

                })
                .toArray()
            // console.log("apiData", apiData)

            let clientAccessData = await db.collection('api_partner_access')
                .find()
                .toArray()

            // console.log("clientAccessData", clientAccessData)

            for (let i = 0; i < clientAccessData.length; i++) {
                let element = clientAccessData[i]

                let app = {};
                let clientApp = await db.collection('partners')
                    .find({ _id: ObjectId(element.client_id) })
                    .project({
                        _id: 0,
                        application_code: 1
                    })
                    .toArray()
                console.log("clientApp", clientApp)
                clientApp = clientApp.length > 0 ? clientApp[0].application_code : [];

                for (let i = 0; i < clientApp.length; i++) {

                    let appId = clientApp[i];
                    app[appId] = { api: {} }

                    let appsApi = apiData.filter(element1 => {

                        return element1.app_id.toString() == appId.toString()

                    })

                    appsApi.forEach(element2 => {
                        // console.log("kkk", typeof element2.id)
                        if (element.hasOwnProperty("api") && element.api.hasOwnProperty(element2._id))
                            app[appId].api[element2._id] = element.api[element2._id]

                    })

                    console.log("lasss", app[appId].api)
                    if ((Object.keys(app[appId].api)).length == 0)
                        delete app[appId]

                }
                console.log("apppp", app)


                await db.collection('api_partner_access')
                    .updateOne(
                        {
                            client_id: ObjectId(element.client_id)
                        },
                        {
                            $set: {

                                app: app,

                            }
                        },
                        { upsert: true }
                    )
            }

        }
        else {

            console.log("no data found")

        }

    } catch (error) {
        console.log("error : ", error);

    }
}


