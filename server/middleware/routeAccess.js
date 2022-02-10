const roleJSON = require('../utils/role.json')

module.exports = async function (req, res, next) {
    var arr = req.url.split("/")
    var route = arr[1] ? arr[1] : '';
    let role = roleJSON[req.user.role_code]
    let roleMenuAccess = role.role_access.filter(i => i.rac_code === route)
    console.log('role DATA : ', roleMenuAccess);
    if (roleMenuAccess.length > 0) {
        if (roleMenuAccess[0].rac_add == 1) {
            return next();
        }
        else {
            if (roleMenuAccess[0].rac_view == 1) {
                return next();
            }
            else {
                return res.status(403).send({ status: "403", message: "Access Denied" });
            }
        }
    }
    else {
        return next();
    }

}
