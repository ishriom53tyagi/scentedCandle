const configService = require('../services/configuration');

module.exports = async function (req, res, next) {
    var configData = await configService.getConfigurations(req);
    req.configurations = configData;
    req.configurations.frontend.timezone = req.configurations.frontend.timezone || 'Asia/Calcutta'
    return next();
}