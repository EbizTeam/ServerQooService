const express = require('express');
const router = express.Router();
const Checktoken = require('../models/checktoken');
const wallet = require('../models/wallet');
router.use( function (req, res, next) {
    Checktoken(req, res, next);
});

//add a new to the db
router.post('/', function (req, res, next) {
    var sp_id = req.body.sp_id;
    wallet.find({"user_id": sp_id}, function (err, mywallet_info) {

        var balance = 0;
        if (req.body.balance) {
             balance = parseFloat(req.body.balance);
        }

        if(mywallet_info){
            var tt_balance = mywallet_info[0].balance;
            tt_balance += balance;
            wallet.update({'user_id': sp_id}, {$set: {'balance': tt_balance}}, function (err, my_wallet) {
                if (err) {
                    res.json({"response": false});
                }
                else {
                    wallet.findOne({"user_id": sp_id}, function (err, w_info) {
                            res.json({"response": true,
                                "MWObj":w_info});
                    });
                }
            });
        }
    }).catch(next);
});

module.exports = router;
