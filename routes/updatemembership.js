const express = require('express');
const router = express.Router();
const Provider = require("../models/useraccount");

router.use( function (req, res, next) {
    Checktoken(req, res, next);
});

//add a new to the db
router.post('/', function (req, res, next) {
    var s_email = req.body.email;
    var s_type = req.body.member_ship;
    Provider.update({'email': s_email}, {$set: {member_ship: s_type}}, {upsert: false}, function (err, acc) {
        if (err) {
            res.json({"response": false});
        }
        else {
            res.json({"response": true});
        }
    }).catch(next);
});

module.exports = router;
