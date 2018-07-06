'use strict';
const adsPrice = require('../models/full_page_ads_mobiles');
const ads = require('../models/ServiceProviderBuyAdvertiseData');
const config = require('../config');
const SendMail = require('../controllers/sendMailController');
const Wallet = require('../controllers/walletController');
const History = require('../controllers/historyPaymentController');
const multer = require('multer');
const path = require('path');
//upload file
let Storage = multer.diskStorage({
    destination: config.APath + '/asset/advertise/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() +
            path.extname(file.originalname));
    }
});
let upload = multer({
    storage: Storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.png'
            && ext !== '.jpg'
            && ext !== '.jpeg'
        ) {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    },
    limits: {
        fileSize: 6000000
    }
}).single('imageadvertise'); //Field name and max count
let FindBannerPrice = () => {
    return new Promise((resolve, reject) => {
        adsPrice.find({}, function (err, price) {
            if (err) return reject(err);
            resolve(price);
        });
    });
};
let FindOnePrice = (id) => {
    return new Promise((resolve, reject) => {
        adsPrice.findOne({_id: id}, function (err, price) {
            if (err) return reject(err);
            resolve(price);
        });
    });
};
exports.get_full_page_price = function (req, res) {
    FindBannerPrice()
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
//create banner buy ads
let createBanner = (obj) => {
    return new Promise((resolve, reject) => {
        let banner = new ads(obj);
        banner.save(function (err, rs) {
            if (err) return reject(err);
            resolve(rs);
        });
    });
};
let Err = [];
Err.push("1. update wallet success, create data buy full page ads fail");
Err.push("2. update wallet fail");
Err.push("3. Not enough money");
Err.push("4. Upload Image full page ads fail");
exports.insert_full_page_ads = function (req, res) {
    console.log(req);
    upload(req, res, function (err) {
        if (err) {
            return res.json({"response": Err, "value": 4});
        }
        else {
            FindOnePrice(req.body.ads_id)
                .then(
                    adsprice => {
                        console.log(adsprice);
                        let {price, date, name} = adsprice;
                        Wallet.find_wallet_user_id(req.body.provider_id)
                            .then(
                                wallet => {
                                    console.log(wallet.balance,price);
                                    if (wallet) {
                                        if (wallet.balance >= price) {
                                            Wallet.update_wallet_user_id({
                                                user_id: req.body.provider_id,
                                                balance: wallet.balance - price
                                            }).then(
                                                wal => {
                                                    if (wal) {
                                                        // insert story history payment buy banner ads
                                                        History.insert_new_history_paymeny({
                                                            user_id: req.body.provider_id,
                                                            payment: price,
                                                            content_service: name + ` ${price}/${date}`,
                                                        });
                                                        //insert data banner
                                                        createBanner({
                                                            provider_id: req.body.provider_id,
                                                            ads_id: req.body.ads_id,
                                                            link_banner: '/advertise/' + req.file.filename,
                                                        })
                                                            .then(
                                                                banner => {
                                                                    if (banner) {
                                                                        banner.isActived = undefined;
                                                                        //let url = "/qooservice/php/api_mail_notifyCreate.php";
                                                                        let data = {
                                                                            idProvider: req.body.provider_id + "",
                                                                            //notifyCreate: 1,//Banner
                                                                            notifyCreate:2,//slide
                                                                            //notifyCreate:3,//service
                                                                        };
                                                                        SendMail.send_mail(config.url_mail_notify, data);
                                                                        res.json({
                                                                            "response": Object.assign(JSON.parse(JSON.stringify(wal)),JSON.parse(JSON.stringify(banner))),
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
        }
    });
};
