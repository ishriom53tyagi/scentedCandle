const getDb = require('../utils/database').getDb;
const config = require('../config')
const { responseData } = require('../utils/responseHandler');
var fs = require('fs');
var path = require('path');
const ObjectId = require('mongodb').ObjectId;
const common = require('../utils/common');

exports.showdocumentationNew = async (req, res) => {
  // console.log('params--->>', req.params.appCode);
  const db = getDb();
  let collecName = common.collectionNameGenerator(req.headers, 'api_managements')
  let collecName1 = common.collectionNameGenerator(req.headers, 'applications')

  var appdetails = await db.collection(collecName1)
    .find({ code: req.params.appCode })
    .toArray()
  var apidata = await db.collection(collecName)
    .find({ app_code: req.params.appCode })
    .toArray()
  var statuscodes = await db.collection('status_codes')
    .find()
    .project({ _id: 1, code: 1, message: 1, type: 1 })
    .toArray()
  console.log('---<>>>>', appdetails[0], apidata, statuscodes);
  let check = appdetails.some(obj => obj.hasOwnProperty('other_params'));
  let checkSection = appdetails.some(obj => obj.hasOwnProperty('add_section_params'));


  if (typeof appdetails[0].app_logo == 'object') {
    appdetails[0].app_logo = ""
  }
  else {
    if (appdetails[0].app_logo != "") {
      appdetails[0].app_logo = appdetails[0].app_logo.includes("https") ? appdetails[0].app_logo : `${config.backend_url}/${config.imagePathUrl}/${appdetails[0].app_logo}`
    }
    else {
      appdetails[0].app_logo = ""
    }
  }
  if (appdetails[0].app_logo == "https://hotels.intermiles.com/hamse_images/images/hamsecore/intermiles-header-logo.svg") {
    appdetails[0].app_logo = ""
  }
  // console.log('check->',checkSection,appdetails[0].app_logo);
  if (!check) {
    appdetails[0].other_params = []
  }
  if (!checkSection || appdetails[0].add_section_params == null) {
    appdetails[0].add_section_params = []
  }
  else {
    appdetails[0].add_section_params.forEach(element => {
      if (element.type == 'i') {
        // console.log(element.value);
        element.value = `${config.backend_url}/${config.imagePathUrl}/${element.value}`
        // console.log(element.value);
      }
    });
  }
  // console.log('menu---------->', api_menuGroup(apidata));
  // console.log('jsonreq===>', getRquestJson(apidata));

  if (appdetails.length > 0) {
    if (apidata.length > 0) {
      res.render("docNew", { menu: api_menuGroup(apidata), apidata: getRquestJson(apidata), statuscodes: statuscodes, apps: appdetails[0], menuGrp: [] })
    } else {
      // res.send("Not Found")
      res.render("docNew", { menu: api_menuGroup(apidata), apidata: getRquestJson(apidata), statuscodes: statuscodes, apps: appdetails[0], menuGrp: [] })
    }
  } else {
    res.send("Not Found")
  }
}
// swaggerDocumentation
exports.swaggerDocumentation = async (req, res) => {
  const db = getDb();
  let collecName = common.collectionNameGenerator(req.headers, 'applications')

  if (req.params.appCode) {
    let app_code = req.params.appCode;
    console.log("found app-code", app_code);
    let verifyAppcode = await db.collection(collecName).find({ code: app_code }).toArray();
    if (verifyAppcode && verifyAppcode.length > 0) {
      res.render("doc", { path: verifyAppcode[0]._id, app_code: app_code });
    } else {
      res.send("Not Found")
    }
  } else {
    res.send("Not Found")
  }

}
exports.showdocumentation = async (req, res) => {
  // console.log('params--old----->>',req.params.appCode);
  const db = getDb();
  let collecName = common.collectionNameGenerator(req.headers, 'api_managements')
  let collecName1 = common.collectionNameGenerator(req.headers, 'applications')

  var appdetails = await db.collection(collecName1)
    .find({ code: req.params.appCode })
    .toArray()
  // console.log(appdetails);
  var data = await db.collection(collecName)
    .find({ app_code: req.params.appCode })
    .toArray()
  // console.log(data);
  var errors = await db.collection('status_codes')
    .find()
    .project({ _id: 1, code: 1, message: 1 })
    .toArray()
  // console.log(errors);
  // console.log(appdetails[0]);
  let check = appdetails.some(obj => obj.hasOwnProperty('other_params'));
  let checkSection = appdetails.some(obj => obj.hasOwnProperty('add_section_params'));
  // console.log('check->',check);
  if (!check) {
    appdetails[0].other_params = []
  }
  if (!checkSection) {
    appdetails[0].add_section_params = []
  }
  else {
    appdetails[0].add_section_params.forEach(element => {
      if (element.type == 'i') {
        element.value = `${config.backend_url}/${config.imagePathUrl}/${element.value}`
        // console.log(element.value);
      }
    });
  }
  // console.log('menu---------->', api_menuGroup(data));
  // console.log('jsonreq===>', getRquestJson(data));

  if (appdetails.length > 0) {
    if (data.length > 0) {
      res.render("documentation", { menu: api_menuGroup(data), data: getRquestJson(data), errors: errors, apps: appdetails[0] })
    } else {
      res.render("documentation", { menu: api_menuGroup(data), data: getRquestJson(data), errors: errors, apps: appdetails[0] })
    }
  } else {
    res.render("documentation", { menu: api_menuGroup(data), data: getRquestJson(data), errors: errors, apps: appdetails[0] })
  }
}

function api_menuGroup(apidata) {
  var apismenu = [];
  const unique = [...new Set(apidata.map(item => item.group_code))];
  unique.forEach(element => {
    var d = apidata.filter(item => item.group_code == element);
    d = d.filter(item => {
      if (item.isCheckedDocumentation == undefined && item.is_checked_documentation == undefined) {
        return d;
      }
      else if (!(item.isCheckedDocumentation || item.is_checked_documentation)) {
        return d;
      }

    })
    if (d.length != 0) {
      // console.log("D value is Here", d);
      apismenu.push({ name: element, children: d })
    }
  });
  return apismenu;
}

function getRquestJson(apidata) {
  // console.log(apidata);
  apidata.forEach(element => {
    if (element) {
      try {
        element.api_headers = JSON.stringify(element.api_headers)
        // console.log(JSON.stringify(element.api_query_params));
        element.api_request_json = [];
        element.api_response_json = [];
        if (element.api_request) {
          var api_request_raw = JSON.parse(element.api_request);
          // console.log('api_request_raw: ', api_request_raw);
          // for (var l = 0; l < Object.keys(api_request_raw).length; l++) {
          //   var key = Object.keys(api_request_raw)[l];
          //   element.api_request_json.push({ id: l + "", "name": key, type: api_request_raw[key].type, isRequired: checkIsRequired(api_request_raw[key]), desc: getDescDetails(api_request_raw[key]) })
          //   // var childs=getChild(l+"",)
          // }
          //console.log(element.api_code);
          // element.headers_json = docmentreq(JSON.parse(element.api_headers))
          // console.log('element headers_json: ==================>>>', element.headers_json);
          element.api_request_json = docmentreq(api_request_raw)
          // console.log('element.api_request_json: ', element.api_request_json);
          element.api_request_sample = formatreqjson(JSON.parse(element.api_request));
          // console.log(element.api_request_sample);
        }
        // console.log(element.api_code);
        if (element.api_response) {
          var json = {}
          try {
            json = JSON.parse(element.api_response);
          } catch (e) {
            json = JSON.parse(JSON.stringify(element.api_response))
          }
          var api_resp_json = docmentresp(json);
          element.api_response_json = api_resp_json;
          // if (element.api_response) {
          // console.log(element.api_code, element.api_short_description, json)
          element.api_response_sample = element.sample_response || formatjson(JSON.parse(element.api_response))
          element.api_request_sample = formatjson(JSON.parse(element.api_request))
          // }
        }
      } catch (e) {
        element.api_request_json = null;
      }
    } else {
      element.api_request_json = null;
    }
  });
  return apidata;
}

function formatjson(json) {
  // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',JSON.stringify(json));
  var formatedjson = {}
  for (var i = 0; i < Object.keys(json).length; i++) {
    var parentkey = Object.keys(json)[i]
    //   console.log(parentkey);
    formatedjson[parentkey] = loadchilds(json[Object.keys(json)[i]])
  }
  // console.log(JSON.stringify(formatedjson));
  return JSON.stringify(formatedjson)
}

function loadchilds(obj, name) {
  var data = {}
  if (obj.name && obj.type) {
    if ((obj.type == 'array')) {
      if (obj.children) {
        data = {}
        for (
          var k = 0;
          k < Object.keys(obj.children).length;
          k++
        ) {
          var key = obj.children[Object.keys(obj.children)[k]];
          data[Object.keys(obj.children)[k]] = loadchilds(key, Object.keys(obj.children)[k])
        }
      }
    } else if ((obj.type == 'object')) {
      if (obj.children) {
        data = {}
        for (
          var k = 0;
          k < obj.children.length;
          k++
        ) {
          var key = obj.children[k];
          data[key.name] = loadchilds(key, key.name)
        }
      }
    } else {
      data = datatype(obj.type)
    }
  } else if (obj.type == "object" && obj.props) {
    for (var l = 0; l < Object.keys(obj.props).length; l++) {
      if (obj.props[Object.keys(obj.props)[l]].children) {
        var tmpdata = {}
        for (
          var k = 0;
          k < Object.keys(obj.props[Object.keys(obj.props)[l]].children).length;
          k++
        ) {
          // console.log(obj.props[Object.keys(obj.props)[l]].children);
          // console.log(Object.keys(obj.props[Object.keys(obj.props)[l]].children)[k]);
          var key =
            obj.props[Object.keys(obj.props)[l]].children[
            Object.keys(obj.props[Object.keys(obj.props)[l]].children)[k]
            ]
          // var t=Object.keys(obj[Object.keys(obj)[l]].children)[k];
          if (key.name == undefined) {
            // tmpdata[t] = loadchilds(key,key.name)
          } else {
            tmpdata[key.name] = loadchilds(key, key.name)
          }
        }
        data[Object.keys(obj.props)[l]] = [tmpdata];
      } else {
        //console.log(obj[Object.keys(obj)[l]],Object.keys(obj)[l])
        data[Object.keys(obj.props)[l]] = ""
        // data[obj[Object.keys(obj)[l]]]="";
        //data={"A":"s"}
      }
    }
  } else {
    for (var l = 0; l < Object.keys(obj).length; l++) {
      if (obj[Object.keys(obj)[l]].children) {
        var tmpdata = {}
        for (
          var k = 0;
          k < Object.keys(obj[Object.keys(obj)[l]].children).length;
          k++
        ) {
          var key =
            obj[Object.keys(obj)[l]].children[
            Object.keys(obj[Object.keys(obj)[l]].children)[k]
            ]
          var t = Object.keys(obj[Object.keys(obj)[l]].children)[k];
          if (key.name == undefined) {
            tmpdata[t] = loadchilds(key, key.name)
          } else {
            tmpdata[key.name] = loadchilds(key, key.name)
          }
        }
        data[Object.keys(obj)[l]] = [tmpdata];
      } else {
        //console.log(obj[Object.keys(obj)[l]],Object.keys(obj)[l])
        data[Object.keys(obj)[l]] = ""
        // data[obj[Object.keys(obj)[l]]]="";
        //data={"A":"s"}
      }
    }
  }
  return data
}

function docmentresp(api_resp_json) {
  let api_response_json = []
  var valid = true;
  if (Object.keys(api_resp_json).length > 100) {
    valid = false;
  }
  if (valid) {
    for (var l = 0; l < Object.keys(api_resp_json).length; l++) {
      getChild(
        l + 1,
        api_resp_json[Object.keys(api_resp_json)[l]],
        Object.keys(api_resp_json)[l], ""
      )
    }
  }
  // console.log(api_resp_json);
  return api_response_json
}


function getChild(srno, obj, name, parent) {

  if (obj.name && obj.type) {
    api_response_json.push({
      id: srno + '',
      name: obj.name,
      type: obj.type,
      desc: obj.desc,
      parent: parent,
    })
    if (obj.children) {
      for (var l = 0; l < Object.keys(obj.children).length; l++) {
        getChild(
          srno + '-' + (l + 1),
          obj.children[Object.keys(obj.children)[l]],
          Object.keys(obj.children)[l],
          srno
        )
      }
    }
  } else if (obj.type == "object" && obj.props) {
    api_response_json.push({
      id: srno + '',
      name: name,
      type: obj.type,
      desc: obj.desc,
      parent: parent,
    })
    for (var l = 0; l < Object.keys(obj.props).length; l++) {
      getChild(
        srno + '-' + (l + 1),
        obj.props[Object.keys(obj.props)[l]],
        Object.keys(obj.props)[l],
        srno
      )
    }
  } else {
    api_response_json.push({
      id: srno + '',
      name: name,
      type: "Object",
      desc: "",
      parent: parent,
    })
    if (obj) {
      for (var l = 0; l < Object.keys(obj).length; l++) {
        if ((typeof obj[l]) == "object") {
          getChild(
            srno + '-' + (l + 1),
            obj[Object.keys(obj)[l]],
            Object.keys(obj)[l],
            srno
          )
        }
      }
    }
  }
}
function docmentreq(api_req_json) {
  var api_request_json_data = []
  for (var l = 0; l < Object.keys(api_req_json).length; l++) {
    var key = Object.keys(api_req_json)[l];
    var val = api_req_json[key]
    getreqDocChild(
      l + 1,
      val,
      key, "",
      api_request_json_data
    )
  }
  return api_request_json_data
}

function getreqDocChild(srno, obj, name, parent, api_request_json_data) {
  // console.log('is req', obj)
  if (obj) {
    if (obj.type) {
      api_request_json_data.push({
        id: srno + '',
        name: name,
        type: obj.type,
        isRequired: checkIsRequired(obj),
        desc: getDescDetails(obj),
        parent: parent
      })
      if (obj.items) {
        // //console.log(obj.items.props);
        getreqDocChild(
          srno,
          obj.items.props,
          "children",
          "",
          api_request_json_data
        )
      } else if (obj.props) {
        getreqDocChild(
          srno,
          obj.props,
          "children",
          "",
          api_request_json_data
        )
      }
    } else if ((typeof obj) == "object" && obj.length > 0) {
      if (obj.length > 0) {
        api_request_json_data.push({
          id: srno + '',
          name: name,
          type: obj[0].type,
          isRequired: checkIsRequired(obj[0]),
          desc: getDescDetails(obj[0]),
          parent: parent
        })
      }
    } else {
      for (var l = 0; l < Object.keys(obj).length; l++) {
        getreqDocChild(
          srno + '-' + (l + 1),
          obj[Object.keys(obj)[l]],
          Object.keys(obj)[l],
          srno,
          api_request_json_data
        )
      }
    }
  }
}

function getDescDetails(obj) {
  var desc = "";
  if (obj.empty) {
    desc += "accepts an empty string \"\".<br>";
  }
  if (obj.min) {
    desc += "Minimum value length is " + obj.min + ".<br>";
  }
  if (obj.max) {
    desc += "Maximum value length is " + obj.max + ".<br>";
  }
  if (obj.length) {
    desc += "Fixed value length is " + obj.length + ".<br>";
  }
  if (obj.pattern) {
    desc += "Regex pattern is " + obj.pattern + ".<br>";
  }
  if (obj.contains) {
    desc += "The value must contain this " + obj.contains + " text.<br>";
  }
  if (obj.enum) {
    desc += "The value must be an element of the enum array of [" + JSON.stringify(obj.enum) + "].<br>";
  }
  if (obj.alpha) {
    desc += "The value must be an alphabetic string.<br>";
  }
  if (obj.numeric) {
    desc += "The value must be a numeric string.<br>";
  }
  if (obj.alphanum) {
    desc += "The value must be an alphanumeric string.<br>";
  }
  if (obj.alphadash) {
    desc += "The value must be an alphanumeric string.<br>";
  }
  if (desc == "") {
    if (obj.type == "string") {
      desc = "The value must be an alphanumeric string.";
    }
    if (obj.type == "number") {
      desc = "The value must be a numeric value.";
    }
    if (obj.type == "boolean") {
      desc = "The value must be a true/false value.";
    }
  }
  return desc;
}

function checkIsRequired(obj) {
  if (obj.optional) {
    return false;
  } else {
    if (obj.type == "object" || obj.type == "array") {
      return true;
    } else {
      return true;
    }
  }
}

function formatreqjson(json) {
  var formatedjson = {}
  for (var i = 0; i < Object.keys(json).length; i++) {
    var parentkey = Object.keys(json)[i]
    formatedjson[parentkey] = loadreqchilds(json[Object.keys(json)[i]])
  }
  // console.log('formatedjsonreq',JSON.stringify(formatedjson));
  return JSON.stringify(formatedjson)
}
function loadreqchilds(obj) {
  var data = {}

  if (obj.type) {
    if (obj.type == 'array') {
      if (obj.children) {
        data = {}
        for (var k = 0; k < Object.keys(obj.children).length; k++) {
          var key = obj.children[Object.keys(obj.children)[k]]
          data[Object.keys(obj.children)[k]] = loadreqchilds(key)
        }
      } else if (obj.items) {
        if ((typeof obj.items) == "string") {
          data = [];
        } else {
          if (obj.items.type == "object") {
            for (var k = 0; k < Object.keys(obj.items.props).length; k++) {
              var key = Object.keys(obj.items.props)[k];
              var val = obj.items.props[key];
              data[key] = loadreqchilds(val);
            }
          }
        }
      }
    } else {
      data = datatype(obj.type)
    }
  } else {
    data = {}
    for (var l = 0; l < Object.keys(obj).length; l++) {
      if (obj[Object.keys(obj)[l]].type == 'array' && obj[Object.keys(obj)[l]].items.type == "object") {
        data[Object.keys(obj)[l]] = [];
        for (var k = 0; k < Object.keys(obj[Object.keys(obj)[l]].items.props).length; k++) {
          var key = obj[Object.keys(obj)[l]].items.props[Object.keys(obj[Object.keys(obj)[l]].items.props)[k]];
          var tmp = {}
          tmp[Object.keys(obj[Object.keys(obj)[l]].items.props)[k]] = datatype(key.type);
          data[Object.keys(obj)[l]].push(tmp)
        }
      } else {
        data[Object.keys(obj)[l]] = datatype(obj[Object.keys(obj)[l]].type)
      }
    }
  }
  return data
}

function datatype(type) {
  if (type == "string") {
    return "";
  } else if (type == "boolean") {
    return true;
  } else if (type == "number") {
    return 0;
  }
}

function api_response(json) {
  //    console.log('resp>>>>>>>',JSON.parse(json));
  var formatedjson = {};
  let jsonObj = JSON.parse(json)
  //    console.log(Object.keys(jsonObj));
  for (var i = 0; i < Object.keys(jsonObj).length; i++) {
    var parentkey = Object.keys(jsonObj)[i]
    // if(parentkey.type)
    // console.log(parentkey);
    if (Object.keys(jsonObj)['type'] in Object.keys(jsonObj)) {
      // console.log(true);
      // delete parentkey.type
    }
    // formatedjson[parentkey] = loadreqchilds(jsonObj[Object.keys(jsonObj)[i]])
    // if('type' in Object.keys(jsonObj)[i]){
    //     delete Object.keys(jsonObj)[i].type
    // }
  }
  // console.log(jsonObj);
  // console.log(formatedjson);
}

//Module that hit application 
// module.exports.updateAllDocumentation = async function (req, res) {
//   try {
//       // console.log("Api URL body is:--> req-->>", req.body);
//       await getJsonData();
//       // console.log("ans", ans);
//       return res.sendStatus(200);
//   }
//   catch (error) {
//       console.log("error : ", error);
//       return res.sendStatus(500);
//   }
// }

module.exports.updateDocumentation = async function (req, res) {
  try {
    const db = getDb();
    let collecName = common.collectionNameGenerator(req.headers, 'api_bulk_uploads')
    let collecName1 = common.collectionNameGenerator(req.headers, 'applications')
    let collecName2 = common.collectionNameGenerator(req.headers, 'api_managements')

    if (req && req.body.app_code) {
      if (req.body.api_uploads) {
        await db.collection(collecName).updateOne({ '_id': ObjectId(req.body.api_uploads) }, { $set: { 'reset_documentation': true } })
        // await db.collection('api_bulk_uploads').updateOne({ '_id': ObjectId(req.body.api_uploads) }, { $set: { 'reset_documentation': true } })
      }
      var applicationcode = await db.collection(collecName1)
        // var applicationcode = await db.collection('applications')
        .find({ _id: ObjectId(req.body.app_code) })
        .toArray()
      let apidata = await db.collection(collecName2).find({ app_id: ObjectId(applicationcode[0]._id) }).toArray();
      // let apidata = await db.collection('api_managements').find({ app_id: ObjectId(applicationcode[0]._id) }).toArray();
      let applicationData = await db.collection(collecName1).find({ _id: ObjectId(applicationcode[0]._id) }).toArray();
      // let applicationData = await db.collection('applications').find({ _id: ObjectId(applicationcode[0]._id) }).toArray();
      let filePath = path.join(__dirname, config.api_document_path, applicationcode[0]._id + ".json");
      await api_doc_creation(apidata, filePath, applicationData);
    } else {
      let total_app_code = await db.collection(collecName1).find().project({ _id: 1, code: 1 }).toArray();
      // let total_app_code = await db.collection('applications').find().project({ _id: 1, code: 1 }).toArray();
      // console.log(total_app_code);
      for (let i = 0; i < total_app_code.length; i++) {
        let apidata = await db.collection(collecName2).find({ app_id: ObjectId(total_app_code[i]._id) }).toArray();
        // let apidata = await db.collection('api_managements').find({ app_id: ObjectId(total_app_code[i]._id) }).toArray();
        let applicationData = await db.collection(collecName1).find({ _id: ObjectId(total_app_code[i]._id) }).toArray();
        // let applicationData = await db.collection('applications').find({ _id: ObjectId(total_app_code[i]._id) }).toArray();
        let filePath = path.join(__dirname, config.api_document_path, total_app_code[i]._id + ".json");
        await api_doc_creation(apidata, filePath, applicationData);
      }
      return
    }
    return responseData(res, true, 200, "success");
  }
  catch (error) {
    console.log("error : ", error);
    return responseData(res, false, 500, "success");
  }
}

async function api_doc_creation(apidata, filePath, applicationData) {

  let nextNode = {};
  let start = {
    "openapi": "3.0.1",
    "servers": [{
      "url": config.environment_url + '/{api_path}'
    }],
    "info": {
      "title": applicationData[0].name ? applicationData[0].name : undefined,
      "x-logo": {
        "url": applicationData[0].app_logo && applicationData[0].app_logo != 'NA' ? `/${config.imagePathUrl}/${applicationData[0].app_logo}` : `../../static/images/applications/simplikA_Logo-01.png`,
        "backgroundColor": "#FFFFFF",
        "width": "150px",
        "altText": applicationData[0].name
      },
      "description": applicationData[0].description ? applicationData[0].description : undefined,
      "contact": {
        "email": applicationData[0].notification_to ? applicationData[0].notification_to : undefined
      },

    },
    "basePath": "/server/development",
    "schemes": [
      "https",
      "http"
    ],
    "paths": {}
  }

  for (var i = 0; i < apidata.length; i++) {
    if (!(apidata[i].is_checked_documentation)) {
      let reqBody
      let resBody
      let reqSample
      let resSample
      // console.log("application code and url", apidata[i].api_url, apidata[i].app_code);
      try {
        if (apidata[i].api_request) {
          reqBody = reqBodyCreater(apidata[i].api_request, apidata[i].app_code, apidata[i].api_url);
        }
        if (apidata[i].api_response && apidata[i].api_response != "") {
          resBody = reqBodyCreater(apidata[i].api_response, apidata[i].app_code, apidata[i].api_url);
          // console.log("response Body", resBody);
        }

        if (apidata[i].sample_request) {
          if (typeof apidata[i].sample_request != "object") {
            reqSample = JSON.parse(apidata[i].sample_request);
          } else {
            reqSample = apidata[i].sample_request;
          }
        }

        if (apidata[i].sample_response) {
          if (typeof apidata[i].sample_response != "object") {
            resSample = JSON.parse(apidata[i].sample_response);
          } else {
            resSample = apidata[i].sample_response;
          }
        }

        if (apidata[i].api_query_params && apidata[i].api_query_params.length > 0) {
          if (apidata[i].api_query_params[0].description == null) {
            apidata[i].api_query_params[0].description = undefined;
          }
        }

      }
      catch (err) {
        console.log("error is here sample request", err, apidata[i].api_url, apidata[i].app_code);
        reqSample = undefined
        // console.log("application code and url", apidata[i].api_url, apidata[i].app_code);
      }
      let parameters = [];
      apidata[i].api_query_params.map(o => {
        o.in = "query";
        if (o.description == null) {
          o.description = undefined;
        }
        parameters.push(o)
      });

      apidata[i].api_headers.map(o => {
        o.in = "header";
        if (o.description == null) {
          o.description = undefined;
        }
        parameters.push(o)
      });

      nextNode[apidata[i].api_url] = {
        [apidata[i].api_method.toLowerCase()]: {
          "tags": [
            apidata[i].group_code ? apidata[i].group_code : "Other"
          ],
          "summary": apidata[i].short_description ? apidata[i].short_description : undefined,
          "description": apidata[i].description ? apidata[i].description : "",
          "parameters": parameters,
          "requestBody": {
            "description": apidata[i].body_details ? apidata[i].body_details : undefined,
            "content": {
              "application/json": {
                "schema": reqBody,
                "examples": {
                  "Ex1": {
                    "summary": "summary",
                    "value": reqSample
                  }
                }

              }
            }
          },
          "responses": {
            "200": {
              "description": apidata[i].response_details ? apidata[i].response_details : "successful operation",
              "content": {
                "application/json": {
                  "schema": resBody,
                  "examples": {
                    "Ex1": {
                      "summary": "summary",
                      "value": resSample
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Internal server error",
            }
          }
        }
      }
      // console.log("Here we go for our code",apidata[i].api_request,typeof(apidata[i].api_request));
      if (reqSample == undefined) {
        // apidata[i].api_request.localeCompare({})
        // console.log("deleted is:-->>",nextNode[apidata[i].api_url][apidata[i].api_method.toLowerCase()]["requestBody"])
        delete nextNode[apidata[i].api_url][apidata[i].api_method.toLowerCase()]["requestBody"]["content"]["application/json"]["examples"];
      }

      if (apidata[i].api_request == null || apidata[i].api_request == undefined) {
        //(typeof(apidata[i].api_response) == "string" ? apidata[i].api_response.localeCompare({}):false)
        // console.log("always wrong it is",apidata[i].api_request);
        delete nextNode[apidata[i].api_url][apidata[i].api_method.toLowerCase()]["requestBody"];
      }
      if (apidata[i].api_response == null || apidata[i].api_response == undefined) {
        delete nextNode[apidata[i].api_url][apidata[i].api_method.toLowerCase()]["responses"]["200"]["content"];
      }

      if (typeof (apidata[i].api_response) == "string") {
        if (apidata[i].api_response == '{}') {

          delete nextNode[apidata[i].api_url][apidata[i].api_method.toLowerCase()]["responses"]["200"]["content"];
        }
      }
      if (typeof (apidata[i].api_request) == "string") {
        if (apidata[i].api_request == '{}') {

          delete nextNode[apidata[i].api_url][apidata[i].api_method.toLowerCase()]["requestBody"];
        }
      }
    }
  }
  start["paths"] = nextNode;

  try {
    fs.writeFileSync(filePath, JSON.stringify(start, null, 4), { encoding: 'utf8' });   //'a+' is append mode
    // let writer = fs.createWriteStream(filePath, { encoding: 'utf8' });
    // writer.write(JSON.stringify(start, null, 4), function (err, result) {
    //   if (err) {
    //     console.log(err);
    //   }
    // });
    return;
  } catch (e) {
    console.log("errorr", e);
    return;
  }

}

function reqBodyCreater(api_request, appCode, url) {

  try {
    let api_request_json;
    let finalBody;
    let reqBody = {};
    finalBody = {
      "type": "object"
    }
    if (!(typeof api_request == "object")) {
      api_request_json = JSON.parse(api_request);
    } else {
      api_request_json = api_request
    }

    for (var key of Object.keys(api_request_json)) {
      let ans = JSON.stringify(api_request_json[key]);
      let finalstring = ans.split("props").join("properties");
      let totalFinalString = finalstring.replace(/\bdesc\b/gi, 'description');
      ans = JSON.parse(totalFinalString);
      reqBody[key] = ans;
    }
    finalBody["properties"] = reqBody;

    for (var key in finalBody) {
      if (finalBody.hasOwnProperty(key)) {
        finalBody = checkRequired(finalBody);
      }
    }
    return finalBody
  } catch (error) {
    console.log("error in application with app code and url", appCode, url)
    console.log("error is here", error);
  }

}

function checkRequired(reqBody) {
  let required = [];
  for (var key in reqBody.properties) {
    if (reqBody.properties.hasOwnProperty(key)) {
      if (reqBody.properties[key]["optional"] != undefined && !(reqBody.properties[key]["optional"])) {

        required.push(key);
      }
      if (reqBody.properties[key].type == "object") {
        checkRequired(reqBody.properties[key]);
      }
    }
  }
  reqBody["required"] = required;
  return reqBody;
}