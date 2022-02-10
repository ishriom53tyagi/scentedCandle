const getDb = require('../utils/database').getDb;
const ObjectId = require('mongodb').ObjectId;

module.exports.collections = async (req, res) => {
    try {
        const db = getDb();

        var result = await db.listCollections().toArray();

        res.send(result);
    } catch (err) {
        console.log("----collections-err--->", err);
        res.status(500).send();
    }
}

module.exports.select = async (req, res) => {

    try {
        var collection = req.body.collection;
        var query = req.body.query || {};
        var project = req.body.project || {};

        const db = getDb();

        for (const key in query) {
            if (query[key]["object_id"]) {
                query[key] = ObjectId(query[key]["object_id"]);
            }
        }

        var result = await db.collection(collection).find(query).project(project).toArray();

        res.send(result);

    } catch (err) {
        console.log("----select-err--->", err);
        res.status(500).send();
    }
}

module.exports.insert = async (req, res) => {
    try {
        var collection = req.body.collection;
        var data = req.body.insert;

        const db = getDb();

        for (const key in data) {
            if (data[key] && data[key]["object_id"]) {
                data[key] = ObjectId(data[key]["object_id"]);
            }
        }

        var result = await db.collection(collection).insertOne(data);

        res.send(result);
    } catch (err) {
        console.log("----insert-err--->", err);
        res.status(500).send();
    }

}

module.exports.insertMany = async (req, res) => {

    try {
        var collection = req.body.collection;
        var insert = req.body.insert;
        var arr = [];
        for (const data of insert) {
            for (const key in data) {
                if (data[key] && data[key]["object_id"]) {
                    data[key] = ObjectId(data[key]["object_id"]);
                }
            }
            arr.push(data);
        }

        const db = getDb();

        var result = await db.collection(collection).insertMany(arr);

        res.send(result);
    } catch (err) {
        console.log("----insertmany-err--->", err);
        res.status(500).send();
    }

}

module.exports.update = async (req, res) => {

    try {
        var collection = req.body.collection;
        var condition = req.body.condition;
        var update = req.body.update;
        var options = req.body.options || {};

        const db = getDb();

        for (const key in condition) {
            if (condition[key] && condition[key]["object_id"]) {
                condition[key] = ObjectId(condition[key]["object_id"]);
            }
        }

        for (const key in update) {
            if (update[key] && update[key]["object_id"]) {
                update[key] = ObjectId(update[key]["object_id"]);
            }
        }

        var result = await db.collection(collection).update(condition, { $set: update }, options);

        res.send(result);
    } catch (err) {
        console.log("----update-err--->", err);
        res.status(500).send();
    }

}


module.exports.delete = async (req, res) => {

    try {
        var collection = req.body.collection;
        var del = req.body.delete;
        var options = req.body.options || {};

        const db = getDb();

        for (const key in del) {
            if (del[key] && del[key]["object_id"]) {
                del[key] = ObjectId(del[key]["object_id"]);
            }
        }

        var result = await db.collection(collection).remove(del, options);

        res.send(result);

    } catch (err) {
        console.log("----delete-err--->", err);
        res.status(500).send();
    }

}