const express = require('express');
const router = express.Router();
const FindEmail = require("../models/findemail");
const Providers = require('../models/provider');
const Spscategory = require('../models/spscategory');
const spspayment = require('../models/payments');
const wallet = require('../models/wallet');

//~ var passwordHash = require('password-hash');
var passwordHash = require("node-php-password");


//add a new to the db
router.post('/AccountLogin', function (req, res, next) {
    //check account on service provider
    pathavatar = '/qooservice/system/public/uploadfile/avatar/';

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
                            res.json({"response": account, "pathavatar": pathavatar});
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


                            wallet.findOne({"user_id": account._id}, function (err, mw) {
                                res.json({
                                    "response": account,
                                    "pathavatar": pathavatar,
                                    'Category': category,
                                    'PaymentType': PaymentType,
                                    "MyWallet": mw
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
