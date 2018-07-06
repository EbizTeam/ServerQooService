'use strict';
const price = require('../models/classified_ads_displays');
const classified = require('../models/servicesbuytop');
const config = require('../config');
const SendMail = require('../controllers/sendMailController');
const Wallet = require('../controllers/walletController');
const History = require('../controllers/historyPaymentController');

let FindAllPrice = () => {
    return new Promise((resolve, reject) => {
        price.find({}, function (err, prices) {
            if (err) return reject(err);
            resolve(prices);
        });
    });
};
let FindOnePrice = (id) => {
    return new Promise((resolve, reject) => {
        price.findOne({_id: id}, function (err, prices) {
            if (err) return reject(err);
            resolve(prices);
        });
    });
};
exports.get_classified_price = function (req, res) {
    FindAllPrice()
        .then(
            price => {
                if (price) {
                    return res.json({"value": price, "response": true});
                } else {
                    return res.json({"value": [], "response": false});
                }
            },
            err => {
                return res.json({"value": err, "response": false});
            }
        );
};
//create classified buy ads
let createClassified = (obj) => {
    return new Promise((resolve, reject) => {
        let newClass = new classified(obj);
        newClass.save(function (err, rs) {
            if (err) return reject(err);
            resolve(rs);
        });
    });
};
let Err = [];
Err.push("1. update wallet success, create data buy Classified Ads fail");
Err.push("2. update wallet fail");
Err.push("3. Not enough money");
let dat = new Date();
Date.prototype.addDays = function (days) {
    let dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
};
exports.insert_classified_ads = function (req, res) {
    FindOnePrice(req.body.ads_id)
        .then(
            adsprice => {
                console.log(adsprice);
                let {price, date, name} = adsprice;
                Wallet.find_wallet_user_id(req.body.provider_id)
                    .then(
                        wallet => {
                            console.log(wallet.balance, price);
                            if (wallet) {
                                if (wallet.balance >= price) {
                                    Wallet.update_wallet_user_id({
                                        user_id: req.body.provider_id,
                                        balance: wallet.balance - price
                                    }).then(
                                        wal => {
                                            if (wal) {
                                                // insert story history payment buy Classified ads
                                                History.insert_new_history_paymeny({
                                                    user_id: req.body.provider_id,
                                                    payment: price,
                                                    content_service: name + ` ${price}/${date}`,
                                                });
                                                //insert data Classified
                                                createClassified({
                                                    service_id: req.body.service_id,
                                                    provider_id: req.body.provider_id,
                                                    create_end: dat.addDays(date).getTime()
                                                })
                                                    .then(
                                                        classified => {
                                                            if (classified) {
                                                                //let url = "/qooservice/php/api_mail_notifyCreate.php";
                                                                let data = {
                                                                    idProvider: req.body.provider_id + "",
                                                                    //notifyCreate: 1,//Banner
                                                                    //notifyCreate:2,//slide
                                                                    notifyCreate:3,//service
                                                                };
                                                                SendMail.send_mail(config.url_mail_notify, data);
                                                                res.json({
                                                                    "response": Object.assign(JSON.parse(JSON.stringify(wal)),JSON.parse(JSON.stringify(classified))),
                                                                    "value": 0
                                                                });
                                                            } else {
                                                                res.json({
                                                                    "response": Err,
                                                                    "value": 1
                                                                });
                                                            }
                                                        },
                                                        err => {
                                                            res.json({
                                                                "response": Err,
                                                                "value": 1
                                                            });
                                                        });
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
            },
            err => {
                res.json({
                    "response": Err,
                    "value": 3
                });
            }
        );
};
