const crypto = require('crypto');
const config = require('../config.json');

module.exports.validateAuth = function (req, res, next) {
    try {

        if (!req.headers['s-auth'])
            return res.status(403).send();

        var auth = req.headers['s-auth'].split(';');
        var apiKey = auth[0] ? auth[0].split('=') : null;
        var signature = auth[1] ? auth[1].split('=') : null;
        var timestamp = auth[2] ? auth[2].split('=') : null;
        var envi = auth[3] ? auth[3].split('=') : null;
        var currentTimestamp = Math.round((new Date().getTime() / 1000));
        var flag = false;
        if (apiKey[0] && apiKey[1] && apiKey[0] == 'SIM apikey' && apiKey[1] == config.auth.key && envi && envi[0] && envi[1] == config.organization_name)
            if (signature[0] && signature[0] == 'signature' && signature[1]) {
                if (timestamp && timestamp[0] == 'timestamp' && timestamp[1]) {
                    var sign = crypto.createHash('sha512').update(apiKey[1] + config.auth.secret + timestamp[1], 'utf-8').digest('hex')
                    var futureTimestamp = parseInt(timestamp[1]) + 300;
                    if (futureTimestamp > currentTimestamp && sign == signature[1])
                        flag = true
                }
            }

        if (!flag)
            return res.status(403).send();

        return next();

    } catch (err) {
        console.log("---err---", err);
        res.status(403).send();
    }
}
