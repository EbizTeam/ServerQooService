const express = require('express');
const router = express.Router();
const Autions = require('../models/autions');
const Checktoken = require('../models/checktoken');
const FindPSAuction = require('../models/findprovidersendautionfollowid');
const Providersendaution = require('../models/providersendaution');
const Createaution = require('../models/createaution');
const Findauctionfollowid = require('../models/findauctionfollowid');

const Provider = require('../models/serviceproviderdata');
const Wallet = require('../models/wallet');

let FindProvicer = (id) =>{
    return new Promise((resolve, reject) => {
        Provider.findOne({
            '_id': id
        }, function (err, provider) {
            if (err) return reject(new Error('loi tim id: ' + id));
            resolve(provider);
        });
    });
}

let FindWallet = (user_id) => {
    return new Promise((resolve, reject) => {
        Wallet.findOne({
            'user_id': user_id
        }, function (err, wl) {
            if (err) return reject(new Error('loi tim id: ' + user_id));
            resolve(wl);
        });
    });
}

let UpdateWallet = (userID, balance) => {
    return new Promise((resolve, reject) => {
        let myquery = {
            user_id: userID
        };

        let newvalues = {
            $set: {
                balance: balance
            }
        };
        Wallet.updateOne(myquery, newvalues, function (err, res) {
            if (err) return reject(new Error('UpdateWallet: ' + balance));
            console.log(res);
            resolve(res);
        });
    });
}


// router.use(function (req, res, next) {
//     Checktoken(req, res, next);
// });

let CreateRequiment = (obj , res) =>{
    //Add New
    new_provider_auction = new Providersendaution({
        provider_id: obj.provider_id,
        auction_id: obj.auction_id,
        status: "Sent Auction",
        from_price: obj.from_price,
        to_price: obj.to_price,
        create_at: Date.now()
    });

    Createaution(new_provider_auction)
        .then(
            new_provider_auction =>{
                if (new_provider_auction) {
                    Findauctionfollowid(obj.auction_id)
                        .then(
                            aution=>{
                                if (aution){
                                    var num_order_list = aution.num_of_order_list;
                                    num_order_list++;
                                    Autions.update({'_id': obj.auction_id}, {$set: {num_of_order_list: num_order_list}}, {upsert: false}, function (err, acc) {
                                        if (err) {
                                            res.json({"response": false});
                                        }
                                        else {
                                            res.json({
                                                "response": true,
                                                "value": new_provider_auction
                                            });
                                        }
                                    });
                                }
                            }
                            ,err => {
                                res.json({"response": false});
                            }
                        )
                }
            },
            err=>{
                res.json({"response": false});
            }
        );

}

//add a new to the db
router.post('/', function (req, res) {
    FindProvicer(req.body.provider_id)
        .then(
            provider =>{
                if (provider){
                    if (provider.member_ship > 1){
                        CreateRequiment(req.body, res);
                    } else{
                        FindWallet(req.body.provider_id)
                            .then(
                                wallet => {
                                    if (wallet) {
                                        if (wallet.balance >= 5) {
                                            let temp = wallet.balance - 5;
                                            UpdateWallet(req.body.provider_id, temp).then(
                                                wal => {
                                                    console.log(wal);
                                                    if (wal) {
                                                        CreateRequiment(req.body, res);
                                                    } else {
                                                        res.json({
                                                            "response": false,
                                                            "message": wal
                                                        });
                                                    }
                                                }
                                            );
                                        } else {
                                            res.json({
                                                "response": false,
                                                "message": wallet
                                            });
                                        }
                                    } else {
                                        res.json({
                                            "response": false,
                                            "message": "wallet not exits"
                                        });
                                    }
                                },
                                err => {
                                    res.json({
                                        "response": false,
                                        "message": err
                                    });
                                }
                            );
                    }
                } else{
                    res.json({
                        "response": false,
                        "message":err
                    });
                }
            }
            ,err => {
                res.json({
                    "response": false,
                    "message":err
                });
            }
        );


});

module.exports = router;
