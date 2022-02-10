const config = require('../config.json')
var path = require('path');
const request = require('request');

module.exports.reportDownload = async function (req, res) {
    try {
        if (req.params && req.params.name) {

            let file = req.params.name

            if (config.server == "standalone") {
                let path_to_report = path.join(__dirname, config.csv_file_path, file)
                res.download(path_to_report, file, (err) => {
                    if (err) {
                        console.log('Here is Error ' + err);
                        return res.status(403).send("File Not found");
                    } else {
                        console.log('success');
                    }
                })
            }
            else {
                await request(config.s3_bucket.url + config.s3_bucket.report_path + file, async function (error, response, body) {
                    res.writeHead(response.statusCode, response.headers);
                    res.end(body)

                })
            }
        }
        else {
            return res.status(403).send("File Not found");
        }

    } catch (err) {
        console.log("Error value", err);
        return err;
    }
}

module.exports.applicationImage = async function (req, res) {
    try {

        let file = req.params.name
        request(config.s3_bucket.url + config.s3_bucket.image_path + file).pipe(res)



    } catch (err) {
        console.log("Error value", err);
        return err;
    }
}

module.exports.ducumentation = async function (req, res) {
    try {
        let file = req.params.name
        request(config.s3_bucket.url + config.s3_bucket.document_path + file).pipe(res)

    } catch (err) {
        console.log("Error value", err);
        return err;
    }
}





