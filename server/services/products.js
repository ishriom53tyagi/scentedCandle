const { responseData } = require('../utils/responseHandler');
const config = require('../config');
const getDb = require('../utils/database').getDb;
const ObjectId = require('mongodb').ObjectId;
const ipAddress = require('../utils/common');
const bcrypt = require('bcryptjs');

module.exports.getAllProducts = async  function (req ,res)  {
    try 
    {
        const db = getDb();

        let products = await db.collection("products").find().toArray();
        console.log("Products ========>>",products[0]);

        if(!(products.length))
        {
            return responseData(res, false, 200, "Sorry No Products Found");

        }
        return responseData(res, true, 200,"products found", products[0]);
        // {
        //     id: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzU0NDczMjUwMjQ0MjA=',
        //     name: 'New Short Sleeve T-Shirt',
        //     vendor: 'Next.js',
        //     path: '/new-short-sleeve-t-shirt',
        //     slug: 'new-short-sleeve-t-shirt',
        //     price: { value: 25, currencyCode: 'USD' },
        //     descriptionHtml: '<p><span>Show off your love for Next.js and Vercel with this unique,&nbsp;</span><strong>limited edition</strong><span>&nbsp;t-shirt. This design is part of a limited run, numbered drop at the June 2021 Next.js Conf. It features a unique, handcrafted triangle design. Get it while supplies last – only 200 of these shirts will be made!&nbsp;</span><strong>All proceeds will be donated to charity.</strong></p>',
        //     images: [ [Object], [Object], [Object] ],
        //     variants: [ [Object] ],
        //     options: [ [Object], [Object] ]
        //   },


        // if(products){
        //     return responseData(res, false, 200, "A customer already exist with that email");
        // }
        // if(!(req.body.email || req.body.password))
        // {
        //     return responseData(res, false, 200, "Bad Request");
        // }

    }
    catch(err)
    {
        console.log("error ==>>>",err);
        return responseData(res, false, 500, "Internal Server Error");
    }
    
}