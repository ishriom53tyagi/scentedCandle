const fs = require('fs');

module.exports.get = async function (req, res) {
    fs.readFile(process.cwd() + "/" + "users.json", 'utf8', function (err, data) {
        //console.log( data );  
        res.status(200).send({
            success: 'true',
            data: data
        })
    });
}

module.exports.post = async function (req, res) {
    fs.readFile(process.cwd() + "/" + "users.json", 'utf8', function (err, data) {
        var obj = JSON.parse('[' + data + ']');
        obj.push(req.body);

        if (bodyData && bodyData !== "null" && bodyData !== "undefined") {
            res.status(200).send({
                success: 'true',
                data: obj
            })
        } else {
            res.status(500).send({
                success: 'false',
            })
        }

    })
}


module.exports.delete = async function (req, res) {

    if (!(req.query.id)) {
        res.status(500).send({
            success: 'false',
        })
    }
    fs.readFile(process.cwd() + "/" + "users.json", 'utf8', function (err, data) {
        data = JSON.parse(data);
        delete data["user" + req.query.id];

        res.status(200).send({
            success: 'true',
            data: JSON.stringify(data)
        })
    });
}

module.exports.queryParams = async function (req, res) {
    if (!req.query) {
        res.status(309).send({
            success: 'No User found',
        })
    }
    fs.readFile(process.cwd() + "/" + "users.json", 'utf8', function (err, data) {
        data = JSON.parse(data);
        var size = 0;
        var params = req.query;
        var paramsKey, paramsvalue;
        for (key in params) {
            if (params.hasOwnProperty(key)) {
                size++;
                paramsKey = key;
                paramsvalue = params[key];
            }
        }
        // console.log(paramsKey,paramsvalue,size)
        if (paramsKey == "name" && paramsvalue == "mahesh" && size == 1) {
            res.status(200).send({
                success: 'true',
                data: (data.user1)
            })
        } else {
            res.status(309).send({
                success: 'No User found',
            })
        }
    })
}

module.exports.statusCode201 = async function (req, res) {

    res.status(201).send({
        success: 'No User found',
    })
}


module.exports.internalServerError = async function (req, res) {

    res.status(500).send({
        success: 'No User found',
    })
}
