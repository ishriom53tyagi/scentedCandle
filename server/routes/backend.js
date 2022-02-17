const express = require('express');
const router = express.Router();
const csrf = require('csurf');

const securityMiddleware = require('../middleware/security');
const sessionMiddleware = require('../middleware/session');
const configMiddleware = require('../middleware/configtime');
const tenantMiddleware = require('../middleware/tenant');
const tokenVerifyMiddleware = require('../middleware/tokenverify');
// const roleCode = require('../middleware/roleCode');

const loginService = require('../services/login')
const signUpService = require('../services/signup');
const products = require('../services/products');
const cart = require('../services/cart');

// const csrfProtection = csrf({ cookie: true });

// //for flush cache data
// router.get('/flushData', (req, res) => {
//     cache.flush();
//     res.status(200);
//     res.end();
// });

// router.use(csrfProtection);
router.post('/signUp',signUpService.singupUsers);
router.get('/getAllProducts',products.getAllProducts);

router.post('/cart',cart.getcart);
router.get('/cartDetails',cart.getcartDetails);
router.get('/checkout',cart.checkout);

// router.get('/roles', rolesService.getUserRoles);
// router.post('/selected-roles', rolesService.getSelectedRoles);
// router.post('/check-role', rolesService.checkRole);
// router.post('/check-desc', rolesService.checkRoleDesc);


// user routes


module.exports = router;