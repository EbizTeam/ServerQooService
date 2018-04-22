const express = require('express');
const router = express.Router();

var FindEmail = require("../models/finduserfollowemail");
var CreateNewUser = require("../models/createcustomer");
var CreateNewWallet = require("../models/createwallet");
var SendMailRegister = require("../models/sendmailregister");


//add a new to the db
router.post('/', function (req, res, next) {
    FindEmail(req.body.email).then((email) => {
        if (email) {
            res.json({"response": false});
        } else {
            CreateNewUser(req.body).then((user) => {
                if (user) {
                    CreateNewWallet(user._id, 0).then((wallet) => {
                        //console.log(wallet);

                    }, err => {
                        console.log(err);
                    });

                    //SEND MAIL HERE
                    SendMailRegister(req.body).then((mail) => {

                        //console.log(mail);
                    }, err => {
                        console.log(err);
                    });

                    res.json({
                        "response": true,
                        "provider_id": user._id
                    });
                } else {
                    res.json({"response": false});
                }
            }, err => {
                res.json({"response": false});
            }).catch(next);
        }
    }, err => {
        res.json({"response": false});
    }).catch(next);

});

module.exports = router;
