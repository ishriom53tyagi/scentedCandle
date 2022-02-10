const request = require('request')

exports.get = async function (path, headers) {
    try {
        var data;
        var options = {
            'method': 'GET',
            'url': path,
            'timeout': 45000,
            'headers': headers
        };
        console.log("options", options);
        return new Promise((resolve, reject) => {

            request(options, async function (error, response, body) {
                if (error) {
                    console.log(error);
                    resolve(error);
                } else {
                    data = JSON.parse(body);
                    resolve(data);

                }

            });
        })
    } catch (error) {
        console.log("error while requesting", error);
    }
}