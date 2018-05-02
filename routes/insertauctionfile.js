const express = require('express');
const router = express.Router();
const Auctions = require('../models/autions');
const Createaution = require('../models/createaution');
const Wallet = require('../models/wallet');
var multer = require('multer');

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

const config = require('../config');


//add a new to the db
router.post('/', function (req, res) {
    var storage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, cb) {
            cb(null, config.APath + '/asset/auction_file/');
        },
        filename: function (req, file, cb) {
            cb(null, file.fieldname + '-' + Date.now() + '.txt');
        }
    });

    var upload = multer({ //multer settings
        storage: storage
    }).single('AuctionFile');

    upload(req, res, function (err) {
        if (err) {
            // An error occurred when uploading
            res.json({
                "response": false,
                "message": err
            });
        }
        else {
            FindWallet(req.body.customer_id)
                .then(
                    wallet => {
                        if (wallet) {
                            if (wallet.balance >= 5) {
                                let temp = wallet.balance - 5;
                                UpdateWallet(req.body.customer_id, temp)
                                    .then(
                                        wal => {
                                            console.log(wal);
                                            if (wal) {
                                                //Add to Auction
                                                new_auction = new Auctions({
                                                    customer_id: req.body.customer_id,
                                                    category_id: req.body.category_id,
                                                    sub_category_id: req.body.sub_category_id,
                                                    status: req.body.status,
                                                    time_auction: req.body.time_auction,
                                                    num_of_order_list: 0,
                                                    user_deleted: "",
                                                    link_file: "auction_file/" + req.file.filename,
                                                    create_at: Date.now(),
                                                });

                                                Createaution(new_auction)
                                                    .then(auction => {
                                                        if (auction) {
                                                            res.json({
                                                                "response": true,
                                                                "value": auction
                                                            });
                                                        } else {
                                                            res.json({
                                                                "response": false,
                                                                "message": auction
                                                            });
                                                        }
                                                    }, err => {
                                                        res.json({
                                                            "response": false,
                                                            "message": err
                                                        });
                                                    });
                                            }
                                            else {
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
                        console.log(err);
                        res.json({
                            "response": false,
                            "message": err
                        });
                    }
                );
        }
    });

});


module.exports = router;
