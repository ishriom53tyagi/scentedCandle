const { responseData } = require('../utils/responseHandler');
const menuJSON = require('../utils/menu.json').menu
const roleJSON = require('../utils/role.json')
const cache = require('../utils/nodeCache');
const config = require('../config.json')

module.exports.getMenus = async function (req, res) {
    try {

        var role_code = req.user.role_code;
        // console.log("newMenus ::::::: ", role_code);
        // var isa = req.query.isa;
        var newMenus = [];
        newMenus = await setMenus(role_code);
        // console.log("newMenus ::::::: ", newMenus);
        if (newMenus.length == 0) {
            return responseData(res, true, 204, "menu failure");
        }
        return responseData(res, true, 200, "success", newMenus);
    } catch (err) {
        console.log("Error ", err);
        return responseData(res, false, 500);
    }
}

async function setMenus(role_code) {
    var newMenus = [];
    var menus = [];
    if (role_code != 'undefined' && role_code != '' && role_code != null) {

        let cachedMenus = cache.get("menus_" + role_code);
        // console.log("cachedMenus :: ", cachedMenus);
        if (cachedMenus) {
            return cachedMenus
        }
        else {

            let roleAccess = roleJSON[role_code].role_access

            roleAccess.forEach(el => {

                let data = {}
                data.rac_view = el.rac_view
                data.rac_add = el.rac_add
                data.rac_status = el.rac_status
                data.rac_reset = el.rac_reset
                menuJSON.forEach(e => {

                    if (el.rac_fun_id === e.fun_id) {
                        data.fun_id = e.fun_id,
                            data.fun_name = e.fun_name,
                            data.fun_router_name = e.fun_router_name,
                            data.fun_icon = e.fun_icon,
                            data.fun_parent = e.fun_parent,
                            data.fun_order = e.fun_order,
                            data.fun_status = e.fun_status
                        data.rac_type = e.rac_type
                        data.rac_other = e.rac_other
                    }

                })

                if (config.tenant == 'multi' && data.rac_type.includes('multi')) {
                    menus.push(data);
                }
                if (config.tenant == 'single' && data.rac_type.includes('single')) {
                    menus.push(data);
                }

            })

            newMenus = await arrangeMenu(menus)

            await cache.set("menus_" + role_code, newMenus)

        }

    }
    // else if (isa == 1) {

    //     // console.log("super ifffff")
    //     let cachedMenus = cache.get("menus_all");
    //     if (cachedMenus) {

    //         // console.log("cacheee  if")
    //         return cachedMenus
    //     }
    //     else {
    //         // console.log("cacheee else")
    //         menus = menuJSON
    //         newMenus = arrangeMenu(menus)
    //         await cache.set("menus_all", newMenus)
    //     }
    // }

    return newMenus;
}

async function arrangeMenu(menus) {
    var newMenus = [];
    // console.log("menus ---> ", menus);
    menus.forEach(element => {
        let children = []
        if (element.fun_name == undefined) {
            delete element;
        } else if (element.fun_parent == null || element.fun_parent == 0) {
            menus.forEach(element1 => {
                if (element.fun_id == element1.fun_parent) {
                    children.push(element1)
                }
            })
            element.childrens = children;
            newMenus.push(element)
        }

    });
    // console.log("newww > ",JSON.stringify(newMenus,null,4));
    return newMenus;
}