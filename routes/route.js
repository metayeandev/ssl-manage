var express = require('express');
var router = express.Router();

var HomeController = require('./../controllers/HomeController');

/* GET home page. */
router.get('/', HomeController.index);
router.get('/create', HomeController.create);
router.post('/storeCert', HomeController.storeCert);


module.exports = router;
