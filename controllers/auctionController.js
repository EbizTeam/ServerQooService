'use strict';
const Auctions = require('../models/providersendaution');
const requiriment = require('../controllers/requirementController');
const admin = require('../controllers/adminController');
const provider = require('../controllers/providerController');
const config = require('../config');
const SendMail = require('../controllers/sendMailController');
const Wallet = require('../controllers/walletController');
const History = require('../controllers/historyPaymentController');
//save Auctions
let createAuctions = (obj) => {
    return new Promise((resolve, reject) => {
        obj.save(function (err, app) {
            if (err) return reject(err);
            resolve(app);
        })
    });
};

let CountProviderAuction = (auction_id) => {
    return new Promise((resolve, reject) => {
        Auctions.find({
            "auction_id": auction_id
        }, function (err, proderauction) {
            if (err) return reject(err);
            resolve(proderauction.length);
        });
    });
}

let updateNumOrderList = (obj) => {
    return new Promise((resolve, reject) => {
        CountProviderAuction(obj.auction_id)
            .then(num => {
                    requiriment.updateRequirimentID(obj.auction_id, {num_of_order_list: num})
                        .then(
                            requiriment => {
                                resolve(requiriment);
                            }, err => {
                                return reject(err);
                            });
                }
                , err => {
                    return reject(err);
                }
            );
    })
}

let Err = [];
Err.push("1. update wallet success, create auctions fail");
Err.push("2. update wallet fail");
Err.push("3. Not enough money");
Err.push("4. Not find provider");
exports.serivce_provider_send_auction = function (req, res) {
    // tìm giá
    admin.findOnePriceID(req.body.price_id)
        .then(mprice => {
            //console.log(mprice);
            let {Price, date, Name} = mprice;
            provider.GetOneProvider(req.body.provider_id)
                .then(svprovider => {
                    if (svprovider.member_ship > 1) {
                        // insert story history payment
                        History.insert_new_history_paymeny({
                            user_id: req.body.provider_id,
                            payment: 0,
                            content_service: `${Name} pay 0 Chips uses ${date}  day`,
                        });
                        //insert data appoint
                        let newApp = new Auctions(req.body);
                        createAuctions(newApp)
                            .then(app => {
                                    if (app) {
                                        let data = {
                                            idProvider: req.body.provider_id + "",
                                            notifyCreate: 4,
                                        };
                                        SendMail.send_mail(config.url_mail_notify, data);
                                        return res.json({
                                            "response": Object.assign(app),
                                            "value": 0
                                        });
                                    } else {
                                        return res.json({"response": 1, "message": Err});
                                    }
                                },
                                err => {
                                    return res.json({"response": 1, "message": Err});
                                }
                            );
                    } else {
                        Wallet.find_wallet_user_id(req.body.provider_id)
                            .then(
                                wallet => {
                                    // console.log(wallet.balance, Price);
                                    if (wallet) {
                                        if (wallet.balance >= Price) {
                                            Wallet.update_wallet_user_id({
                                                user_id: req.body.provider_id,
                                                balance: wallet.balance - Price
                                            }).then(wal => {
                                                    if (wal) {
                                                        // insert story history payment
                                                        History.insert_new_history_paymeny({
                                                            user_id: req.body.provider_id,
                                                            payment: Price,
                                                            content_service: `${Name} pay ${Price} Chips uses ${date}  day`,
                                                        });
                                                        //insert data appoint
                                                        let newApp = new Auctions(req.body);
                                                        createAuctions(newApp)
                                                            .then(app => {
                                                                    if (app) {
                                                                        let data = {
                                                                            idProvider: req.body.provider_id + "",
                                                                            notifyCreate: 4,
                                                                        };
                                                                        SendMail.send_mail(config.url_mail_notify, data);
                                                                        return res.json({
                                                                            "response": Object.assign(JSON.parse(JSON.stringify(app)), JSON.parse(JSON.stringify(wal))),
                                                                            "value": 0
                                                                        });
                                                                    } else {
                                                                        return res.json({"response": 1, "message": Err});
                                                                    }
                                                                },
                                                                err => {
                                                                    return res.json({"response": 1, "message": Err});
                                                                }
                                                            );
                                                    }
                                                    else {
                                                        res.json({
                                                            "response": Err,
                                                            "value": 2
                                                        });
                                                    }
                                                },
                                                err => {
                                                    res.json({
                                                        "response": Err,
                                                        "value": 2
                                                    });
                                                }
                                            );
                                        } else {
                                            res.json({
                                                "response": Err,
                                                "value": 3
                                            });
                                        }
                                    } else {
                                        res.json({
                                            "response": Err,
                                            "value": 3
                                        });
                                    }
                                },
                                err => {
                                    res.json({
                                        "response": Err,
                                        "value": 3
                                    });
                                }
                            );
                    }
                }, err => {

                });
        }, err => {
            return res.json({
                "response": 4,
                "message": Err,
            });
        });
};


