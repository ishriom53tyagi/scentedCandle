const express = require('express')
const router = express.Router()

// const roleCode = require('../middleware/roleCode');

const signUpService = require('../services/signup')
const products = require('../services/products')
const cart = require('../services/cart')
const search = require('../services/search')

const user = require('../services/user')

// const csrfProtection = csrf({ cookie: true });

// //for flush cache data
// router.get('/flushData', (req, res) => {
//     cache.flush();
//     res.status(200);
//     res.end();
// });

// router.use(csrfProtection);

router.post('/saveAnonymousUserSession', user.saveAnonymousUserSession)

router.post('/signUp', signUpService.singupUsers)
router.get('/getAllProducts', products.getAllProducts)

router.post('/cart', cart.getcart)
router.post('/deleteCart', cart.deleteCart)
router.post('/cartDetails', cart.getcartDetails)
router.get('/checkout', cart.checkout)

router.post('/customer/addaddress', user.addAddress)

router.post('/customer/getAddress', user.getAddress)

router.post('/catalog/products', search.getSearchDetails)

router.post('/cart/update', cart.updateCart)
// router.get('/roles', rolesService.getUserRoles);
// router.post('/selected-roles', rolesService.getSelectedRoles);
// router.post('/check-role', rolesService.checkRole);
// router.post('/check-desc', rolesService.checkRoleDesc);

// user routes

module.exports = router
