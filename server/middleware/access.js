const userService = require('../services/user');
const clientService = require('../services/merchants');

module.exports = async function (req, res, next) {
    let userData = await userService.getcurrentUserDetails({ id: req.session.user_id })
    if (userData[0].is_super_admin == 1 || !userData[0].client_access) {
        req.Additionalinfo = { applications: [] }
    }
    else if (userData[0].client_access && userData[0].client_access == "null" && userData[0].application_access) {
        req.Additionalinfo = { applications: userData[0].application_access }
    }
    else {
        let clientData = await clientService.getMerchantByIdForAccess({ id: userData[0].client_access })
        req.Additionalinfo = { applications: clientData[0]["application_code"], client_access: userData[0].client_access }
    }
    console.log( " req URL : ",req);
    return next();
}