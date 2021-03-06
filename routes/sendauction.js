const express = require('express');
const router = express.Router();
const Autions = require('../models/autions');
const Providersendaution = require('../models/providersendaution');
const Historypayment = require('../models/historypayment');
const Provider = require('../models/serviceproviderdata');
const manage_service_price = require('../models/manage_service_price');
const Wallet = require('../models/wallet');

let FindProvicer = (id) => {
    return new Promise((resolve, reject) => {
        Provider.findOne({
            '_id': id
        }, function (err, provider) {
            if (err) return reject(new Error('loi tim id: ' + id));
            resolve(provider);
        });
    });
};

let FindWallet = (user_id) => {
    return new Promise((resolve, reject) => {
        Wallet.findOne({
            'user_id': user_id
        }, function (err, wl) {
            if (err) return reject(new Error('loi tim id: ' + user_id));
            resolve(wl);
        });
    });
};

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

let CountProviderAuction = (auction_id) => {
    return new Promise((resolve, reject) => {
        Providersendaution.find({
            "auction_id": auction_id
        }, function (err, proderauction) {
            if (err) return reject(err);
            resolve(proderauction.length);
        });
    });
}


let UpdateAuction = (auction_id, num_order_list) => {
    return new Promise((resolve, reject) => {
        let myquery = {
            '_id': auction_id
        };

        let newvalues = {
            $set: {
                'num_of_order_list': num_order_list,
            }
        };
        Autions.updateOne(myquery, newvalues, function (err, res) {
            if (err) return reject(err);
            resolve(res.ok);
        });
    });
}

let CreateNewAution = (obj) => {
    return new Promise((resolve, reject) => {
        Providersendaution.create({
                provider_id: obj.provider_id,
                auction_id: obj.auction_id,
                status: "Sent Auction",
                from_price: obj.from_price,
                to_price: obj.to_price,
            }, function (err, auction) {
                if (err) return reject(err);
                resolve(auction);
            });
    });
}

let CreateRequiment = (obj, res, balance) => {
    CreateNewAution(obj)
        .then(
            new_provider_auction => {
                if (new_provider_auction) {
                    CountProviderAuction(obj.auction_id)
                        .then(
                            num_order_list => {
                                UpdateAuction(obj.auction_id, num_order_list)
                                    .then(
                                        result => {
                                            if (result === 1) {
                                                res.json({
                                                    "response": true,
                                                    "message": balance,
                                                    "value": new_provider_auction
                                                });
                                            }
                                            else {
                                                res.json({
                                                    "response": false,
                                                    "message": 1,
                                                    "value": "loi update auction"
                                                });
                                            }
                                        }
                                        , err => {
                                            res.json({
                                                "response": false,
                                                "message": 1,
                                                "value": "loi update auction"
                                            });
                                        });
                            }
                            , err => {
                                res.json({
                                    "response": false,
                                    "message": 2,
                                    "value": "loi tim kiem auction"
                                });
                            }
                        );
                }
            },
            err => {
                res.json({
                    "response": false,
                    "message": 3,
                    "value": "loi tao moi provider auction"
                });
            }
        );

}

let find_manage_service_price = () => {
    return new Promise((resolve, reject) => {
        manage_service_price.findOne({
            message: 1
        }, function (err, svtop) {
            if (err) return reject(err);
            resolve(svtop);
        })
    })
}

let find_manage_service_prices = () => {

        manage_service_price.find({

        }, function (err, svtop) {
            if (err) return console.log(err);
            console.log(svtop);
        })

}

//add a new to the db
router.post('/', function (req, res) {

    return  res.json({
        "response": false,
        "message": 1000,
        "value": "loi api khong con su dung nua"
    })

    find_manage_service_price()
        .then(
            svPrice => {
                let {Price,  Name, message} = svPrice;
                FindProvicer(req.body.provider_id)
                    .then(
                        provider => {
                            if (provider) {
                                if (provider.member_ship > 1) {
                                    CreateRequiment(req.body, res, 0);
                                    Historypayment.create({
                                        user_id: req.body.provider_id,
                                        payment: 0,
                                        service: message,
                                        content_service: Name,
                                    }, function (err, htr) {
                                        if (err) console.log(err);
                                        else console.log(htr);
                                    });
                                } else {
                                    FindWallet(req.body.provider_id)
                                        .then(
                                            wallet => {
                                                if (wallet) {
                                                    if (wallet.balance >= Price) {
                                                        let temp = wallet.balance - Price;
                                                        UpdateWallet(req.body.provider_id, temp).then(
                                                            wal => {
                                                                //console.log(wal);
                                                                if (wal) {
                                                                    CreateRequiment(req.body, res, Price);
                                                                    Historypayment.create({
                                                                        user_id: req.body.provider_id,
                                                                        payment: Price,
                                                                        service: message,
                                                                        content_service: Name,
                                                                    }, function (err, htr) {
                                                                        if (err) console.log(err);
                                                                        else console.log(htr);
                                                                    });
                                                                } else {
                                                                    res.json({
                                                                        "response": false,
                                                                        "message": 4,
                                                                        "value": "loi update wallet"
                                                                    });
                                                                }
                                                            }
                                                        );
                                                    } else {
                                                        res.json({
                                                            "response": false,
                                                            "message": 5,
                                                            "value": "loi khong du tien"
                                                        });
                                                    }
                                                } else {
                                                    res.json({
                                                        "response": false,
                                                        "message": 6,
                                                        "value": "wallet khong ton tai"
                                                    });
                                                }
                                            },
                                            err => {
                                                res.json({
                                                    "response": false,
                                                    "message": 6,
                                                    "value": "wallet khong ton tai"
                                                });
                                            }
                                        );
                                }
                            } else {
                                res.json({
                                    "response": false,
                                    "message": 7,
                                    "value": "khong tim thay provider"
                                });
                            }
                        }
                        , err => {
                            res.json({
                                "response": false,
                                "message": 7,
                                "value": "khong tim thay provider"
                            });
                        }
                    );

            },
            err => {
                res.json({
                    "response": [],
                    "value": false
                });
            }
        );
});

module.exports = router;
