const { responseData } = require('../utils/responseHandler');
const config = require('../config')
const getDb = require('../utils/database').getDb;
const ObjectId = require('mongodb').ObjectId;
const jwt = require('jsonwebtoken');
const multer = require('multer');
const systemLog = require('../services/systemLog');
const ipAddress = require('../utils/common');
const userDetails = require('../services/user');
const cache = require('../utils/nodeCache');
const common = require('../utils/common');

const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, config.imagePath)
    },
    filename: async (req, file, callBack) => {
        file = await fileNameHandler(file)
        callBack(null, file.newImageName)
    }
})

const storageJson = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, config.jsonPath)
    },
    filename: async (req, file, cb) => {
        file = await fileNameHandler(file)
        cb(null, file.newImageName)
    }
});

const uploadJson = multer({
    storage: storageJson,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "application/json") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Error Allowed only .json file'));
        }
    }
}).single('file');

const upload = multer({
    storage: storage,
    limits: { fileSize: 102400 },
    fileFilter: (req, file, callback) => {
        var contentType = req.headers['content-type'];
        // console.log("contentType >>>>>>>>>> ",contentType,req.headers);
        if (!file.mimetype.match(/^[-\w.+/]+(jpg|jpeg|png)$/) && contentType.indexOf('multipart/form-data') >= 0) {
            // !contentType || contentType.indexOf('application/json') !== 0
            return callback(new Error('Only Images are allowed !'), false)
        } else {


            // console.log("trueeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
            callback(null, true);
        }
    },
}).single('file')

function fileNameHandler(file) {
    return new Promise((resolve, reject) => {
        file.formatedName = file.originalname.replace(/\s/g, '_')
        let separation = file.formatedName.split('.')
        let extension = separation.pop()
        file.newImageName = `${separation.join('.')}-${Date.now()}.${extension}`
        // console.log(file);
        resolve(file)
    })
}

module.exports.uploadImage = async function (req, res) {
    try {
        upload(req, res, function (err) {
            // console.log("files: ", req.file);
            if (err) {
                console.log("Error while file uploading : ", err.message);
                if (err.message.includes('File too large')) {
                    return responseData(res, false, 200, "File size must be less than 100kb and file type must be .png or .jpg")
                } else {
                    return responseData(res, false, 200, err.message, '', 'bg-red')
                }
            } else {
                console.log("Image Uploaded Successfully", `${config.backend_url}/${config.imagePathUrl}/${req.file.newImageName}`);
                return responseData(res, true, 200, "success", { 'newImage': `${config.backend_url}/${config.imagePathUrl}/${req.file.newImageName}` }, 'bg-green')
            }
        })
    } catch (error) {
        console.log("error : ", error);
        return responseData(res, false, 500, '', 'bg-red');
    }
}

module.exports.uploadJsonFile = async function (req, res) {
    try {
        uploadJson(req, res, function (err) {
            // console.log("files: ", req.file);
            if (err) {
                console.log("Error while file uploading : ", err.message);
                return responseData(res, false, 200, err.message, '', 'bg-red')
            } else {
                console.log("File Uploaded Successfully");
                return responseData(res, true, 200, "success", { 'newImage': `${req.file.newImageName}` }, 'bg-green')
            }
        })
    } catch (error) {
        console.log("error : ", error);
        return responseData(res, false, 500, '', '', 'bg-red');
    }
}

module.exports.checkAppCodeExists = async function (req, res) {
    try {
        var codeMatch = req.body.code.toLowerCase();

        const db = getDb()
        let collecName = common.collectionNameGenerator(req.headers, 'applications')

        ///^req.body.code$/i
        var codeExists = await db.collection(collecName).aggregate(
            [{
                $project: {
                    _id: 0,
                    code: { $toLower: "$code" },
                }
            },
            {
                $match: {
                    code: codeMatch
                }
            }
            ]
        ).toArray();

        if (codeExists.length > 0) {
            return responseData(res, true, 200, "Application Code Already Exists", codeExists, 'bg-red');
        } else {
            return responseData(res, false, 200, "", codeExists);
        }
    } catch (err) {
        return responseData(res, false, 500);
    }
}

module.exports.checkAppNameExists = async function (req, res) {
    try {
        var appMatch = req.body.name.toLowerCase();
        const db = getDb()
        let collecName = common.collectionNameGenerator(req.headers, 'applications')

        var nameExists = await db.collection(collecName).aggregate(
            [{
                $project: {
                    _id: 0,
                    name: { $toLower: "$name" },
                }
            },
            {
                $match: {
                    name: appMatch
                }
            }
            ]
        ).toArray();

        if (nameExists.length > 0) {
            return responseData(res, true, 200, "Application Name Already Exists", nameExists, 'bg-red');
        } else {
            return responseData(res, false, 200, "", nameExists);
        }
    } catch (err) {
        return responseData(res, false, 500);
    }
}

module.exports.getAllapplications = async function (req, res) {
    try {
        const db = getDb();
        // var cacheApplications;
        // if (!cache.has("applications")) {
        let collecName = common.collectionNameGenerator(req.headers, 'applications')

        var allApplications = await db.collection(collecName)
            .find()
            .project({
                _id: 1,
                code: 1,
                name: 1,
                status: 1,
                modified_time: 1,
                created_time: 1

            })
            .sort({ modified_time: -1 })
            .toArray()
        //     if (allApplications.length) {
        //         cacheApplications = allApplications
        //         await cache.set("applications", cacheApplications)
        //     }
        // } else {
        //     cacheApplications = cache.get('applications');
        // }
        // console.log("cacheApplications : ", cacheApplications);

        if (allApplications && allApplications.length > 0) {
            allApplications.forEach(element => {
                var last_update = element.modified_time;
                // console.log(element.modified_time, element.created_time, element.name, "application value has been added");
                if (element.modified_time == element.created_time) {
                    element.last_update = "NA";
                } else {
                    element.last_update = common.momentTimeZone(req, last_update);
                }

            });
            return responseData(res, true, 200, "success", allApplications);
        } else {
            return responseData(res, false, 204, "failure");
        }
    } catch (error) {
        console.log("error : ", error);
        return responseData(res, false, 500);
    }

}
module.exports.getSortedApplications = async function (req, res) {
    // console.log("app list => ",req.Additionalinfo);
    try {
        let searchArray = []
        console.log("req.body -> ", req.body);
        if (req.body) {
            req.body.forEach(element => searchArray.push(ObjectId(element)));
            const db = getDb();
            let collecName = common.collectionNameGenerator(req.headers, 'applications')
            // console.log("ect name  ::: ",collectName);
            db.collection(collecName)
                .aggregate([{
                    $match: {
                        '_id': {
                            $in: searchArray
                        }
                    }
                },
                {
                    $sort: {
                        name: 1
                    }
                }
                ])
                .sort({ modified_time: -1 })
                .project({ _id: 1, code: 1, name: 1 })
                .toArray()
                .then(applications => {
                    if (applications.length > 0) {
                        console.log(true)
                        return responseData(res, true, 200, "success", applications);
                    } else {
                        console.log(false)
                        return responseData(res, false, 204, "failure");
                    }
                })
        } else {
            return responseData(res, true, 200, "no data");
        }
    } catch (error) {
        console.log("error : ", error);
        return responseData(res, false, 500);
    }
}


module.exports.getApplicationData = async function (req, res) {
    try {
        const db = getDb();
        let collecName = common.collectionNameGenerator(req.headers, 'applications')

        db.collection(collecName)
            .findOne(ObjectId(req.body.id))
            .then(applications => {
                if (applications) {
                    var addSectionParamcheck = applications.hasOwnProperty('add_section_params');

                    if (applications.app_logo && applications.app_logo != null && applications.app_logo != "") {
                        applications.app_logo = applications.app_logo.includes("https") ? applications.app_logo : `${config.backend_url}/${config.imagePathUrl}/${applications.app_logo}`
                    } else {
                        applications.app_logo = ""
                    }

                    if (addSectionParamcheck && applications.add_section_params) {
                        applications.add_section_params.forEach(element => {
                            if (element.type == 'i') {
                                // console.log(true, element);
                                element.value = `${config.backend_url}/${config.imagePathUrl}/${element.value}`
                                // console.log(element.value);
                            }
                        })
                    }
                    let body = applications
                    if (body.dev_base_path && body.dev_base_path != 'NA') {
                        let dev = body.dev_base_path.charAt(body.dev_base_path.length - 1)
                        body.dev_base_path = (dev == '/') ? body.dev_base_path : body.dev_base_path + "/"
                    }
                    console.log("applications get ===>>> ", applications);
                    return res.status(200).send({ status: 'success', data: applications });
                } else {
                    return responseData(res, false, 200);
                }
            })
    } catch (err) {
        console.log("error ", err);
        return responseData(res, false, 500);
    }
}

module.exports.insertApplication = async function (req, res) {
    try {
        let { body } = req;
        let created_by = req.user._id;
        if (body.headers) {
            body.headers.forEach(element => {
                if (element.name == '' || element.name == null) {
                    console.log(element.name == '');
                    delete element.name;
                    delete element.value;
                }
            })
            body.headers = body.headers.filter(value => Object.keys(value).length !== 0);
        }
        if (body.dev_base_path != 'NA') {
            let dev = body.dev_base_path.charAt(body.dev_base_path.length - 1)
            body.dev_base_path = (dev == '/') ? body.dev_base_path : body.dev_base_path + "/"
        }
        if (body.is_email_alert == "true") {
            body.is_email_alert = true
        } else {
            body.is_email_alert = false
        }

        const db = getDb();
        let collecName = common.collectionNameGenerator(req.headers, 'applications')

        db.collection(collecName)
            .find({ "code": body.code }, { $exists: true })
            .toArray(function (err, result) {
                if (result && result.length) {
                    return responseData(res, false, 200, "Code Already Exists");
                } else {
                    db.collection(collecName)
                        .insertOne({
                            code: body.code,
                            name: body.name,
                            description: body.description,
                            dev_base_path: body.dev_base_path,
                            notification_to: body.notification_to,
                            app_logo: body.app_logo,
                            postman_collection: body.postman_collection,
                            status: null ? 0 : 1,
                            // other_params: body.other_params,
                            // add_section_params: body.params,
                            additional_headers: body.headers,
                            created_by: created_by,
                            created_time: Math.floor(((new Date()).getTime()) / 1000),
                            modified_time: Math.floor(((new Date()).getTime()) / 1000),
                            application_timeout: body.timeout,
                            // access_controls: body.access_controls,
                            is_email_alert: body.is_email_alert
                        })
                        .then(result1 => {
                            let dataObj = systemLog.auditLogFieldsObject(result1.ops[0])
                            // console.log("dataObj data = > ", dataObj);
                            let obj1 = {
                                action: "product_created",
                                data: dataObj,
                                user_id: req.session.user_id,
                                ip_address: ipAddress.ipAddress(req)
                            }
                            systemLog.logData(obj1)
                            // console.log("app insert --> ", result1);
                            return responseData(res, true, 200, "success", result1, 'bg-green');
                        })
                }
            })
    } catch (err) {
        console.log("error ", err);
        return responseData(res, false, 500);
    }
}

module.exports.updateApplication = async function (req, res) {
    try {
        let { body } = req;

        if (body.data.headers) {
            body.data.headers.forEach(element => {
                if (element.name == '' || element.name == null) {
                    console.log(element.name == '');
                    delete element.name;
                    delete element.value;
                }
            })
            body.data.headers = body.data.headers.filter(value => Object.keys(value).length !== 0);
        }

        if (body.data.app_logo && body.data.app_logo != null && body.data.app_logo != '') {

            body.data.app_logo = body.data.app_logo

        } else {
            body.data.app_logo = ""
        }

        if (body.data.dev_base_path != 'NA') {
            let dev = body.data.dev_base_path.charAt(body.data.dev_base_path.length - 1)
            body.data.dev_base_path = (dev == '/') ? body.data.dev_base_path : body.data.dev_base_path + "/"
        }
        console.log(body.is_email_alert, "email alert value is here");
        if (body.data.is_email_alert == "true") {
            body.data.is_email_alert = true
        } else {
            body.data.is_email_alert = false
        }

        let newValues = {
            "code": body.data.code,
            "name": body.data.name,
            "description": body.data.description,
            "dev_base_path": body.data.dev_base_path,
            "notification_to": body.data.notification_to,
            "app_logo": body.data.app_logo,
            "postman_collection": body.data.postman_collection,
            // "access_controls": body.data.access_controls,
            // "other_params": body.data.other_params,
            // "add_section_params": body.data.add_section_params,
            "additional_headers": body.data.headers,
            "modified_by": req.user._id,
            "application_timeout": body.data.timeout,
            "modified_time": Math.floor(((new Date()).getTime()) / 1000),
            "is_email_alert": body.data.is_email_alert
        }

        // console.log("other params ,  add section ", other_paramsCheck, addSectionParamcheck);
        // if (other_paramsCheck) {
        //     newValues.other_params = body.data.other_params
        // }
        // if (addSectionParamcheck) {
        //     newValues.add_section_params = body.data.add_section_params
        // }
        console.log('update-->', newValues);
        const db = getDb();
        let collecName = common.collectionNameGenerator(req.headers, 'applications')

        var olddata = await db.collection(collecName)
            .find({ _id: ObjectId(body.id) })
            .toArray()
        olddata = olddata[0]

        db.collection(collecName).updateOne({ '_id': ObjectId(body.id) }, { $set: newValues }, function (err, obj) {
            if (obj) {
                let dataObj = { before: olddata, after: newValues }
                dataObj = systemLog.auditLogFieldsObject(dataObj)
                let obj1 = {
                    action: "product_updated",
                    data: dataObj,
                    user_id: req.session.user_id,
                    ip_address: ipAddress.ipAddress(req)
                }
                console.log("==========obj1 in System Log Data===========", obj1);
                systemLog.logData(obj1)
                // console.log(obj);
                return responseData(res, true, 200, "success", obj, 'bg-green');
            } else {
                return responseData(res, false, 404, "Error");
            }
        });

    } catch (err) {
        console.log("error ", err);
        return responseData(res, false, 500);
    }
}


module.exports.deleteApplication = async function (req, res) {
    try {
        let dataToDelete = { _id: ObjectId(req.body.id) }
        const db = getDb();
        let collecName = common.collectionNameGenerator(req.headers, 'applications')

        var appdata = await db.collection(collecName)
            .find({ _id: ObjectId(req.body.id) })
            .toArray()
        console.log("appdata", req.body.id);


        let appToDelete = appdata[0]
        let created_by = req.user._id;
        let created_on = Math.floor(((new Date()).getTime()) / 1000);
        let collecName1 = common.collectionNameGenerator(req.headers, 'raw_appdata')
        let collecName2 = common.collectionNameGenerator(req.headers, 'api_managements')

        db.collection(collecName1)
            .insertOne({
                type: "application",
                app_data: JSON.stringify(appdata[0]),
                created_by: created_by,
                created_on: created_on,
                name: appdata[0].name,
                code: appdata[0].code
            })
            .then(result => {
                // console.log('result =>', result);
                if (result) {
                    let dataObj = systemLog.auditLogFieldsObject(appToDelete)
                    // console.log("dataObj deleted data = > ", appToDelete);
                    let obj1 = {
                        action: "product_deleted",
                        data: dataObj,
                        user_id: req.session.user_id,
                        ip_address: ipAddress.ipAddress(req)
                    }
                    systemLog.logData(obj1)
                    db.collection(collecName2).deleteMany({ app_id: ObjectId(req.body.id) }, function (err, obj) {
                        if (obj.deletedCount > 0) {
                            console.log("deleted Api count", obj.deletedCount);
                        }
                    });

                    db.collection(collecName).deleteOne(dataToDelete, function (err, obj) {
                        if (obj.deletedCount > 0) {
                            return responseData(res, true, 200, "success", { obj }, 'bg-green');
                        } else {
                            var err1 = [err];
                            return responseData(res, false, 404, "Error", { err1 }, 'bg-red');
                        }
                    });
                } else {
                    return responseData(res, false, 404, "Error");
                }
            })
    } catch (err) {
        console.log("error ", err);
        return responseData(res, false, 500);
    }
}


module.exports.updateApplicationStatus = async function (req, res) {
    try {
        let { headers, body } = req
        let app = jwt.decode(headers.authorization.split(" ")[1])
        let modified_by = app._id
        const db = getDb();
        let collecName = common.collectionNameGenerator(req.headers, 'applications')

        var olddata = await db.collection(collecName)
            .find({ _id: ObjectId(body.id) })
            .project({ name: 1, status: 1 })
            .toArray()
        olddata = olddata[0]
        olddata.status = olddata.status == 1 ? true : false
        var newdata = {
            name: olddata.name,
            status: body.status == 1 ? true : false
        }
        db.collection(collecName)
            .updateOne({
                _id: ObjectId(body.id)
            }, {
                $set: {
                    status: body.status ? 1 : 0,
                    modified_by: modified_by,
                    modified_time: Math.floor(((new Date()).getTime()) / 1000),
                }
            })
            .then(result => {
                if (result) {
                    // console.log(true, result)
                    let dataObj = { before: olddata, after: newdata }
                    dataObj = systemLog.auditLogFieldsObjectStatus(dataObj)
                    let obj1 = {
                        action: "product_status_updated",
                        data: dataObj,
                        user_id: req.session.user_id,
                        ip_address: ipAddress.ipAddress(req)
                    }
                    console.log("==========obj1 in System Log Data===========", obj1);
                    systemLog.logData(obj1)
                    return responseData(res, true, 200, "success", result, 'bg-green');
                } else {
                    console.log(false)
                    return responseData(res, false, 204, "failure", 'bg-red');
                }
            })
    } catch (error) {
        console.log("error : ", error);
        return responseData(res, false, 500);
    }
}

module.exports.createDefaultParameters = async function (req, res) {

    try {
        const db = getDb();
        const collections = await db.listCollections().toArray()
        //   console.log(collections);

        if (!collections.map(c => c.name).includes('default_parameters')) {
            await db.collection('default_parameters')
                .insertMany(
                    [{
                        name: "Customer_Id",
                        value: "A customer ID is usually a unique serial number used internally or external to identify a customer profile and his/her transactions.Based on various programs it can be numeric or alphanumeric.Example IM number. 00124291090",
                        checked: true
                    },
                    {
                        name: "Session_Id",
                        value: "A session ID piece of data that is used to identify a session, a series of related action done by the user within a time period or an event",
                        checked: true
                    },
                    {
                        name: "OS",
                        value: "The Operating System of the device that is visiting a website or login into an account. Example, Mac,Windows and Linux",
                        checked: true
                    },
                    {
                        name: "Browser",
                        value: "The browser of the request is passed in this section.Example, Chrome and Safari.",
                        checked: true
                    },
                    {
                        name: "IP",
                        value: "The IP through which the Customer is connecting to our website. This would help us to demographically locate the customer.",
                        checked: true
                    }
                    ]
                )
                .then(result => {
                    return responseData(res, true, 200, "success", result, 'bg-green');
                })
        } else {
            return responseData(res, true, 200, "success", "collection already exists", 'bg-red');
        }

    } catch (error) {
        console.log("Error ", error);
        return responseData(res, false, 500);
    }
}

module.exports.getDefaultParameters = async function (req, res) {

    try {
        const db = getDb();
        db.collection('default_parameters')
            .find()
            .project({ name: 1, value: 1, checked: 1 })
            .toArray()
            .then(result => {
                // console.log(result)
                return responseData(res, true, 200, "success", result);
            })

    } catch (error) {
        console.log("Error ", error);
        return responseData(res, false, 500);
    }
}

module.exports.getbulkUploadData = async function (req, res) {
    try {
        var apiData = [];
        var temp_api = req.body;
        var created_By;
        var applicationName;
        var time;
        const db = getDb();
        let collecName = common.collectionNameGenerator(req.headers, 'applications')

        for (var i = 0; i < temp_api.length; i++) {

            let application = await db.collection(collecName).find(ObjectId(temp_api[i].app_id)).toArray()
            console.log(application);
            if (application && application.length > 0) {
                console.log("temp API created By:-->>>", temp_api[i].created_by)
                if (temp_api[i].created_by != undefined) {
                    let userDetails1 = await db.collection('users').find(ObjectId(temp_api[i].created_by)).project({ first_name: 1 }).toArray();
                    if (userDetails1 && userDetails1.length > 0) {
                        created_By = userDetails1[0].first_name
                    } else {
                        created_By = 'NaN'
                    }
                } else {
                    created_By = temp_api[i].uploaded_by;
                }
                if (temp_api[i].app_id) {
                    applicationName = application[0].name;
                } else {
                    applicationName = temp_api[i].application_name;
                }
                if (typeof (temp_api[i].uploaded_time)) {
                    time = new Date(new Date(new Date(temp_api[i].uploaded_time)).toUTCString()).toLocaleString(undefined, { timeZone: 'Asia/Kolkata' })
                } else {
                    time = new Date(new Date(new Date(temp_api[i] * 1000)).toUTCString()).toLocaleString(undefined, { timeZone: 'Asia/Kolkata' })
                }
                apiData.push({
                    "fileName": temp_api[i].collection_name,
                    "applicationName": applicationName,
                    "status": temp_api[i].status,
                    "createdTime": time,
                    "id": temp_api[i]._id,
                    "userName": created_By
                })
            }
        }

        if (apiData.push.length > 0) {
            return res.status(200).send({ status: 'success', data: apiData });
        } else {
            return responseData(res, false, 200);
        }
    } catch (err) {
        console.log("error ", err);
        return responseData(res, false, 500);
    }
}