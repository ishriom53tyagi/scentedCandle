const NodeCache = require("node-cache");
const dataCache = new NodeCache();

module.exports.set = function (key, value) {
    try {
        // dataCache.set(key, value, function (err, success) {
        //     console.log('success------->',success);
        //     if (!err && success) {
        //         return true;
        //     } else {
        //         return false;
        //     }
        // }); 
        let success = dataCache.set(key, value);
        return success;
    } catch (error) {
        console.log(error);
        return error;
    }

}
module.exports.get = function (key) {
    var cacheValue = dataCache.get(key);
    return cacheValue;
}
 
module.exports.has = function (key) {
    var result = dataCache.has(key);
    return result;
}
module.exports.delete = function (key) {
    var cacheValue;
    dataCache.del(key, function (err, value) {
        if (!err && value) {
            cacheValue = true;
        } else {
            cacheValue = false;
        }
    });
    return cacheValue;
}

module.exports.flush = function () {
    dataCache.flushAll();
}

module.exports.keys = function () {
    return dataCache.keys();
}

module.exports.tset = function (key, value, ttl) {

    dataCache.set(key, value, ttl, function (err, success) {
        if (!err && success) {
            return true;
        } else {
            return false;
        }
    });
}

module.exports.getTTL = function (key) {
    var cacheValue;
    dataCache.getTtl(key, function (err, value) {

        if (!err && value) {
            cacheValue = value;
        } else {
            cacheValue = false;
        }
    });
    return cacheValue;
}