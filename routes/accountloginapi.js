const express = require('express');
const router = express.Router();
const FindEmail = require("../models/finduserfollowemail");
const Providers = require('../models/useraccount');
const Spscategory = require('../models/spscategory');
const spspayment = require('../models/payments');
const wallet = require('../models/wallet');
const config = require('../config');
const jwt = require('jsonwebtoken');

//~ var passwordHash = require('password-hash');
var passwordHash = require("node-php-password");


//add a new to the db
router.post('/', function (req, res, next) {
    //check account on service provider
    pathavatar = config.pathavatar;

    FindEmail(req.body.email).then((account) => {
        if (account) {
            var check = passwordHash.verify(req.body.password, account.password);
            if (check) {

                // res.json({"response": cusaccount[0], "pathavatar": pathavatar});
                // UPDATE DEVICE TOKEN.
                Providers.update({'email': req.body.email}, {$set: {'device_token': req.body.device_token}}, {'isPlatform': req.body.isPlatform}, function (err, memacc) {
                    if (err) {
                        res.json({"response": false});
                    } else {
                        if (account.member_ship === 0) {

                            const payload = {
                                member_ship: account.member_ship
                            };

                            var token = jwt.sign(payload, config.secret, {
                                //expiresInMinutes: 1440 // expires in 24 hours
                            });

                            // return the information including token as JSON
                            res.json({
                                success: true,
                                "response": account,
                                "pathavatar": pathavatar,
                                token: token
                            });

                        } else {
                            category = 0;
                            PaymentType = 0;
                            Spscategory.findOne({"provider_id": account._id}, function (err, spscate) {
                                if (spscate) {
                                    category = spscate.category_id;
                                }

                            });
                            //console.log(spccount);
                            spspayment.findOne({"provider_id": account._id}, function (err, spspay) {
                                if (spspay) {
                                    PaymentType = spspay.payment_type;
                                }
                            });

                            const payload = {
                                member_ship: account.member_ship
                            };

                            var token = jwt.sign(payload, config.secret, {
                                //expiresInMinutes: 1440 // expires in 24 hours
                            });


                            wallet.findOne({"user_id": account._id}, function (err, mw) {
                                res.json({
                                    success: true,
                                    "response": account,
                                    "pathavatar": pathavatar,
                                    'Category': category,
                                    'PaymentType': PaymentType,
                                    "MyWallet": mw,
                                    token: token
                                });
                            });
                        }
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
