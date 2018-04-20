const express = require('express');
const router = express.Router();

const wallet = require('../models/wallet');


//add a new to the db
router.post('/update_balance', function (req, res, next) {
    var sp_id = req.body.sp_id;
    var balance = parseFloat(req.body.balance);
    wallet.find({"user_id": sp_id}, function (err, mywallet_info) {
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
