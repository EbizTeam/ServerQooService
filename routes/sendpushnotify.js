const express = require('express');
const router = express.Router();

const Checktoken = require('../models/checktoken');
const Sendnotifyios = require('../models/sendnotifyios');

router.use( function (req, res, next) {
    Checktoken(req, res, next);
});

//add a new to the db
router.post('/', function (req, res, next) {
    Sendnotifyios(req.body.device_token,req.body.content_text,3);
});

module.exports = router;
