const mongodb = require('mongodb');
const config = require('../config.json');
const MongoClient = mongodb.MongoClient;
const dbOptions = config.mongodb.options;

module.exports.dbNameUrl = function() {
    var dbName = (config.mongodb.host + ':' + config.mongodb.port + '/' + config.mongodb.db);

    if (config.mongodb.username && config.mongodb.password) {
        dbName = config.mongodb.username + ":" + config.mongodb.password + "@" + dbName;
    }

    if (dbName.indexOf('mongodb://') !== 0) {
        dbName = 'mongodb://' + dbName;
    }
    return "mongodb+srv://shriom:admin123@cluster0.r6u33.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
}
let _db;

const mongoConnect = callback => {
    
var dbName = this.dbNameUrl()
// console.log("mongo connect ",dbName,dbOptions);
    MongoClient.connect(
        dbName, dbOptions
    )
        .then(client => {
            console.log('Connected!');
            _db = client.db();
            callback(_db);
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
};

const getDb = () => {
    if (_db) {

        return _db;
    }
    throw 'No database found!';
};

const closeDb = () => {
    _db.close();
    return;
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
exports.closeDb = closeDb;
