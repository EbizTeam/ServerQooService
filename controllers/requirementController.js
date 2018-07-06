'use strict';
const Auctions = require('../models/autions');
const admin = require('../controllers/adminController');
const multer = require('multer');
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

let updateRequirimentID = (id, obj) => {
    return new Promise((resolve, reject) => {
        Auctions.findOneAndUpdate({_id: id}, obj, {new: true}, function (err, aa) {
            if (err) return reject(err);
            resolve(aa);
        });
    });
};
exports.updateRequirimentID = updateRequirimentID;

const storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, config.APath + '/asset/auction_file/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.txt');
    }
});

const upload = multer({ //multer settings
    storage: storage
}).single('AuctionFile');

let Err = [];
Err.push("1. update wallet success, create auctions fail");
Err.push("2. update wallet fail");
Err.push("3. Not enough money");
Err.push("4. Upload file fail");
Err.push("5. Not find provider");
exports.insert_requiriment_file = function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            // An error occurred when uploading
            return res.json({
                "response": 4,
                "message": Err
            });
        } else {
            admin.findOnePriceID(req.body.price_id)
                .then(mprice => {
                    //console.log(mprice);
                    let {Price, date, Name} = mprice;
                    Wallet.find_wallet_user_id(req.body.customer_id)
                        .then(
                            wallet => {
                                // console.log(wallet.balance, Price);
                                if (wallet) {
                                    if (wallet.balance >= Price) {
                                        Wallet.update_wallet_user_id({
                                            user_id: req.body.customer_id,
                                            balance: wallet.balance - Price
                                        }).then(
                                            wal => {
                                                if (wal) {
                                                    // insert story history payment buy banner ads
                                                    History.insert_new_history_paymeny({
                                                        user_id: req.body.customer_id,
                                                        payment: Price,
                                                        content_service: `${Name} pay ${Price} uses ${date}`,
                                                    });
                                                    //insert data appoint
                                                    let newApp = new Auctions(Object.assign(req.body, {link_file: "auction_file/" + req.file.filename}));
                                                    createAuctions(newApp)
                                                        .then(app => {
                                                                if (app) {
                                                                    let data = {
                                                                        id: req.body.customer_id + "",
                                                                        //notify : 1 , //appointment
                                                                        notify: 2, // requirement
                                                                    };
                                                                    SendMail.send_mail(config.url_mail_notifyop, data);
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
                }, err => {
                    return res.json({
                        "response": 4,
                        "message": err
                    });
                });
        }
    });
};


