const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authentication');
const queryService = require('../services/query');
const generateService = require('../services/generate');

router.get("/security/generate/authtoken", generateService.authToken);

router.use(authMiddleware.validateAuth);

router.get("/security/db/collections",queryService.collections);
router.post("/security/db/select", queryService.select);
router.post("/security/db/insert", queryService.insert);
router.post("/security/db/insertmany", queryService.insertMany);
router.put("/security/db/update", queryService.update);
router.delete("/security/db/delete", queryService.delete);

module.exports = router;
