const { responseData } = require('../utils/responseHandler');
const config = require('../config')
const getDb = require('../utils/database').getDb;
const ObjectId = require('mongodb').ObjectId;
const ipAddress = require('../utils/common');
const bcrypt = require('bcryptjs');


module.exports.getcart = async  function (req ,res)  {
    try{
        const db = getDb();
        return responseData(res, true, 200,"get cart details we are in");

    }catch(err)
    {
        console.log("error ==>>>",err);
        return responseData(res, false, 500, "Internal Server Error");
    }
    
}


module.exports.getcartDetails = async  function (req ,res)  {
    try{
        const db = getDb();
        let obj =  {
            id: 'Z2lkOi8vc2hvcGlmeS9Qcm9ksdWN0LzU0NDczMjUwMjQ0MjA=',
            createdAt: '',
            currency: { code: '' },
            taxesIncluded: '',
            lineItems: [
              {
                 countItems:1,
                 discounts:[],
                 id:'Z2lkOi8vc2hvcGlmeS9Qcm9ksdWN0LzU0NDczMjUwMjQ0MjA=',
                 name:'jacket',
                 path:'lightweight-jacket',
                 productId:'Z2lkOi8vc2hvcGlmeS9Qcm9ksdWN0LzU0NDczMjUwMjQ0MjA=',
                 quantity:1,
                 variant:[
                   {
                    id:381,
                    image:[
                      {
                        url:"https://cdn11.bigcommerce.com/s-qfzerv205w/products/117/images/534/Men-TShirt-Black-Front__70046.1603748348.220.290.png?c=1"
                      },
                   
                    ],
                    listPrice:160.12,
                    name:'jacket',
                    price:160,
                    requiresShipping:true,
                    sku:"5F6D80F2EB67C_11047-BL-XS",
      
                   }
                 ],
                 variantId:381
              }
            ], 
            lineItemsSubtotalPrice: '',
            subtotalPrice: 0,
            totalPrice: 0,
          }
        //   return obj;
        return responseData(res, true, 200,"Data finished", obj);

    }catch(err)
    {
        console.log("error ==>>>",err);
        return responseData(res, false, 500, "Internal Server Error");
    }
    
}