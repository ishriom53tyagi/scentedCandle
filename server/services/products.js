const { responseData } = require('../utils/responseHandler');
const getDb = require('../utils/database').getDb;
const ObjectId = require('mongodb').ObjectId;
const getRandomString = require('../utils/common');

module.exports.getAllProducts = async  function (req ,res)  {
    try 
    {
        const db = getDb();
        
        let products = await db.collection("products").find().toArray();
        let userCookie = getRandomString.uuidv4();
        // console.log("userCookie value" , userCookie);
        // res.set()
        if(!(products.length))
        {
            return responseData(res, false, 200, "Sorry No Products Found");

        }
        return responseData(res, true, 200,"products found",{products:products , cartId: userCookie});
    }
    catch(err)
    {
        console.log("error ==>>>",err);
        return responseData(res, false, 500, "Internal Server Error");
    }
    
}