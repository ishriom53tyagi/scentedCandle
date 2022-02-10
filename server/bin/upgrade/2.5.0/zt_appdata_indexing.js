
const MongoClient = require('mongodb').MongoClient;
const config = require('../../config.json');
const usernameNpassword = config.mongodb.username && config.mongodb.password ? config.mongodb.username + ":" + config.mongodb.password + "@" : ""
const mongodb_url = "mongodb://" + usernameNpassword + config.mongodb.host + ":" + config.mongodb.port + '/' + config.mongodb.db;
;
var _client, db;


MongoClient.connect(mongodb_url, { useUnifiedTopology: true }, async function (err, client) {
    db = client.db();
    _client = client;

    await setIndex();
    console.log("---update done---")
    _client.close();

})

async function setIndex() {
    try {
        let indexing = await db.listCollections({ "name": /^zt_appdata_/ }).toArray();

        for (var i = 0; i < indexing.length; i++) {
            console.log("collection Name:-->>>", indexing[i].name);
            await db.collection(indexing[i].name).createIndex({ "api": 1 })
        }

    } catch (error) {
        console.log("error : ", error);

    }
}


