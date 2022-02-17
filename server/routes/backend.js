<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const csrf = require('csurf');

const tokenVerifyMiddleware = require('../middleware/tokenverify');
// const roleCode = require('../middleware/roleCode');

const loginService = require('../services/login')
const signUpService = require('../services/signup');
const products = require('../services/products');
const cart = require('../services/cart');
const search = require('../services/search');
=======
const express = require('express')
const router = express.Router()
const csrf = require('csurf')

const securityMiddleware = require('../middleware/security')
const sessionMiddleware = require('../middleware/session')
const configMiddleware = require('../middleware/configtime')
const tenantMiddleware = require('../middleware/tenant')
const tokenVerifyMiddleware = require('../middleware/tokenverify')
// const roleCode = require('../middleware/roleCode');

const loginService = require('../services/login')
const signUpService = require('../services/signup')
const products = require('../services/products')
const cart = require('../services/cart')
>>>>>>> 9d017497dfcab229995b0fe06d69ca0e93746b5e

// const csrfProtection = csrf({ cookie: true });

// //for flush cache data
// router.get('/flushData', (req, res) => {
//     cache.flush();
//     res.status(200);
//     res.end();
// });

// router.use(csrfProtection);
router.post('/signUp', signUpService.singupUsers)
router.get('/getAllProducts', products.getAllProducts)

router.post('/cart', cart.getcart)
router.post('/deleteCart', cart.deleteCart)
router.get('/cartDetails', cart.getcartDetails)
router.get('/checkout', cart.checkout)


router.get('/catalog/products',search.getSearchDetails);
// router.get('/roles', rolesService.getUserRoles);
// router.post('/selected-roles', rolesService.getSelectedRoles);
// router.post('/check-role', rolesService.checkRole);
// router.post('/check-desc', rolesService.checkRoleDesc);

// user routes

module.exports = router
