const getDb = require('../utils/database').getDb
const { ObjectId } = require('mongodb');
const { responseData } = require('../utils/responseHandler')


module.exports.updateDb  = async function (req , res){

    const db = getDb();

    console.log("Before initiate ");

    let obj = {
        url:"https://res.cloudinary.com/plan4upainting/image/upload/v1647784467/findmygift/solarluna/SUM_3472_eelo3a.jpg",
        altext:"",
        width:{
            numberLong:1000
        },
        height:{
            numberLong:1000
        },
        
    }

   let result = await db.collection("products").updateMany( { },
        {
            $push : {
                    "images": obj
                } 
        },
    )

    console.log("after initiate ", result);

    return responseData(
        res,
        true,
        200,
        'update db successfully'
      )
}


module.exports.updateDbProducts = async function (req , res){

    const db = getDb();

    let obj  = {
          "name": "Lightweight Jacket value",
          "vendor": "Next.js",
          "path": "/lightweight-jacket",
          "slug": "lightweight-jacket",
          "price": {
            "value": 349.99,
            "currencyCode": "INR"
          },
          "descriptionHtml": "Infused with premium fragrances they will last for more than 1.5 hours and keep you happy.We know you'll be visiting again!",
          "images": [
            {
              "url": "https://res.cloudinary.com/plan4upainting/image/upload/v1647784467/findmygift/solarluna/SUM_3472_eelo3a.jpg",
              "altext": "Shirt",
              "width": 1000,
              "height": 1000
            }
          ],
          "variants": [
            {
              "id": "6207550298044893ecb5ffb4",
              "image": {
                "url": "https://images.pexels.com/photos/674010/pexels-photo-674010.jpeg"
              },
              "options": [
                {
                  "__typename": " 'MultipleChoiceOption'",
                  "id": "asd",
                  "displayName": "Size",
                  "values": [
                    {
                      "label": "XL"
                    }
                  ]
                }
              ]
            }
          ],
          "options": [
            {
              "id": "option-color",
              "displayName": "'Color'",
              "values": [
                {
                  "label": "color",
                  "hexColors": [
                    "#222"
                  ]
                }
              ]
            }
          ],
          "id": "6207550298044893ecb5ffb4",
          "trending": true,
          "image": "https://images.pexels.com/photos/674010/pexels-photo-674010.jpeg"
    
          }

        let result = await db.collection("products").insertMany([obj, obj , obj]);
        return responseData(
            res,
            true,
            200,
            'update db successfully'
          )

    }


