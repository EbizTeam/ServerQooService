'use strict';
const Wallet = require('../models/wallet');
const Consumer = require('../models/customerdata');
const Admin = require('../models/admin');
const Provider = require('../models/serviceproviderdata');
const Async = require("async");
const sortBy = require('array-sort');
const Historypayment = require('../models/historypayment');


let findConsumerUseWallet = () => {
    return new Promise((resolve, reject) => {
        let AllWallet = [];
        Wallet.find({}, function (err, wallets) {
            if (err) return reject(err);
            Async.forEachOf(wallets, function (item, key, callback) {
                Consumer.findOne({"_id": item.user_id}, function (err, user) {
                    if (err) return callback(err);
                    if (user) {
                        AllWallet.push(Object.assign(JSON.parse(JSON.stringify(item)), {
                            have: 1
                        }));
                    } else {
                        AllWallet.push(Object.assign(JSON.parse(JSON.stringify(item)), {
                            have: 0
                        }));
                    }
                    callback();
                });
            }, function (err) {
                if (err) reject(err);
                // configs is now a map of JSON data
                resolve(AllWallet);
            });
        });
    });
}

let findProviderUseWallet = (wallets) => {
    return new Promise((resolve, reject) => {
        let AllWallet = [];
        Async.forEachOf(wallets, function (item, key, callback) {
            Consumer.findOne({"_id": item.user_id}, function (err, user) {
                if (err) return callback(err);
                if (user) {
                    item.have = 1;
                    AllWallet.push(item);
                } else {
                    item.have = 0;
                    AllWallet.push(item);
                }
                callback();
            });
        }, function (err) {
            if (err) reject(err);
            // configs is now a map of JSON data
            resolve(AllWallet);
        });

    });
}

let DeleteWalletNotFoundUser = () => {
    return new Promise((resolve, reject) => {
            findConsumerUseWallet()
                .then(
                    walletsCon => {
                        findProviderUseWallet(walletsCon)
                            .then(
                                walletsAll => {
                                    let AllDelete;
                                    Async.forEachOf(walletsAll, function (item, key, callback) {
                                        if (item.have === 0) {
                                            Wallet.remove({_id: item._id}, function (err, obj) {
                                                AllDelete += obj.result.n;
                                                callback();
                                            });
                                        }else{
                                            callback();
                                        }

                                }, function (err) {
                                    if (err) reject(err);
                                    // configs is now a map of JSON data
                                    resolve(AllDelete);
                                });
                    },
                    err => {
                        console.log(err);
                    }
                );
        },
        err => {
            console.log(err);
        }
    );
}
)
;
}


exports.delete_wallet_trash = function (req, res) {
    DeleteWalletNotFoundUser()
        .then(
            serSor => {
                return res.json({"response": serSor, "value": true});
            },
            err => {
                return res.json({"response": err, "value": false});
            }
        );
};


//update balance in my wallet
//App.post("/update_balance",

let FindAdmin = () => {
    return new Promise((resolve, reject) => {
        Admin.findOne({
          }, function (err, wl) {
            if (err) return reject(err);
            resolve(wl);
        });
    });
}

exports.update_wallet = function (req, res){
    if (req.body.balance === undefined || req.body.sp_id === undefined) {
        res.json({"response": false, message:" params not value "});
    } else {
        var sp_id = req.body.sp_id;
        var balance = parseFloat(req.body.balance);
        Wallet.findOne({"user_id": sp_id}, function (err, mywallet_info) {
            if (err) return   res.json({"response": false,  message:err});
            if (mywallet_info) {
                FindAdmin()
                    .then(
                        admin => {
                            if (admin) {
                                var tt_balance = mywallet_info.balance;
                                Wallet.findOneAndUpdate({'user_id': sp_id}, {
                                    balance: tt_balance+balance*admin.rateMoney,
                                    updated_at:Date.now(),
                                }, {new: true}, function (err, wlupdated) {
                                    if (err) return   res.json({"response": false,  message:err});
                                    if (wlupdated) {
                                        Historypayment.create({
                                            payment: balance,
                                            user_id: sp_id,
                                            create_at: Date.now(),
                                            content_service:"added " +balance*admin.rateMoney+ " "+admin.displayCurentcy +" into Wallet",
                                        }, function (err, htr) {
                                            if (err) console.log(err);
                                            else console.log(htr);
                                        });
                                        return   res.json({"response": true, MWObj:wlupdated,  message:""});
                                    } else {

                                    }
                                });
                            }else{
                                return   res.json({"response": false,  message:"loi tim rate money"});
                            }
                        },
                        err=>{return   res.json({"response": false,  message:err}); }
                    )

            }else{
                CreateWallet(sp_id,balance)
                    .then(
                        wl => {
                            res.json({"response": true, MWObj:wl,  message:""});
                        },
                        err=>{return   res.json({"response": false,  message:err});}
                    );
            }
        });
    }
}

let CreateWallet = (providerID, balance) => {
    return new Promise((resolve, reject) => {
        Wallet.create({
            user_id: providerID,
            balance: balance
        }, function (err, wl) {
            if (err) return reject(err);
            resolve(wl);
        });
    });
}



exports.get_wallet = function (req, res){
    Wallet.findOne({
        'user_id': req.params.user_id
    }, function (err, wl) {
        if (err) res.json({ "value": false,"response": err});
        if (wl) {
            res.json({ "value": true,
                "response": wl.balance});
        } else
            CreateWallet( req.params.user_id,0)
                .then(
                    wlcre => {
                        res.json({ "value": true,
                            "response": wlcre.balance});
                    },
                    err=>{return   res.json({ "value": false,"response": err});}
                );

    });
}

