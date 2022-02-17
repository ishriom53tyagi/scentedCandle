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
            createdAt: '2022-02-14T16:05:07+00:00',
            currency: { code: 'USD' },
            taxesIncluded: 'false',
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
            lineItemsSubtotalPrice: 100,
            subtotalPrice: 100,
            totalPrice: 100,
          }
        //   return obj;
        return responseData(res, true, 200,"Data finished", obj);

    }catch(err)
    {
        console.log("error ==>>>",err);
        return responseData(res, false, 500, "Internal Server Error");
    }
    
}

module.exports.checkout = async  function (req ,res)  {
  try{
      const db = getDb();

      console.log("Every time it hit the data ");
      
      let data = {
        "id":"79dbef51-322d-4964-8fbe-a318041f19ba",
        "cart":{
           "id":"79dbef51-322d-4964-8fbe-a318041f19ba",
           "customerId":0,
           "email":"",
           "currency":{
              "name":"US Dollars",
              "code":"USD",
              "symbol":"$",
              "decimalPlaces":2
           },
           "isTaxIncluded":false,
           "baseAmount":499.98,
           "discountAmount":0,
           "cartAmount":499.98,
           "coupons":[
              
           ],
           "discounts":[
              {
                 "id":"c7a796fa-a2a9-4b8d-b53a-be253115b19f",
                 "discountedAmount":0
              }
           ],
           "lineItems":{
              "physicalItems":[
                 {
                    "id":"c7a796fa-a2a9-4b8d-b53a-be253115b19f",
                    "parentId":null,
                    "variantId":395,
                    "productId":116,
                    "sku":"5F6D80A544056_9908-BL-SM",
                    "name":"Lightweight Jacket",
                    "url":"https:\/\/acmedemo.mybigcommerce.com\/lightweight-jacket",
                    "quantity":2,
                    "brand":"ACME",
                    "isTaxable":true,
                    "imageUrl":"https:\/\/cdn11.bigcommerce.com\/s-qfzerv205w\/products\/116\/images\/512\/Men-Jacket-Front-Black__15466.1603283963.220.290.png?c=1",
                    "discounts":[
                       
                    ],
                    "discountAmount":0,
                    "couponAmount":0,
                    "listPrice":249.99,
                    "salePrice":249.99,
                    "extendedListPrice":499.98,
                    "extendedSalePrice":499.98,
                    "comparisonPrice":249.99,
                    "extendedComparisonPrice":499.98,
                    "isShippingRequired":true,
                    "giftWrapping":null,
                    "addedByPromotion":false,
                    "isMutable":true,
                    "options":[
                       {
                          "name":"Color",
                          "nameId":150,
                          "value":"Black",
                          "valueId":270
                       },
                       {
                          "name":"Size",
                          "nameId":151,
                          "value":"S",
                          "valueId":272
                       }
                    ],
                    "categoryNames":[
                       "Shop All",
                       "Apparel"
                    ]
                 }
              ],
              "digitalItems":[
                 
              ],
              "giftCertificates":[
                 
              ],
              "customItems":[
                 
              ]
           },
           "createdTime":"2022-02-14T16:05:07+00:00",
           "updatedTime":"2022-02-14T17:42:15+00:00",
           "locale":"en"
        },
        "billingAddress":{
           
        },
        "consignments":[
           
        ],
        "orderId":null,
        "shippingCostTotal":0,
        "shippingCostBeforeDiscount":0,
        "handlingCostTotal":0,
        "taxTotal":0,
        "giftWrappingCostTotal":0,
        "coupons":[
           
        ],
        "taxes":[
           {
              "name":"Tax",
              "amount":0
           }
        ],
        "subtotal":499.98,
        "grandTotal":499.98,
        "outstandingBalance":499.98,
        "isStoreCreditApplied":true,
        "shouldExecuteSpamCheck":false,
        "giftCertificates":[
           
        ],
        "createdTime":"2022-02-14T16:05:07+00:00",
        "updatedTime":"2022-02-14T17:42:15+00:00",
        "customerMessage":"",
        "customer":{
           "id":0,
           "isGuest":true,
           "email":"",
           "firstName":"",
           "lastName":"",
           "fullName":"",
           "addresses":[
              
           ],
           "storeCredit":0,
           "shouldEncourageSignIn":false
        },
        "promotions":[
           
        ],
        "payments":[
           {
              
           }
        ]
     }
      return responseData(res, true, 200,"get cart details we are in",data);

  }catch(err)
  {
      console.log("error ==>>>",err);
      return responseData(res, false, 500, "Internal Server Error");
  }
  
}
