const ObjectId = require('mongodb').ObjectId;
const MongoClient = require('mongodb').MongoClient;
const config = require('../../../config.json');
const usernameNpassword = config.mongodb.username && config.mongodb.password ? config.mongodb.username + ":" + config.mongodb.password + "@" : ""
const mongodb_url = "mongodb://" + usernameNpassword + config.mongodb.host + ":" + config.mongodb.port + '/' + config.mongodb.db;
var _client, db;

MongoClient.connect(mongodb_url, { useUnifiedTopology: true }, async function (err, client) {

    db = client.db();
    _client = client;

    let result = await role_code_update();
    console.log("---update done---", result)
    _client.close();

})

async function role_code_update() {
    try {

        let apiData = await db.collection('roles')
            .find()
            .project({
                _id: 1,
                role_code: 1,

            })
            .toArray()
        console.log("apiData", apiData)

        if (apiData && apiData.length > 0) {
            for (let i = 0; i < apiData.length; i++) {
                let element = apiData[i]
                console.log("role", element)

                let codeForUpdate = ''
                if (element.role_code.toLowerCase() == 'superadmin')
                    codeForUpdate = '3247693b'
                else if (element.role_code.toLowerCase() == 'admin')
                    codeForUpdate = '7f5acfc6'
                else if (element.role_code.toLowerCase() == 'user')
                    codeForUpdate = 'bb063bfd'
                else
                    codeForUpdate = 'bb063bfd'



                let updatedData = await db.collection('users')
                    .updateMany(
                        { role_id: ObjectId(element._id), is_deleted: { $exists: 0 } },
                        {
                            $set: {

                                role_code: codeForUpdate,

                            }
                        }
                    )


                console.log('updatedData', JSON.stringify(updatedData.result))
            }
        }
        return true;

    } catch (error) {
        console.log("error : ", error);
        return false;
    }
}


