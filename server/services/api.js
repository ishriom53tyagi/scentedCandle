// Try edit message
module.exports.getJsonFormated = async function(req, res) {
    try {
        if (req.body.jsondata == "" || req.body.jsondata == null) {
            return res.status(200).send({ status: 'success' });
        }
        let samplejson = JSON.parse(req.body.jsondata);
        let type = req.body.type;
        let formatedJson = await getFormatedJSON(samplejson, type)
        return res.status(200).send({ status: 'success', formatedJson });
    } catch (err) {
        return res.status(500).send({ status: 'failure' });
    }
}

function formatDataforTree(formatedjson) {
    let json = formatedjson

    var arr = [];
    if (Object.keys(json).length && Object.keys(json).length > 0) {
        Object.keys(json).forEach(element => {
            if (json[element].children) {
                if (Object.keys(json[element].children).length > 0) {
                    Object.keys(json[element].children).forEach(e => {
                            json[element].children = [{ name: e, type: json[element].type, children: [json[element].children[e]] }]
                          
                        })
                      
                }
            }
        })
    }
    return json;
}

// to be used for tree hierarchy task

function objectSettingsTreeHierarchyAllProperties(name, obj, type) {
    var checktype = (typeof obj);
    var returnobj = {};
    if (checktype == 'number') {
        returnobj =  Number.isInteger(obj) ? { "type": 'number' } :  { "type": 'string' };
    } else {
        returnobj = { "type": (typeof obj) }
    }
    if (type == "body-tree-data") {
        if ((obj['type']) == "string") {
            returnobj['type'] = obj['type']
            returnobj["optional"] = obj['optional'];
            returnobj["min"] = obj['min'];
            returnobj["max"] = obj['max'];
            returnobj["details"] = obj['details'];

        } else if (obj['type'] == "number") {
            returnobj['type'] = obj['type']
            returnobj["optional"] = obj['optional'];
            // returnobj["empty"] = true;
            returnobj["min"] = obj['min'];
            returnobj["max"] = obj['max'];
            returnobj["details"] = parseInt(obj['details']);

            // returnobj["positive"] = true;
        } else if (obj['type'] == "boolean") {
            returnobj['type'] = obj['type']
            returnobj["optional"] = obj['optional'];
            // returnobj["empty"] = true;
            returnobj["min"] = obj['min'];
            returnobj["max"] = obj['max'];
            returnobj["details"] = (obj['details'] == "true" || obj['details'] == true) ? true : false;

            // returnobj["positive"] = true;
        }
    } else {
        returnobj["name"] = name;
        returnobj["desc"] = "";
    }
    return returnobj;
}


function objectSettingsTreeHierarchy(name, obj, type) {
    var checktype = (typeof obj);
    var returnobj = {};
    if (checktype == 'number') {
        returnobj = Number.isInteger(obj) ?  { "type": 'number' } : { "type": 'string' };
    } else {
        returnobj = { "type": (typeof obj) }
    }
    if (type == "body") {
        if ((typeof obj) == "string") {
            returnobj["optional"] = true;
            returnobj["desc"] = "";
            returnobj["value"] = obj;
        } else if ((typeof obj) == "number") {
            returnobj["optional"] = true;
            returnobj["desc"] = "";
            returnobj["value"] = obj;
        } else if ((typeof obj) == "boolean") {
            returnobj["desc"] = "";
            returnobj["type"] = "boolean";
            returnobj["optional"] = true;
            returnobj["value"] = obj == true ? true : false;

        } else if ((typeof obj) == "array" || (obj.length && obj.length > 0)) {
            var tempObj = {}
            let tmpObj = {}
            if (obj.length && obj.length > 0 && typeof obj[0] == "object") {
                returnobj["type"] = "array"
                returnobj["optional"] = true;
                // obj.map(e => { return e.toString() })
                //console.log("obj -> ", obj);
                returnobj["desc"] = obj['desc'] ? obj['desc'] : ""
                var arr = []
                obj.forEach(i => {
                        tempObj = {}
                        Object.keys(i).forEach(e => {
                            tempObj[e] = objectSettingsTreeHierarchy(e, i[e], type)
                        })
                        arr.push(tempObj)
                    })
                tmpObj = {
                    type: 'object',
                    props: tempObj,
                    optional: true
                }
                returnobj["props"] = tmpObj
            } else {
                returnobj["type"] = "array"
                returnobj["items"] = "strings"
                returnobj["optional"] = true;
                returnobj["desc"] = ""
                returnobj["value"] = obj.toString()

            }
        } else if (typeof obj == "object") {
            
            var obj1 = {};
            returnobj['type'] = (obj.length == 0) ? 'array' : 'object'
            returnobj["desc"] = ""
            returnobj["optional"] = true;
            if (Object.keys(obj).length > 0) {
                Object.keys(obj).forEach(e => { obj1[e] = objectSettingsTreeHierarchy(e, obj[e], type) })
                
                returnobj["props"] = obj1
            } else {
                returnobj["items"] = obj.length == 0 ? 'strings' : obj
            }
        }
    } else {
        returnobj["desc"] = "";
        returnobj["optional"] = true;
    }
    //console.log("returnobj : ", returnobj);
    if (type == "body-tree") {
        if (obj == null) {
            returnobj["type"] = "string";
            returnobj["optional"] = true;
            returnobj["min"] = 1;
            returnobj["max"] = 10;
            returnobj["details"] = null
            returnobj["desc"] = ""
        } else if ((typeof obj) == "string") {
            
            if (!isNaN(parseInt(obj)) && !obj.includes('/') && !obj.includes('-')) {
                returnobj["type"] = "number";
                returnobj["optional"] = true;
                returnobj["min"] = 1;
                returnobj["max"] = 10;


                returnobj["details"] = parseInt(obj) == 0 ? 0 : parseInt(obj);
                returnobj["desc"] = ""
            } else {
                returnobj["optional"] = true;
                returnobj["type"] = "string";
                // returnobj["empty"] = true;
                returnobj["min"] = 1;
                returnobj["max"] = 10;

                returnobj["details"] = obj;
                returnobj["desc"] = ""
            }

        } else if ((typeof obj) == "number") {
            returnobj["optional"] = true;
            returnobj["min"] = 1;
            returnobj["max"] = 10;
            returnobj["details"] = (obj == 0 || obj == null) ? 0 : obj;
            returnobj["desc"] = ""

        } else if ((typeof obj) == "boolean") {
            returnobj["type"] = "boolean";
            returnobj["optional"] = true;
            returnobj["min"] = 1;
            returnobj["max"] = 10;
            returnobj["details"] = obj == true ? true : false;
            returnobj["desc"] = ""

            // returnobj["positive"] = true;
        } else if ((typeof obj) == "array" || (obj.length && obj.length > 0)) {
            //////console.log(" array --->>  ", obj.length, typeof obj[0], obj);
            var tempObj1 = {}
            if (obj.length && obj.length > 0 && typeof obj[0] == "object") {
                returnobj["type"] = "array"
                returnobj["optional"] = true;
                returnobj["min"] = 1;
                returnobj["max"] = 10;
                returnobj["desc"] = obj['desc'] ? obj['desc'] : ""
                var arr1 = []
                obj.forEach(i => {
                        tempObj1 = {}
                        Object.keys(i).forEach(e => {
                            tempObj1[e] = objectSettingsTreeHierarchy(e, i[e], type)
                        })
                        arr1.push(tempObj1)
                    })
                    //////console.log("arr1ay in type Arr1ay is -->>>>> ", arr1);
                returnobj["items"] = arr1
            } else {
                returnobj["type"] = "array"
                returnobj["items"] = "strings"
                returnobj["optional"] = true;
                returnobj["min"] = 1;
                returnobj["max"] = 10;
                obj.map(e => { return e.toString() })
                    // //////////console.log("obj -> ", obj);
                returnobj["desc"] = ""
                returnobj["details"] = obj

            }
            // returnobj["positive"] = true;
        } else if (typeof obj == "object") {
            
            var obj2 = {};
            returnobj['type'] = (obj.length == 0) ? 'array' : 'object'
            returnobj["optional"] = true;
            returnobj["min"] = 1;
            returnobj["max"] = 10;
            returnobj["desc"] = ""
                // returnobj["props"] = obj;
            if (Object.keys(obj).length > 0) {
                Object.keys(obj).forEach(e => { obj2[e] = objectSettingsTreeHierarchy(e, obj[e], type) })
                
                returnobj["props"] = obj2
            } else {
                returnobj["items"] = obj.length == 0 ? 'strings' : obj
            }
        } else {
            returnobj["name"] = name;
            returnobj["desc"] = "";
        }

    }
    return returnobj;
}


function getFormatedJSON(samplejson, type) {
    var finaljson = {};
    if (type == "body") {
        Object.keys(samplejson).forEach(parentkey => {
            //console.log("samplejson parent key =>> ", samplejson[parentkey], parentkey);
            if (samplejson[parentkey] == null || samplejson[parentkey] == "") {
                finaljson[parentkey] = objectSettingsTreeHierarchy(parentkey, samplejson[parentkey], type)
            } else if (samplejson[parentkey].length != undefined && (typeof samplejson[parentkey]) == "object") {
                //console.log(" not equal undefined ");
                if ((typeof samplejson[parentkey][0]) == "object") {
                    //console.log(" it is object ");
                    if (type == "body") {
                        finaljson[parentkey] = {
                            type: "array",
                            items: {
                                type: "object",
                                props: readChilds(samplejson[parentkey][0], type),
                                optional: true
                            }
                        }
                    } else {
                        finaljson[parentkey] = { type: "array", desc: "", optional: true, children: readChilds(samplejson[parentkey][0], type) }
                    }
                } else {
                    if (type == "body") {
                        finaljson[parentkey] = {
                            type: "array",
                            items: objectSettingsTreeHierarchy(parentkey, samplejson[parentkey][0], type),
                            optional: true
                        }
                    } else {
                        finaljson[parentkey] = { type: "array", desc: "", optional: true }
                    }
                }
            } else {
                if ((typeof samplejson[parentkey]["type"]) == "object") {
                    //console.log(" ittt iisss objjjj");
                    var obj = readChilds(samplejson[parentkey], type);

                    finaljson[parentkey] = {}
                    finaljson[parentkey].type = "object";
                    finaljson[parentkey].props = obj;
                    finaljson[parentkey].optional = true
                } else {
                    finaljson[parentkey] = objectSettingsTreeHierarchy(parentkey, samplejson[parentkey], type)
                }
            }
        });
    } else if (type == "body-tree") {
        //////console.log("samplejson, type in body tree-> ", samplejson, type);
        Object.keys(samplejson).forEach(parentkey => {
            if (samplejson[parentkey] == null || samplejson[parentkey] == "") {
                finaljson[parentkey] = objectSettingsTreeHierarchy(parentkey, samplejson[parentkey], type)
            } else if (samplejson[parentkey].length != undefined && (typeof samplejson[parentkey]) == "object") {
                if ((typeof samplejson[parentkey][0]) == "object") {
                    
                    if (type == "body-tree") {
                     
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
              
                if ((typeof samplejson[parentkey]["type"]) == "object") {
                    var obj = readChilds(samplejson[parentkey], type);
             
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
            
        samplejson = json
        Object.keys(samplejson).forEach(parentkey => {
            if (samplejson[parentkey].length != undefined && (typeof samplejson[parentkey]) == "object") {
                // //////////console.log("............>>>", samplejson[parentkey].length, (typeof samplejson[parentkey]) == "object");
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
             
                var obj = readChilds(samplejson[parentkey], type);
          
                finaljson[parentkey] = {}
                finaljson[parentkey].type = "object";
                finaljson[parentkey].children = obj;
            } else {
                finaljson[parentkey] = objectSettingsTreeHierarchyAllProperties(parentkey, samplejson[parentkey], type)
            }

        });

    }
    ////console.log(" final json -> ", finaljson);
    //console.log(" final json -> ", JSON.stringify(finaljson, null, 4));
    return finaljson;
}

function objectSettings(name, obj, type) {
    // //console.log("object Settings : ", name, obj, type)
    var checktype = (typeof obj);
    var returnobj = {};
    if (checktype == 'number') {
        returnobj = Number.isInteger(obj) ?  { "type": 'number' } : { "type": 'string' };
    } else {
        returnobj = { "type": (typeof obj) }
    }
    if (type == "body") {
        if ((typeof obj) == "string" || (typeof obj) == "number") {
            returnobj["optional"] = true;
            returnobj["desc"] = "";
            returnobj["value"] = obj;
           
        } 
    } else {
        returnobj["name"] = name;
        returnobj["desc"] = "";
    }
    return returnobj;
}


function readChilds(obj, type) {
    var tmpjson = {}
    var tempObj = {}
    var arr = []
        //console.log("obj , type  in  readChilds  >> ", obj, type);
    if (obj.length && obj.length > 0) {
        obj.forEach(element => {
                tempObj = {}
                Object.keys(element).forEach(item => {
                    tempObj[item] = objectSettingsTreeHierarchy(item, element[item], type)
                })
                arr.push(tempObj)
                 
            })
            tmpjson = type == 'body-tree' ?  arr : tempObj
       
    } else {
        Object.keys(obj).forEach(childkey => {
            //console.log("childKEYYYYYYYYYYYYYYYYYYY ::: ", childkey, obj[childkey]);
            if (obj[childkey] == null) {
                obj[childkey] = "";
            }

            if (obj[childkey].length && (typeof obj[childkey]) == "object" && type == "body") {
                if ((typeof obj[childkey][0]) == "object") {
                    if (type == "body") {
                        // //////////console.log("propppsss");
                        tmpjson[childkey] = { type: "array", items: { type: "object", props: readChilds(obj[childkey][0], type) } }
                    } else {
                        tmpjson[childkey] = { type: "array", desc: "", name: childkey, children: readChilds(obj[childkey][0], type) }
                    }
                } else {
                    if (type == "body") {
                        tmpjson[childkey] = { type: "array", items: objectSettingsTreeHierarchy(childkey, obj[childkey][0], type) }
                    } else {
                        // //console.log("trueeeeeeeeeeee" , obj[childkey]);
                        tmpjson[childkey] = { type: "array", desc: obj[childkey], name: childkey }
                    }
                }
            } else if (type == "body") {
                if ((typeof obj[childkey]) == "object") {
                    //console.log("- type is object --->> ", obj[childkey]);
                    var obj1 = readChilds(obj[childkey], type);
                    //console.log(" obj 1 in else read childs - >  ", obj1, obj1.length);
                    tmpjson[childkey] = {}
                    tmpjson[childkey].type = "object";
                    tmpjson[childkey].optional = true
                    tmpjson[childkey].props = obj1;
                    // tmpjson[childkey] = obj1;
                } else {
                    tmpjson[childkey] = objectSettingsTreeHierarchy(childkey, obj[childkey], type)
                }

                // if ((ty
            } else if (obj[childkey].length && (typeof obj[childkey]) == "object" && type == "body-tree") {
                if ((typeof obj[childkey][0]) == "object") {
                    if (type == "body-tree") {
                        // //////////console.log("propppsss");
                        tmpjson[childkey] = { type: "array", items: { type: "object", props: readChilds(obj[childkey][0], type) } }
                    } else {
                        tmpjson[childkey] = { type: "array", details: "", name: childkey, items: readChilds(obj[childkey][0], type) }
                    }
                } else {
                    if (type == "body-tree") {
                        tmpjson[childkey] = { type: "array", items: objectSettingsTreeHierarchy(childkey, obj[childkey][0], type) }
                    } else {
                        tmpjson[childkey] = { type: "array", details: "", name: childkey }
                    }
                }
            } else {
                if ((typeof obj[childkey]) == "object") {
                    //////console.log("- type is object --->> ", obj[childkey]);
                    var obj2 = readChilds(obj[childkey], type);
                    //////console.log(" obj 1 in else read childs - >  ", obj2, obj2.length);
                    tmpjson[childkey] = {}
                    tmpjson[childkey].type = "object";
                    tmpjson[childkey].props = obj2;
                    // tmpjson[childkey] = obj2;
                } else {
                    tmpjson[childkey] = objectSettingsTreeHierarchy(childkey, obj[childkey], type)
                }

                // if ((typeof obj[childkey]) == "object") {
                //     var arraydata = []
                //     if ((typeof obj[childkey][0]) == "object") {
                //         arraydata.push(readChilds(obj[childkey][0], childkey, type));
                //     } else {
                //         arraydata.push(objectSettings(childkey,obj[childkey][0], type));
                //     }
                //     tmpjson[childkey] = arraydata;
                // } else {
                //     tmpjson[childkey] = objectSettings(childkey,obj[childkey], type);

                // }
            }
        });
    }
    //console.log('tempjson', tmpjson);
    return tmpjson;
}


function formatreqjson(json) {
    var formatedjson = {}
    for (var i = 0; i < Object.keys(json).length; i++) {
        var parentkey = Object.keys(json)[i]
        formatedjson[parentkey] = loadreqchilds(json[Object.keys(json)[i]])
    }
    return JSON.stringify(formatedjson)
}

function loadreqchilds(obj) {
    var data = {}
        // //////////console.log("obj , type  in  loadreqChilds  >> ", obj, type);

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
                        for (var l = 0; l < Object.keys(obj.items.props).length; l++) {
                            var key1 = Object.keys(obj.items.props)[l];
                            var val = obj.items.props[key1];
                            data[key1] = loadreqchilds(val);
                            // data[Object.keys(obj.children)[k]] = loadreqchilds(key)
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
                for (var m = 0; m < Object.keys(obj[Object.keys(obj)[l]].items.props).length; m++) {
                    var key2 = obj[Object.keys(obj)[l]].items.props[Object.keys(obj[Object.keys(obj)[l]].items.props)[m]];
                    var tmp = {}
                    tmp[Object.keys(obj[Object.keys(obj)[l]].items.props)[m]] = datatype(key2.type);
                    data[Object.keys(obj)[l]].push(tmp)

                }
            } else {
                data[Object.keys(obj)[l]] = datatype(obj[Object.keys(obj)[l]].type)
            }
        }
    }
    return data
}

function FormatDocjson(json) {
    var formatedjson = {}
    for (var i = 0; i < Object.keys(json).length; i++) {
        var parentkey = Object.keys(json)[i]
        formatedjson[parentkey] = loadchilds(json[Object.keys(json)[i]])
    }
    return JSON.stringify(formatedjson)
}

function loadchilds(obj, name) {
    var data = {}
    if (obj.name && obj.type) {
        if ((obj.type == 'array')) {
            if (obj.children) {
                data = {}
                for (
                    var k = 0; k < Object.keys(obj.children).length; k++
                ) {
                    var key = obj.children[Object.keys(obj.children)[k]];
                    data[Object.keys(obj.children)[k]] = loadchilds(key, Object.keys(obj.children)[k])
                }
            }
        } else if ((obj.type == 'object')) {
            if (obj.children) {
                data = {}
                for (
                    var a = 0; a < obj.children.length; a++
                ) {
                    var subkey = obj.children[a];
                    data[subkey.name] = loadchilds(subkey, subkey.name)
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
                    var b = 0; b < Object.keys(obj.props[Object.keys(obj.props)[l]].children).length; b++
                ) {
                    var key =
                        obj.props[Object.keys(obj.props)[l]].children[
                            Object.keys(obj.props[Object.keys(obj.props)[l]].children)[b]
                        ]
                    if (key.name != undefined) {
                        tmpdata[key.name] = loadchilds(key, key.name)
                    }
                }
                data[Object.keys(obj.props)[l]] = [tmpdata];
            } else {
                data[Object.keys(obj.props)[l]] = ""
                    
            }
        }
    } else {
        for (var l = 0; l < Object.keys(obj).length; l++) {
            if (obj[Object.keys(obj)[l]].children) {
                var tmpdata = {}
                for (
                    var k = 0; k < Object.keys(obj[Object.keys(obj)[l]].children).length; k++
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
                data[Object.keys(obj)[l]] = ""
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