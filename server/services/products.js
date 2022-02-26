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

        if(!(products.length))
        {
            return responseData(res, false, 200, "Sorry No Products Found");

        }
        return responseData(res, true, 200,"products found",{products:products , cartId: randomNumber});
    }
    catch(err)
    {
        console.log("error ==>>>",err);
        return responseData(res, false, 500, "Internal Server Error");
    }
    
}