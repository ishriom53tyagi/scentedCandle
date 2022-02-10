var crypto = require('crypto');
const config = require('../config.json');

module.exports.authToken = async function (req, res) {
    try {

        if (!req.headers['s-env'] || req.headers['s-env'] !== config.organization_name)
            return res.status(403).send();

        var apiKey = config.auth.key;
        var secret = config.auth.secret;
        var timestamp = Math.round((new Date().getTime() / 1000));
        var concatString = apiKey + secret + timestamp;
        var hash = crypto.createHash('sha512').update(concatString, 'utf-8').digest('hex');
        var authHeaderValue = 'SIM apikey=' + apiKey + ';signature=' + hash + ';timestamp=' + timestamp;

        res.send(authHeaderValue);
    } catch (err) {
        console.log("---auth-token-err---", err);
        res.status(404).send();
    }

}
