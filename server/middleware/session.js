const userService = require('../services/user');
// const systemService = require('../services/app-services/systemLog');
const config = require('../config.json');
module.exports = async function (req, res, next) {
    // console.log('------------Session Maintain-------------------------------', req.session.user_id ? 'true' : 'false');
    if (!req.session.user_id) {

        return res.status(403).send({ status: "403", message: "Access Denied" });
    }
    else {
        var user = await userService.getUserId(req)
        if (user == undefined)
            return res.status(403).send({ status: "403", message: "Access Denied" });
        req.user = user
        var prev = req.session.cookie.maxAge
        req.session.cookie.maxAge = parseInt(config.encryption.session.maxage)//session timeout after 30 mins
        req.session.updateDiff = req.session.cookie.maxAge - prev
        //console.log("middleware", req.session.cookie.expires, req.session.cookie.maxAge, config.encryption.session.maxage)
    }
    return next();
}
