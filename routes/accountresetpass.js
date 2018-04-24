const express = require('express');
const router = express.Router();
const FindEmail = require("../models/finduserfollowemail");
const Useraccount = require("../models/useraccount");
const Checktoken = require('../models/checktoken');

router.use( function (req, res, next) {
    Checktoken(req, res, next);
});

//~ var passwordHash = require('password-hash');
var passwordHash = require("node-php-password");



//add a new to the db
router.post("/", function (req, res) {
    var email = req.body.email;
    var new_password = req.body.new_password;
    FindEmail()
        .then(
            user =>{
                if (user) {
                    var hashedPassword = passwordHash.hash(new_password);
                    Useraccount.update({'email': email}, {$set: {'password': hashedPassword}}, function (err, cusaccount) {
                        if (err) {
                            res.json({"response": false});
                        } else {
                            if (cusaccount)
                            res.json({"response": true});
                            else
                                res.json({"response": false});
                        }
                    });
                }
                else {
                    res.json({"response": false});
                }
            },
            err => {
                res.json({"response": false});
            }
        );


});

module.exports = router;
