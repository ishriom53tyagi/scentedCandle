const express = require('express');
const router = express.Router();
const DummyApi =  require('../services/dummyApi');

//dummy API
router.get('/dummy/api/get', DummyApi.get);
router.get('/dummy/api/queryParams', DummyApi.queryParams);
router.post('/dummy/api/post', DummyApi.post);
router.post('/dummy/api/delete', DummyApi.delete);
router.get('/dummy/api/500', DummyApi.internalServerError);
router.get('/dummy/api/201', DummyApi.statusCode201);

module.exports = router;