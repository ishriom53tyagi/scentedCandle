const { responseData } = require('../utils/responseHandler');
const roleJSON = require('../utils/role.json')

// no longer used from 2.6.0 + version
// const getDb = require('../utils/database').getDb;
// const ObjectId = require('mongodb').ObjectId;


// module.exports.getUserRoles = async function (req, res) {
//     try {
//         let roleId = req.query.id ? req.query.id : ''
//         // console.log("role id - > ",roleId);
//         const db = getDb();
//         if (roleId) {
//             db.collection('roles')
//                 .find({_id:ObjectId(roleId)})
//                 .toArray()
//                 .then(role => {
//                     // console.log("role : ", role);
//                     if (role) {
//                         console.log(true)
//                         return responseData(res, true, 200, "success", role);
//                     }
//                     else {
//                         console.log(false)
//                         return responseData(res, false, 204, "failure");
//                     }
//                 })
//         }
//         else {
//             db.collection('roles')
//                 .find()
//                 .toArray()
//                 .then(role => {
//                     // console.log("role : ", role);
//                     if (role) {
//                         console.log(true)
//                         return responseData(res, true, 200, "success", role);
//                     }
//                     else {
//                         console.log(false)
//                         return responseData(res, false, 204, "failure");
//                     }
//                 })
//         }

//     }
//     catch (error) {
//         console.log("error : ", error);
//         return responseData(res, false, 500);
//     }
// }

// module.exports.getSelectedRoles = async (req, res) => {
//     try {
//         let searchArray = []
//         let { body } = req
//         // console.log("body - >",body);
//         if (body.rolesArr == []) {
//             return responseData(res, true, 200, "success", []);
//         }
//         else {
//             body.rolesArr.forEach(element => searchArray.push(ObjectId(element)));
//             const db = getDb();
//             db.collection('roles')
//                 .aggregate([
//                     {
//                         $match: {
//                             '_id': {
//                                 $in: searchArray
//                             }
//                         }
//                     },
//                     {
//                         $project: {
//                             role_code: 1,
//                             role_desc: 1,
//                             role_access: 1,
//                             role_child: 1
//                         }
//                     }
//                 ])
//                 .toArray()
//                 .then(async (roles) => {
//                     // console.log("roles : ", roles)
//                     return responseData(res, true, 200, "success", roles);
//                 })
//         }
//     }
//     catch (error) {
//         console.log("error : ", error);
//         return responseData(res, false, 500);
//     }
// }

// module.exports.checkRole = async function (req, res) {

//     try {
//         const db = getDb();
//         // console.log("req.body.email==>","/"+req.body.roleCode+"/i");
//         const result = await db.collection("roles")
//             .find({ "role_code": new RegExp('^'+ req.body.roleCode.trim() + '$', "i") },{$exist:true})
//             .toArray();
//         // console.log("reslt email ->",result);

//         return responseData(res, true, 200, "role Access update", result);
//     } catch (error) {
//         console.log("Error : ", error);
//         return responseData(res, false, 500);
//     }
// }

// module.exports.checkRoleDesc = async function (req, res) {

//     try {
//         const db = getDb();
//         console.log("req.body.desc==>","/"+req.body.roleDesc+"/i");
//         const result = await db.collection("roles")
//             .find({ "role_desc": new RegExp('^'+ req.body.roleDesc.trim() + '$', "i") },{$exist:true})
//             .toArray();
//         // console.log("reslt email ->",result);

//         return responseData(res, true, 200, "role Access update", result);
//     } catch (error) {
//         console.log("Error : ", error);
//         return responseData(res, false, 500);
//     }
// }


module.exports.getUserRoles = async function (req, res) {
    try {
        console.log("-------------->getUserRoles>>>>>>>>>>>>>>>", req.body);
        // var roleCode = req.body.roleCode;
        var roleCode = req.user.role_code;
        // var usrRoleList = [];

        // if (req.body.isa == 1 || roleCode.toLowerCase() == 'superadmin') {
        //     for (const property in roleJSON) {
        //         usrRoleList.push({ 'key': property, 'value': roleJSON[property].role_code })
        //     }
        //     return responseData(res, true, 200, "getRole", usrRoleList);
        // } else
        if (roleCode != undefined && roleCode != '' && roleCode != null) {

            var userRoles = roleJSON[roleCode]

            console.log("usrrrrrrrrrrrRoleList before---", userRoles)

            userRoles = !userRoles || !userRoles.role_child ? [] : userRoles.role_child;

            console.log("usrrrrrrrrrrrRoleList---", userRoles)

            if (userRoles) {
                let resp = []
                userRoles.forEach(element => {
                    resp.push({ 'key': element, 'value': roleJSON[element].role_code })
                });

                return responseData(res, true, 200, "getRole", resp);
            }

        } else {
            return responseData(res, true, 204, "roles failure");
        }

    } catch (err) {
        console.log("Error ", err);
        return responseData(res, false, 500);
    }
}

module.exports.getParticularRole = async function (req, res) {
    try {
        var roleCode = req.query.code;

        var roleParticular = roleJSON[roleCode].role_code

        return responseData(res, true, 200, "getRoleAccess", roleParticular);

    } catch (error) {
        console.log("error", error)
        return responseData(res, false, 500);

    }
}

module.exports.viewUserRoles = async function (req, res) {
    try {
        var roleCode = req.body.code;

        var roleParticular = roleJSON[roleCode]
        console.log("view datata", roleParticular)
        return responseData(res, true, 200, "getRoleAccess", roleParticular);

    } catch (error) {
        console.log("error", error)
        return responseData(res, false, 500);

    }
}

module.exports.roleChild = async function (req, res) {
    try {
        var roleCodes = req.body;

        var roleParticular = []
        roleCodes.forEach(elem => {
            roleParticular.push(roleJSON[elem].role_code)
        })
        console.log("view datata", roleParticular)
        return responseData(res, true, 200, "getRoleAccess", roleParticular);

    } catch (error) {
        console.log("error", error)
        return responseData(res, false, 500);

    }
}

