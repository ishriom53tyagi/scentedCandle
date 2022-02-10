const { responseData } = require('../utils/responseHandler');
const fs = require('fs');
const releaseJsonPath = 'bin/upgrade/';
const jsonFile = 'releases.json';


module.exports.getReleaseNotes = async function (req, res) {
    try {
        console.log("Release Notes",req.query);
        // let path = releaseJsonPath+ 2.7.0/release_notes.json'
        let version = req.query.version
        version = version == req.query.selectedVersion ? version : req.query.selectedVersion
        let path = `${releaseJsonPath}${version}/${jsonFile}`
        console.log("path : ",path);
        if (fs.existsSync(path)) {
            console.log("file already exists");
            var data = fs.readFileSync(path, 'utf8');
            var list = (data.length) ? JSON.parse(data) : [];
            // console.log("list :: ", list);
            console.log("version : ",list);
            // list.categories.forEach(element => {
            //     // console.log(typeof element);
            //     // element =  JSON.parse(element)
            //     element.changes.forEach(e=>{
            //         console.log( typeof e.label , e.label);
            //         e.label = `$(e.label)`
            //     })
            // });
            return responseData(res, true, 200, 'success', list[0]);
        }
        else {
            fs.writeFile(path, "no data", 'utf8', function (err) {
                console.error(err);
            });
        }
    } catch (error) {
        console.log(error);
        return responseData(res, false, 500);
    }
}