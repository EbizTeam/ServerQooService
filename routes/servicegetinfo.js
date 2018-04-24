const express = require('express');
const router = express.Router();
const Services = require('../models/services');
const Checktoken = require('../models/checktoken');




router.use(function (req, res, next) {
    Checktoken(req, res, next);
});


router.get("/:services_id", function (req, res) {
    let path = {'path': '/qooservice/system/public/uploadfile/services/'};
    Services.findOne({'_id': req.params.services_id}, function (err, servicesinfo) {
        if (err) {
            res.send({'res': false, 'value': ''});
        }else
        res.send({'value': servicesinfo, 'path': path});
    });
});

module.exports = router;