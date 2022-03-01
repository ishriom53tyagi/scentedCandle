const { responseData } = require('../utils/responseHandler');
const getDb = require('../utils/database').getDb;

module.exports.getSearchDetails = async  function (req ,res)  {
    try{
         const db = getDb();
         let data ;

        if(req.body.data.search.length > 0) {
            data = await getSearchProducts(req.body.data.search);
            return responseData(res, true, 200,"we are in search Example right now",data);
        }

        if(req.body.data.sort.length > 0) {
             if ( req.body.data.categoryId && req.body.data.categoryId.length > 0 ) 
             {
                data = await getNestedFilteredProducts(req.body.data.sort , req.body.data.categoryId);
                return responseData(res, true, 200,"we are in search Example right now",data);
             }
            data = await getfilterProducts(req.body.data.sort);
            return responseData(res, true, 200,"we are in search Example right now",data);
        }
        if(req.body.data?.categoryId?.length > 0) {

            if ( req.body.data.sort && req.body.data.sort.length > 0 ) 
            {
               data = await getNestedFilteredProducts(req.body.data.sort , req.body.data.categoryId);
               return responseData(res, true, 200,"we are in search Example right now",data);
            }
            data = await getFeaturedProducts(req.body.data.categoryId);
            return responseData(res, true, 200,"we are in search Example right now",data);
        }
       

        data =  await getAllProducts();
        return responseData(res, true, 200,"we are in search Example right now",data);

    }catch(err)
    {
        console.log("error ==>>>",err);
        return responseData(res, false, 500, "Internal Server Error");
    }
    
}



async function getAllProducts() {
   const db = getDb();
   let finalData = {};
   finalData.products = [];

   let data = await db.collection("products").find({}).toArray();
              data.forEach(element => {
                     let temp = {};
                     let img = {};
                     temp.id = element.id;
                     temp.name = element.name;
                     temp.path = element.path;
                     temp.description = element.description;
                     temp.prices = {};
                     temp.prices.price = element.price;
                     temp.prices.salePrice = null;
                     temp.prices.retailPrice = null;
                     temp.price = element.price;
                     temp.slug = element.slug;
                     img.url = "/abcd.png";
                     img.alt = "";
                     img.isDefault = true;
                     temp.images = []
                     temp.images.push(img);
                     temp.variants = [];
                     temp.productOptions = {"edges":[] }
                     temp.options = []

                     finalData.products.push(temp);
               });
               finalData.found = true;
               return finalData;
}

async function getSearchProducts(search) {
   const db = getDb();
   let finalData = {};
   finalData.products = [];

   let data = await db.collection("products").find({$text:{$search: search }}).toArray();
              data.forEach(element => {
                     let temp = {};
                     let img = {};
                     temp.id = element.id;
                     temp.name = element.name;
                     temp.path = element.path;
                     temp.description = element.description;
                     temp.prices = {};
                     temp.prices.price = element.price;
                     temp.prices.salePrice = null;
                     temp.prices.retailPrice = null;
                     temp.price = element.price;
                     temp.slug = element.slug;
                     img.url = "/abcd.png";
                     img.alt = "";
                     img.isDefault = true;
                     temp.images = []
                     temp.images.push(img);
                     temp.variants = [];
                     temp.productOptions = {"edges":[] }
                     temp.options = []

                     finalData.products.push(temp);
               });
               finalData.found = true;
               return finalData;
}

async function getNestedFilteredProducts(query1 , query2) {
            const db = getDb();
            let finalData = {};
            finalData.products = [];
            let data ;
           if(query2 == 'featured') {
                 if( query1  !=  'trending-desc' ) {

                    if( query1 == 'latest-desc') { 

                        data =  await db.collection("products").find({ 'trending' : true}).sort({ _id: -1}).toArray();
                    }
                
                    if( query1 == 'price-asc') {
                
                        data =  await db.collection("products").find({ 'trending' : true}).sort({ 'price.value' : 1}).toArray();
                
                    }
                
                    if( query1 == 'price-desc') {
                
                        data =  await db.collection("products").find({ 'trending' : true}).sort({ 'price.value' : -1}).toArray();
                
                    }
                   
                 }
                 else{
                    data =  await db.collection("products").find({ 'trending' : true}).toArray();
                 }
                   
            }

            if( query2 == 'new-arrivals') { 

                if( query1  !=  'latest-desc' ) {

                    if( query1 == 'trending-desc') { 

                        data =  await db.collection("products").find({ 'trending' : true}).sort({ _id: -1}).toArray();
                    }
                
                    if( query1 == 'price-asc') {
                
                        data =  await db.collection("products").find({ }).sort({ 'price.value' : 1 , _id: -1 }).toArray();
                
                    }
                
                    if( query1 == 'price-desc') {
                
                        data =  await db.collection("products").find({ }).sort({ 'price.value' : -1 , _id: -1}).toArray();
                
                    }
                   
                 }
                 else
                 {
                    data =  await db.collection("products").find({ }).sort({ _id: -1}).toArray();
                 }
            }

               data.forEach(element => {
                      let temp = {};
                      let img = {};
                      temp.id = element.id;
                      temp.name = element.name;
                      temp.path = element.path;
                      temp.description = element.description;
                      temp.prices = {};
                      temp.prices.price = element.price;
                      temp.prices.salePrice = null;
                      temp.prices.retailPrice = null;
                      temp.price = element.price;
                      temp.slug = element.slug;
                      img.url = "/abcd.png";
                      img.alt = "";
                      img.isDefault = true;
                      temp.images = []
                      temp.images.push(img);
                      temp.variants = [];
                      temp.productOptions = {"edges":[] }
                      temp.options = []
 
                      finalData.products.push(temp);
                });
                finalData.found = true;
                return finalData;
 }
 

async function getFeaturedProducts (query) {
    const db = getDb();
    let finalData = {};
    finalData.products = [];
    let data

    if(query == 'featured') {

         data =  await db.collection("products").find({ 'trending' : true}).toArray();
    }

    if( query == 'new-arrivals') { 

        data =  await db.collection("products").find({ }).sort({ _id: -1}).toArray();
    }

    // await db.collection("products").find({$text:{$search: search }}).toArray();
               data.forEach(element => {
                      let temp = {};
                      let img = {};
                      temp.id = element.id;
                      temp.name = element.name;
                      temp.path = element.path;
                      temp.description = element.description;
                      temp.prices = {};
                      temp.prices.price = element.price;
                      temp.prices.salePrice = null;
                      temp.prices.retailPrice = null;
                      temp.price = element.price;
                      temp.slug = element.slug;
                      img.url = "/abcd.png";
                      img.alt = "";
                      img.isDefault = true;
                      temp.images = []
                      temp.images.push(img);
                      temp.variants = [];
                      temp.productOptions = {"edges":[] }
                      temp.options = []
 
                      finalData.products.push(temp);
                });
                finalData.found = true;
             
                return finalData;
 }

async function getfilterProducts(query) {
    const db = getDb();
    let finalData = {};
    finalData.products = [];
    let data

    

    if(query == 'trending-desc') {

         data =  await db.collection("products").find({ 'trending' : true}).toArray();
    }

    if( query == 'latest-desc') { 

        data =  await db.collection("products").find({ }).sort({ _id: -1}).toArray();
    }

    if( query == 'price-asc') {

        data =  await db.collection("products").find({ }).sort({ 'price.value' : 1}).toArray();

    }

    if( query == 'price-desc') {

        data =  await db.collection("products").find({ }).sort({ 'price.value' : -1}).toArray();

    }
    // await db.collection("products").find({$text:{$search: search }}).toArray();
               data.forEach(element => {
                      let temp = {};
                      let img = {};
                      temp.id = element.id;
                      temp.name = element.name;
                      temp.path = element.path;
                      temp.description = element.description;
                      temp.prices = {};
                      temp.prices.price = element.price;
                      temp.prices.salePrice = null;
                      temp.prices.retailPrice = null;
                      temp.price = element.price;
                      temp.slug = element.slug;
                      img.url = "/abcd.png";
                      img.alt = "";
                      img.isDefault = true;
                      temp.images = []
                      temp.images.push(img);
                      temp.variants = [];
                      temp.productOptions = {"edges":[] }
                      temp.options = []
 
                      finalData.products.push(temp);
                });
                finalData.found = true;
             
                return finalData;
 }
 


// {
//    "name":"T-Shirt",
//    "path":"/jacket/",
//    "brand":37,
//    "description":"<p>This t-shirt is a must-have in your wardrobe, combining the timeless fit of a classic tee with an intricate embroidered detail that brings the shirt to a whole new level. It's soft and durable, so be prepared to have a new favorite t-shirt!<br /><br /></p>",
//    "prices":{
//       "price":{
//          "value":160.12,
//          "currencyCode":"USD"
//       },
//       "salePrice":null,
//       "retailPrice":null
//    },
//    "images":[
//       {
//       //    "url":"https://cdn11.bigcommerce.com/s-qfzerv205w/images/stencil/original/products/117/534/Men-TShirt-Black-Front__70046.1603748348.png",
//          "url":"/abcd.png",
//          "alt":"",
//          "isDefault":true
//       },
//       {
//       //    "url":"https://cdn11.bigcommerce.com/s-qfzerv205w/images/stencil/original/products/117/531/Men-TShirt-Black-Left-Side__72119.1603284781.png",
//          "url":"/abcd.png",
//          "alt":"",
//          "isDefault":false
//       },
//       {
//       //    "url":"https://cdn11.bigcommerce.com/s-qfzerv205w/images/stencil/original/products/117/535/Men-TShirt-Black-Back__57266.1603748348.png",
//          "url":"/abcd.png",
//          "alt":"",
//          "isDefault":false
//       },
//       {
//       //    "url":"https://cdn11.bigcommerce.com/s-qfzerv205w/images/stencil/original/products/117/532/Men-TShirt-White-Front__99616.1603284781.png",
//          "url":"/abcd.png",
//          "alt":"",
//          "isDefault":false
//       },
//       {
//       //    "url":"https://cdn11.bigcommerce.com/s-qfzerv205w/images/stencil/original/products/117/530/Men-TShirt-White-Left-Side__69000.1603284781.png",
//          "url":"/abcd.png",
//          "alt":"",
//          "isDefault":false
//       },
//       {
//       //    "url":"https://cdn11.bigcommerce.com/s-qfzerv205w/images/stencil/original/products/117/533/Men-TShirt-White-Back__33450.1603284781.png",
//          "url":"/abcd.png",
//          "alt":"",
//          "isDefault":false
//       }
//    ],
//    "variants":[
//       {
//          "id":381,
//          "options":[
            
//          ],
//          "defaultImage":null
//       },
//       {
//          "id":382,
//          "options":[
            
//          ],
//          "defaultImage":null
//       },
//       {
//          "id":383,
//          "options":[
            
//          ],
//          "defaultImage":null
//       },
//       {
//          "id":384,
//          "options":[
            
//          ],
//          "defaultImage":null
//       },
//       {
//          "id":385,
//          "options":[
            
//          ],
//          "defaultImage":null
//       },
//       {
//          "id":386,
//          "options":[
            
//          ],
//          "defaultImage":null
//       },
//       {
//          "id":387,
//          "options":[
            
//          ],
//          "defaultImage":null
//       },
//       {
//          "id":388,
//          "options":[
            
//          ],
//          "defaultImage":null
//       },
//       {
//          "id":389,
//          "options":[
            
//          ],
//          "defaultImage":null
//       },
//       {
//          "id":390,
//          "options":[
            
//          ],
//          "defaultImage":null
//       }
//    ],
//    "productOptions":{
//       "edges":[
//          {
//             "node":{
//                "__typename":"MultipleChoiceOption",
//                "entityId":148,
//                "displayName":"color",
//                "values":{
//                   "edges":[
//                      {
//                         "node":{
//                            "label":"Black",
//                            "isDefault":false,
//                            "hexColors":[
//                               "#FFFFFF"
//                            ]
//                         }
//                      },
//                      {
//                         "node":{
//                            "label":"White",
//                            "isDefault":false,
//                            "hexColors":[
//                               "#000000"
//                            ]
//                         }
//                      }
//                   ]
//                }
//             }
//          },
//          {
//             "node":{
//                "__typename":"MultipleChoiceOption",
//                "entityId":149,
//                "displayName":"size",
//                "values":{
//                   "edges":[
//                      {
//                         "node":{
//                            "label":"XS"
//                         }
//                      },
//                      {
//                         "node":{
//                            "label":"S"
//                         }
//                      },
//                      {
//                         "node":{
//                            "label":"M"
//                         }
//                      },
//                      {
//                         "node":{
//                            "label":"L"
//                         }
//                      },
//                      {
//                         "node":{
//                            "label":"XL"
//                         }
//                      },
//                      {
//                         "node":{
//                            "label":"XXL"
//                         }
//                      }
//                   ]
//                }
//             }
//          }
//       ]
//    },
//    "id":"117",
//    "options":[
//       {
//          "id":148,
//          "values":[
//             {
//                "label":"Black",
//                "isDefault":false,
//                "hexColors":[
//                   "#FFFFFF"
//                ]
//             },
//             {
//                "label":"White",
//                "isDefault":false,
//                "hexColors":[
//                   "#000000"
//                ]
//             }
//          ],
//          "__typename":"MultipleChoiceOption",
//          "displayName":"color"
//       },
//       {
//          "id":149,
//          "values":[
//             {
//                "label":"XS"
//             },
//             {
//                "label":"S"
//             },
//             {
//                "label":"M"
//             },
//             {
//                "label":"L"
//             },
//             {
//                "label":"XL"
//             },
//             {
//                "label":"XXL"
//             }
//          ],
//          "__typename":"MultipleChoiceOption",
//          "displayName":"size"
//       }
//    ],
//    "slug":"jacket",
//    "price":{
//       "value":160.12,
//       "currencyCode":"USD"
//    }
// }