const express = require('express');
const router = express.Router();
const FindEmail = require("../models/findemail");
const Providers = require('../models/provider');


//~ var passwordHash = require('password-hash');
var passwordHash = require("node-php-password");


//add a new to the db
router.post('/AccountChangePassword', function (req, res, next) {
    //check account on service provider
    FindEmail(req.body.email).then((account) => {
        if (account) {
            if (passwordHash.verify(req.body.p_old_password, account.password)) {
                var hashedPassword = passwordHash.hash(req.body.p_new_password);
                Providers.update({'email': req.body.p_email}, {$set: {'password': hashedPassword}}, function (err, account) {
                    if (err) {
                        res.json({"response": false});
                    } else {
                        res.json({"response": true});
                    }
                });
            }
            else {
                res.json({"response": false});
            }
        } else {
            res.json({"response": false});
        }
    }, err => {
        res.json({"response": false});
    }).catch(next);

});

module.exports = router;
