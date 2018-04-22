const express = require('express');
const router = express.Router();
const FindEmail = require("../models/finduserfollowemail");
const Checktoken = require('../models/checktoken');

router.use( function (req, res, next) {
    Checktoken(req, res, next);
});

//add a new to the db
router.post('/', function (req, res, next) {
    FindEmail(req.body.p_email).then((account) => {
        if (account) {
            res.json({ success: true,
                "response": account});
        } else
            res.json({ success: false,"response": ""});

    }, err => {
        res.json({ success: false,"response": ""});
    }).catch(next);
});


// get the use with that id (accessed at GET http://localhost:4000/GetInfoAccount/:email)
router.get('/:email',function(req, res, next) {
    FindEmail(req.params.email).then((account) => {
        if (account) {
            res.json({ success: true,
                "response": account});
        } else
            res.json({ success: false,"response": ""});

    }, err => {
        res.json({ success: false,"response": ""});
    }).catch(next);
});

module.exports = router;
