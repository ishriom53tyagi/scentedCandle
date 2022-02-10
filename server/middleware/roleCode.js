const userService = require('../services/user');

module.exports = async function (req, res, next) {
    if (((req.path == '/tenanList' || req.path == '/menus' || req.path == '/users/role' || req.path == '/users/list') && req.method == 'GET') || (req.path == '/system-logs/list' && req.method == 'POST')) {
        if (req.user) {
            let userData = await userService.getcurrentUserDetails({ id: req.session.user_id })
            // console.log("useeeedataaaa", userData)
            if (userData[0] && userData[0].role_code) {
                req.user.role_code = userData[0].role_code
            }
            else {
                return res.status(403).send({ status: "403", message: "Access Denied" });
            }
        }
        else {
            return res.status(403).send({ status: "403", message: "Access Denied" });
        }
    }
    return next();
}