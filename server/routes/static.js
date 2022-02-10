const express = require('express');
const router = express.Router();
const config = require('../config.json')
const staticfun = require('../services/static');
var path = require('path');


if (config.server == "standalone") {
    router.get("/reports/:name", staticfun.reportDownload);
    // router.use("/images/applications", express.static(path.join(__dirname, "../" + config.imagePath)));
    router.use("/images/applications", express.static(path.join(__dirname, config.imagePath)));
    router.use("/documents", express.static(path.join(__dirname, config.api_document_path)));
}
if (config.server == "autoscale") {
    router.get("/reports/:name", staticfun.reportDownload);
    router.get("/images/applications/:name", staticfun.applicationImage);
    router.get("/documents/:name", staticfun.ducumentation);
}



module.exports = router;