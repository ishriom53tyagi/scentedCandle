
const ObjectId = require('mongodb').ObjectId;
var path = require('path');
var fs = require('fs');
const request = require('request');
var url = require('url')
const common = require('../utils/common');
var headers;

async function readFile(path1, val_id) {
    var id = val_id;

    const filePath = path.resolve(__dirname, `uploads/apis/${path1}`);
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', function (err, data) {
            if (err) {
                console.log("error reading file here")
                console.log(err);
                try {
                    let collecName = common.collectionNameGenerator(headers, 'api_bulk_uploads')
                    db.collection(collecName)
                        .updateOne(
                            {
                                _id: ObjectId(id)
                            },
                            {
                                $set: {
                                    status: "Failed",
                                    message: err,
                                    end_time: Math.floor(((new Date()).getTime()) / 1000)
                                }
                            })
                        .then(result => {
                            if (result) {
                                onExit();
                            }
                            else {
                                console.log(false);
                            }
                        })
                }
                catch (err) {
                    console.log("error" + err);
                }
            }
            resolve(data);
        });
    });
}

async function readURl(val) {

    var data;
    var options = {
        'method': 'GET',
        'url': val,
        'timeout': 45000
    };

    return new Promise((resolve, reject) => {

        request(options, function (error, response, body) {
            if (error) {
                console.log(error);
            } else {
                data = JSON.parse(body);
                resolve(data);

            }

        });
    })
}

function onExit() {
    try {
        console.log("exit now");
        process.kill(process.pid, 'SIGTERM')
    }
    catch (err) {
        console.log(err);
    }
}

function trimString(val) {
    var value;
    var n = val.indexOf('/');
    value = val.substring(n);

    return value;
}

const renameKey = (object, key, newKey) => {
    const targetKey = object[key];
    delete object[key];
    object[newKey] = targetKey;
    return object;
};

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

async function isApiCodeAlreadyExist(db, APIcode) {
    try {
        let collecName = common.collectionNameGenerator(headers, 'api_managements')

        return await db.collection(collecName).find({ code: APIcode }).toArray()
    }
    catch (error) {
        console.log("error : ", error);
    }
}

async function getRandomString(db) {
    return new Promise(async (resolve, reject) => {
        let isapicodeexists = true;
        let length = 6;
        let randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        while (isapicodeexists) {
            for (var i = 0; i < length; i++) {
                result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
            }
            let APIcode = {
                code: `AM-${result}`,
            }
            let response = await isApiCodeAlreadyExist(db, APIcode)

            if (response && response.length > 0) {
                isapicodeexists = true;
            }
            else {
                isapicodeexists = false;
            }
        }
        resolve(`AM-${result}`);
    })
}

function getFormatedJson(samplejson, type) {
    var finaljson = {};
    console.log("samplejson, type :::: -> ", samplejson, type);
    //console.log("keys", Object.keys(samplejson));
    if (type == "body") {
        Object.keys(samplejson).forEach(parentkey => {
            console.log(" samplejson parent key =>> ", samplejson[parentkey], parentkey);
            if (samplejson[parentkey] == null || samplejson[parentkey] == "") {
                finaljson[parentkey] = objectSettings(parentkey, samplejson[parentkey], type)
            } else if (samplejson[parentkey].length != undefined && (typeof samplejson[parentkey]) == "object") {
                if ((typeof samplejson[parentkey][0]) == "object") {
                    if (type == "body") {
                        finaljson[parentkey] = {
                            type: "array",
                            items: {
                                type: "object",
                                props: readChilds(samplejson[parentkey][0], type)
                            }
                        }
                    } else {
                        finaljson[parentkey] = { type: "array", desc: "", name: parentkey, children: readChilds(samplejson[parentkey][0], type) }
                    }
                } else {
                    if (type == "body") {
                        finaljson[parentkey] = {
                            type: "array",
                            items: objectSettings(parentkey, samplejson[parentkey][0], type)
                        }
                    } else {
                        finaljson[parentkey] = { type: "array", desc: "", name: parentkey }
                    }
                }
            } else {
                if ((typeof samplejson[parentkey]["type"]) == "object") {
                    var obj = readChilds(samplejson[parentkey], type);

                    // if(type!="body"){
                    //     obj["name"]=parentkey;
                    //     obj["desc"]=""
                    // }
                    finaljson[parentkey] = {}
                    finaljson[parentkey].type = "object";
                    finaljson[parentkey].props = obj;
                } else {
                    finaljson[parentkey] = objectSettings(parentkey, samplejson[parentkey], type)
                }
            }
        });
    } else if (type == "body-tree") {
        ////console.log("samplejson, type in body tree-> ", samplejson, type);
        Object.keys(samplejson).forEach(parentkey => {
            if (samplejson[parentkey] == null || samplejson[parentkey] == "") {
                finaljson[parentkey] = objectSettingsTreeHierarchy(parentkey, samplejson[parentkey], type)
            } else if (samplejson[parentkey].length != undefined && (typeof samplejson[parentkey]) == "object") {
                if ((typeof samplejson[parentkey][0]) == "object") {
                    ////console.log(" samplejson[parentkey][0] ", samplejson[parentkey], type);
                    if (type == "body-tree") {
                        ////console.log("it is array ", samplejson[parentkey].length);
                        // if()
                        finaljson[parentkey] = { type: "array", items: { type: "object", props: readChilds(samplejson[parentkey], type) } }
                    } else {
                        finaljson[parentkey] = { type: "array", details: "", name: parentkey, items: readChilds(samplejson[parentkey][0], type) }
                    }
                } else {
                    if (type == "body-tree") {
                        if (typeof samplejson[parentkey][0] != "object") {
                            finaljson[parentkey] = objectSettingsTreeHierarchy(parentkey, samplejson[parentkey], type)
                        } else {
                            finaljson[parentkey] = { type: "array", items: objectSettingsTreeHierarchy(parentkey, samplejson[parentkey][0], type) }
                        }
                    } else {
                        finaljson[parentkey] = { type: "array", details: "", name: parentkey }
                    }
                }
            } else {
                // ////////console.log("(typeof samplejson[parentkey][type]) ", (typeof samplejson[parentkey]["type"]));
                if ((typeof samplejson[parentkey]["type"]) == "object") {
                    var obj = readChilds(samplejson[parentkey], type);
                    ////console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>   ", obj);
                    // if(type!="body"){
                    //     obj["name"]=parentkey;
                    //     obj["details"]=""
                    // }
                    finaljson[parentkey] = {}
                    finaljson[parentkey].type = "object";
                    finaljson[parentkey].props = obj;
                } else {
                    finaljson[parentkey] = objectSettingsTreeHierarchy(parentkey, samplejson[parentkey], type)
                }
            }
        });
    } else {
        let json = {}
        samplejson.forEach(item => {
            json[item.name] = item
        })
        // ////////console.log("json will be ->   ", json);
        samplejson = json
        Object.keys(samplejson).forEach(parentkey => {
            if (samplejson[parentkey].length != undefined && (typeof samplejson[parentkey]) == "object") {
                // ////////console.log("............>>>", samplejson[parentkey].length, (typeof samplejson[parentkey]) == "object");
                if ((typeof samplejson[parentkey][0]) == "object") {
                    if (type == "body-tree-data") {
                        finaljson[parentkey] = { type: "array", items: { type: "object", children: readChilds(samplejson[parentkey][0], type) } }
                    } else {
                        finaljson[parentkey] = { type: "array", desc: "", name: parentkey, children: readChilds(samplejson[parentkey][0], type) }
                    }
                } else {
                    if (type == "body-tree-data") {
                        finaljson[parentkey] = { type: "array", items: objectSettingsTreeHierarchyAllProperties(parentkey, samplejson[parentkey][0], type) }
                    } else {
                        finaljson[parentkey] = { type: "array", desc: "", name: parentkey }
                    }
                }
            } else
                if ((typeof samplejson[parentkey].type) == "object") {
                    // ////////console.log("trueeeeeeeeeeeeeeeeeeeeeeeee");
                    var obj = readChilds(samplejson[parentkey], type);
                    // if(type!="body-tree"){
                    //     obj["name"]=parentkey;
                    //     obj["desc"]=""
                    // }
                    finaljson[parentkey] = {}
                    finaljson[parentkey].type = "object";
                    finaljson[parentkey].children = obj;
                } else {
                    finaljson[parentkey] = objectSettingsTreeHierarchyAllProperties(parentkey, samplejson[parentkey], type)
                }

        });

    }
    // //////console.log(" final json -> ", finaljson);
    // console.log(" final json -> ", JSON.stringify(finaljson, null, 4));
    return finaljson;
}


function objectSettings(name, obj, type) {
    // console.log("object Settings : ", name, obj, type)
    var checktype = (typeof obj);
    var returnobj = {};
    if (checktype == 'number') {
        Number.isInteger(obj) ? returnobj = { "type": 'number' } : returnobj = { "type": 'string' };
    } else {
        returnobj = { "type": (typeof obj) }
    }
    if (type == "body") {
        if ((typeof obj) == "string") {
            returnobj["optional"] = true;
            returnobj["desc"] = "";
            returnobj["value"] = obj;
            // returnobj["empty"] = true;
            // returnobj["min"] = 1;
            // returnobj["max"] = 10;
            // returnobj["details"] = obj
        } else if ((typeof obj) == "number") {
            returnobj["optional"] = true;
            returnobj["desc"] = "";
            returnobj["value"] = obj;
            // returnobj["min"] = 1;
            // returnobj["max"] = 10;
            // returnobj["details"] = parseInt(obj)
            // returnobj["positive"] = true;
        }
    } else {
        returnobj["name"] = name;
        returnobj["desc"] = "";
    }
    // //console.log("return object for type body ",returnobj);
    return returnobj;
}

function readChilds(obj, type) {
    var tmpjson = {}
    if (obj) {
        Object.keys(obj).forEach(childkey => {
            if (obj[childkey] == null) {
                obj[childkey] = "";
            }
            if (obj[childkey].length && (typeof obj[childkey]) == "object") {
                if ((typeof obj[childkey][0]) == "object") {
                    if (type == "body") {
                        tmpjson[childkey] = { type: "array", items: { type: "object", props: readChilds(obj[childkey][0], type) } }
                    } else {
                        tmpjson[childkey] = { type: "array", description: "", name: childkey, children: readChilds(obj[childkey][0], type) }
                    }
                } else {
                    if (type == "body") {
                        tmpjson[childkey] = { type: "array", items: objectSettings(childkey, obj[childkey][0], type) }
                    } else {
                        tmpjson[childkey] = { type: "array", description: "", name: childkey }
                    }
                }
            } else {
                if ((typeof obj[childkey]) == "object") {
                    var obj1 = readChilds(obj[childkey], type);
                    tmpjson[childkey] = {}
                    tmpjson[childkey].type = "object";
                    tmpjson[childkey].props = obj1;
                } else {
                    tmpjson[childkey] = objectSettings(childkey, obj[childkey], type)
                }
            }
        });
    }
    return tmpjson;
}


async function bodysubmit(value, type) {
    let isjasonvalid = await IsJsonString(value)
    if (isjasonvalid) {
        let samplejson = JSON.parse(value);
        let formatedjsonbody = await getFormatedJson(samplejson, type)
        return JSON.stringify(formatedjsonbody);

    } else {
        console.log("error is happend here");
    }

}

async function Insertion(db, element, message, length, i) {

    var value;
    var api_request_sample

    var api_code = await getRandomString(db);

    if (typeof (element.request.url) == 'object') {
        value = element.request.url.raw + '';
    }
    else {
        value = element.request.url + '';
    }
    var a = value.split("://");
    var data = [];
    var element_header = [];
    var api_request;

    if (a.length > 1) {
        value = trimString(a[1]);
    }
    else {
        value = trimString(a[0]);
    }
    if (value.indexOf('?') > -1) {
        value = value.substr(0, value.indexOf('?'));
    }

    element.request.header.forEach((obj) => {
        let tempobj = {
            'name': obj["key"],
            'value': obj["value"],
            'required': false
        };
        element_header.push(tempobj);
    });



    if (typeof (element.request.url) == 'object') {

        if (element.request.url.query) {
            element.request.url.query.forEach((obj) => {
                let tempobj = {
                    'name': obj["key"],
                    'description': obj["description"],
                    'required': false
                };
                data.push(tempobj);
            });

        }
    }


    if (typeof (element.request.body) == 'object') {
        if (element.request.body.mode === 'raw') {
            api_request_sample = element.request.body.raw ? element.request.body.raw : element.request.body.urlencoded;
            let type = 'body';

            let res = await bodysubmit(element.request.body.raw, type);
            if (res) {
                api_request = res;
            }
            else {
                api_request = "";
            }
            // else {
            //     api_request = element.request.body.urlencoded;
            //     api_request = JSON.stringify(api_request);

            //     let res = await bodysubmit(api_request, type);
            //     {
            //         if (res) {
            //             api_request = res;
            //         }
            //         else {
            //             api_request = "Not Working Right Now";
            //         }
            //     }
            // }
        }
    }

    let collecName1 = common.collectionNameGenerator(headers, 'api_managements')
    let collecName2 = common.collectionNameGenerator(headers, 'api_bulk_uploads')
    var result = await db.collection(collecName1).find({ $and: [{ app_id: ObjectId(message.app_id) }, { api_url: value }, { api_method: element.request.method }] }).toArray(); //to add method too ,:added method 

    if (result && result.length > 0) {
        let data = {
            api_name: element.name,
            api_status: false,
            url: value,
            message: 'This endpoint URL already exists for this application with same method',
            created_time: Math.floor(((new Date()).getTime()) / 1000),
        }
        var upload = await db.collection(collecName2).updateOne(
            { _id: ObjectId(message.idVal) },
            { $push: { data: data } }, { upsert: true })
        if (upload) {
            console.log("API Already Exist");
        }
    }
    else {
        var api = await db.collection(collecName1)
            .insertOne({
                short_description: element.name,
                // description: obj.description,
                status: 1,
                api_url: value,
                app_code: message.app_code,
                app_id: ObjectId(message.app_id),
                api_method: element.request.method,
                api_headers: element_header,
                //api_response: element.request.response,
                //body_details: element.request.body,
                api_query_params: data,
                created_by: message.created_by,
                created_time: Math.floor(((new Date()).getTime()) / 1000),
                modified_time: Math.floor(((new Date()).getTime()) / 1000),
                upload_id: message.idVal,
                code: api_code,
                group_code: 'Other',
                api_type: "External Api",
                api_request: api_request,
                to_validate: false,
                //api_response: "",
                sample_request: api_request_sample

            })
        if (api) {
            let data = {
                api_name: element.name,
                api_status: true,
                url: value,
                created_time: Math.floor(((new Date()).getTime()) / 1000),
            }
            await db.collection(collecName2)
                .updateOne(
                    { _id: ObjectId(message.idVal) },
                    { $push: { data: data } }, { upsert: true })
        }
    }


    if (length === i) {
        var api_uploads = await db.collection(collecName2)
            .updateOne(
                {
                    _id: ObjectId(message.idVal)
                },
                {
                    $set: {
                        status: "Completed",
                        end_time: Math.floor(((new Date()).getTime()) / 1000)
                    }
                })
        if (api_uploads) {

            onExit();
        }
        else {
            console.log("error on updated api_uploads database value")
        }
    }
}

function checkUrl(obj) {
    let value, method;
    if (typeof (obj.request.url) == 'object') {
        value = obj.request.url.raw + '';
        method = obj.request.method;
    }
    else {
        value = obj.request.url + '';
        method = obj.request.method;
    }

    var a = value.split("://");
    if (a.length > 1) {
        value = trimString(a[1]);
    }
    else {
        value = trimString(a[0]);
    }
    let return_obj = { "value": value, "method": method };
    return JSON.stringify(return_obj);

}

async function checkDuplicate(obj) {
    let tempresponse;
    let overallresponse = [];
    for (var i = 0; i < obj.length; i++) {
        if (obj[i].item && obj[i].item.length > 0) {
            tempresponse = await checkDuplicate(obj[i].item);
            //console.log("Temp Response ",tempresponse);
            overallresponse = overallresponse.concat(tempresponse);
        }
        else {
            overallresponse.push(obj[i]);
        }
    }

    return overallresponse;

}

async function deleteDuplicate(db, result, val_id) {
    let resulted = [];
    let collecName1 = common.collectionNameGenerator(headers, 'api_managements')
    let collecName = common.collectionNameGenerator(headers, 'api_bulk_uploads')


    for (var i = 0; i < result.length; i++) {
        var isempty_url = checkUrl(result[i]);
        isempty_url = JSON.parse(isempty_url);

        if (isempty_url.value == "" || isempty_url.value == undefined || isempty_url.value == null) {
            let data = {
                api_name: result[i].name,
                api_status: false,
                url: '',
                message: 'Endpoint URL is blank',
                created_time: Math.floor(((new Date()).getTime()) / 1000)
            }

            var upload = await db.collection(collecName).updateOne(
                { _id: ObjectId(val_id) },
                { $push: { data: data } }, { upsert: true })
        } else {
            resulted.push(result[i]);
        }
    }
    let tempurl = [];
    let tempindex = []

    for (var i = 0; i < resulted.length; i++) {
        let checkendpoint = await checkUrl(resulted[i]);
        if (tempurl.includes(checkendpoint)) {
            let index = tempurl.indexOf(checkendpoint);
            tempindex[index].push(i);
        }
        else {
            tempurl.push(checkendpoint);
            tempindex.push([i]);
        }
    }
    let finalreturnarray = []

    for (let z = 0; z < tempindex.length; z++) {
        if (tempindex[z].length > 1) {
            console.log("Temp index", tempindex[z]);
            for (let ui = 0; ui < tempindex[z].length; ui++) {
                let deleteindex = resulted[tempindex[z][ui]];
                console.log("Delete Index value is here:--->>>", deleteindex);
                var url_val = checkUrl(deleteindex);

                let duplicate_url = JSON.parse(url_val);
                let data = {
                    api_name: deleteindex.name,
                    api_status: false,
                    url: duplicate_url.value,
                    message: 'Duplicate endpoint URL in the collection with same method',
                    created_time: Math.floor(((new Date()).getTime()) / 1000),
                }
                var upload = await db.collection(collecName).updateOne(
                    { _id: ObjectId(val_id) },
                    { $push: { data: data } }, { upsert: true })
            }
        }
        else {
            finalreturnarray.push(resulted[tempindex[z][0]]);
        }
    }
    return finalreturnarray;

}



async function recursion(db, obj, message, length, i) {

    obj.forEach(element => {
        if (element.item) {
            i++;
            recursion(db, element.item, message, length, i);
        }
        else {
            i++;
            Insertion(db, element, message, length, i);
        }
    })
}

async function sendMultipleApi(db, message) {

    var i = 0;
    try {
        if (message.type === "File") {

            var result = await readFile(message.file_path, message.idVal);
            var obj = JSON.parse(result);
            var duplicate = await checkDuplicate(obj.item);
        }
        else {
            result = await readURl(message.file_path, message.idVal);
            duplicate = await checkDuplicate(result.item);

        }
        var data = await deleteDuplicate(db, duplicate, message.idVal);

        var length = data.length;

        recursion(db, data, message, length, i);
    }
    catch (err) {
        console.log("error ", err);
    }
}

module.exports.bulkInsertApiUrl = async function (db, message) {
    try {
        if (message.query === "upload") {
            headers = message.headers
            sendMultipleApi(db, message);
        }
    }
    catch (err) {
        console.log(err)
    }

}







