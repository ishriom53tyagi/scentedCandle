const { responseData } = require('../utils/responseHandler');
const config = require('../config')
const getDb = require('../utils/database').getDb;
const ObjectId = require('mongodb').ObjectId;
const ipAddress = require('../utils/common');
const bcrypt = require('bcryptjs');

module.exports.singupUsers = async  function (req ,res)  {
    try{
        const db = getDb();
        var customer = await db.collection("customers").findOne({email: req.body.email});
        if(customer){
            return responseData(res, false, 200, "A customer already exist with that email");
        }
        if(!(req.body.email || req.body.password))
        {
            return responseData(res, false, 200, "Bad Request");
        }
        let customerObj = {
            email: req.body.email,
            username: req.body.name,
            password: bcrypt.hashSync(req.body.password, 10),
            created: new Date()
        };

        let insertedCustomer = await db.collection("customers").insertOne(customerObj);
        console.log("Inserted Customer ==>>",insertedCustomer);
        if(insertedCustomer)
        {
            return responseData(res, true, 200, "Successfully Inserted");
        }

    }catch(err)
    {
        console.log("error ==>>>",err);
        return responseData(res, false, 500, "Internal Server Error");
    }
    
}