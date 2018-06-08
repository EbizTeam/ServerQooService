const express = require('express');
const router = express.Router();
const Providersendaution = require('../models/providersendaution');
const Provider = require('../models/serviceproviderdata');
const ChatUsers = require('../models/userchat');
const Async = require("async");
const Autions = require('../models/autions');
const Consumer = require('../models/customerdata');


let FindProvider = (provider_id) => {
    return new Promise((resolve, reject) => {
        Provider.findOne({"_id": provider_id}, function (err, provider) {
            if (err) reject(err);
            resolve(provider);
        });
    });
}

let FindProviderOnline = (provider_id) => {
    return new Promise((resolve, reject) => {
        ChatUsers.findOne({"userID": provider_id}, function (err, online) {
            if (err) reject(err);
            if (online) {
                resolve(1);
            } else {
                resolve(0);
            }
        });
    });
}

//add a new to the db
router.get("/:auction_id", function (req, res) {
    let data = [];
    Providersendaution.find({
        auction_id: req.params.auction_id,
        status: {$not: /Decline/},
    }, function (err, providerauction) {
        if (err) {
            res.json({
                "response": false,
                "value": err
            });
        } else if (providerauction) {
            Async.forEachOf(providerauction, function (item, key, callback) {
                FindProvider(item.provider_id)
                    .then(
                        provider => {
                            FindProviderOnline(provider._id)
                                .then(
                                    online => {
                                        if (online === 1) {
                                            data.push({
                                                "_id": item._id,
                                                "auction_id": item.auction_id,
                                                "from_price": item.from_price,
                                                "provider_id": item.provider_id,
                                                "status": item.status,
                                                "to_price": item.to_price,
                                                "_id_provider": provider._id,
                                                "firstname": provider.firstname,
                                                "lastname": provider.lastname,
                                                "company_name": provider.company_name,
                                                "no_of_hight_recommended": provider.no_of_hight_recommended,
                                                "no_of_neutral": provider.no_of_neutral,
                                                "no_of_not_recommended": provider.no_of_not_recommended,
                                                "no_of_recommended": provider.no_of_recommended,
                                                "onlline_status": 1
                                            });
                                        } else {
                                            data.push({
                                                "_id": item._id,
                                                "auction_id": item.auction_id,
                                                "from_price": item.from_price,
                                                "provider_id": item.provider_id,
                                                "status": item.status,
                                                "to_price": item.to_price,
                                                "_id_provider": provider._id,
                                                "firstname": provider.firstname,
                                                "lastname": provider.lastname,
                                                "company_name": provider.company_name,
                                                "no_of_hight_recommended": provider.no_of_hight_recommended,
                                                "no_of_neutral": provider.no_of_neutral,
                                                "no_of_not_recommended": provider.no_of_not_recommended,
                                                "no_of_recommended": provider.no_of_recommended,
                                                "onlline_status": 2
                                            });
                                        }
                                        callback();
                                    }
                                    , err => {
                                        callback(err);
                                    }
                                )
                        }
                        , err => {
                            callback(err);
                        }
                    );

            }, function (err) {
                if (err) {
                    res.json({
                        "response": false,
                        "value": err
                    });
                }
                res.json({
                    "response": true,
                    "value": data
                });
            });

        } else {
            res.json({
                "response": false,
                "value": "not find with auction id: " + req.params.auction_id
            });
        }
    });
});


let FindOneProviderAuction = (_id) => {
    return new Promise((resolve, reject) => {
        Providersendaution.findOne({"_id": _id}, function (err, providerAuction) {
            if (err) reject(err);
            resolve(providerAuction);
        });
    });
}

let FindProviderAuction = (auction_id) => {
    return new Promise((resolve, reject) => {
        Providersendaution.find({
            "auction_id": auction_id,
            "status": "Sent Auction",
        }, function (err, providerAuctions) {
            if (err) reject(err);
            resolve(providerAuctions);
        });
    });
}

let UpdateProviderAuction = (_id, status) => {
    return new Promise((resolve, reject) => {
        let myquery = {
            "_id": _id,
        };

        let newvalues = {
            $set: {
                status: status
            }
        };
        Providersendaution.updateOne(myquery, newvalues, function (err, res) {
            if (err) return reject(err);
            resolve(res.ok);
        });

    });
}

let CountProviderAuction = (auction_id) => {
    return new Promise((resolve, reject) => {
        Providersendaution.find({
            "auction_id": auction_id,
            status: {$not: /Decline/},
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

let updateNumberlist = (auction_id) => {
    CountProviderAuction(auction_id)
        .then(
            num_order_list => {
                UpdateAuction(auction_id, num_order_list)
                    .then(
                        result => {

                        }
                        , err => {
                            console.log(err);
                        });
            }
            , err => {

                console.log(err);

            }
        );
}

router.post('/change_status_provider_list', function (req, res) {
    let id = req.body.id;
    let status = req.body.status;
    //1 decline
    // 2 Approve
    if (status == 2) {
        UpdateProviderAuction(id, "Approve")
            .then(
                ressult => {
                    if (ressult == 1) {
                        FindOneProviderAuction(id)
                            .then(
                                providerauction => {
                                    if (providerauction) {
                                        FindProviderAuction(providerauction.auction_id)
                                            .then(
                                                proauctions => {
                                                    if (proauctions.length > 0) {
                                                        for (let k in proauctions) {
                                                            UpdateProviderAuction(proauctions[k]._id, "Decline")
                                                                .then(
                                                                    ressult => {
                                                                        console.log(ressult);
                                                                        updateNumberlist(providerauction.auction_id);
                                                                    },
                                                                    err => {
                                                                        console.log(err);
                                                                    }
                                                                );
                                                        }
                                                    }
                                                }
                                            );
                                        res.json({
                                            "response": true,
                                            "value": providerauction
                                        });
                                    }

                                },
                                err => {
                                    res.json({
                                        "response": false,
                                        "value": err
                                    });
                                }
                            );
                    } else {
                        res.json({
                            "response": false,
                            "value": "update fail"
                        });
                    }
                },
                err => {
                    res.json({
                        "response": false,
                        "value": err
                    });
                }
            );
    } else {
        UpdateProviderAuction(id, "Decline")
            .then(
                ressult => {
                    if (ressult == 1) {
                        FindOneProviderAuction(id)
                            .then(
                                providerauction => {
                                    if (providerauction) {
                                        updateNumberlist(providerauction.auction_id);
                                        console.log("updateNumberlist"+providerauction.auction_id);
                                        res.json({
                                            "response": true,
                                            "value": providerauction
                                        });

                                    }
                                },
                                err => {
                                    res.json({
                                        "response": false,
                                        "value": err
                                    });
                                }
                            );

                    } else {
                        res.json({
                            "response": false,
                            "value": "update fail"
                        });
                    }

                },
                err => {
                    res.json({
                        "response": false,
                        "value": err
                    });
                }
            );
    }
});

let FindConsumer  = (uerID) => {
    return new Promise((resolve, reject) => {
        Consumer.findOne({"_id": uerID}, function (err, consumer) {
            if (err) reject(err);
            resolve(consumer);
        });
    });
}


let FindAuction  = (auction_id) => {
    return new Promise((resolve, reject) => {
        Autions.findOne({"_id": auction_id}, function (err, auction) {
            if (err) reject(err);
            resolve(auction);
        });
    });
}


let FindUserAuction  = (auction_id) => {
    return new Promise((resolve, reject) => {
        FindAuction(auction_id)
        .then(
            auction =>{
                if(auction){
                    FindConsumer(auction.customer_id)
                    .then(
                        consumer =>{
                            if(consumer){
                                resolve({
                                    link_file: auction.link_file,
                                    auction: auction,
                                    sub_category_id: auction.sub_category_id,
                                    "consumer_info":consumer,
                                    "category_id": auction.category_id,
                                })
                            }else{
                                resolve({
                                    link_file: auction.link_file,
                                    auction: auction,
                                    sub_category_id: auction.sub_category_id,
                                    "consumer_info":{},
                                    "category_id": auction.category_id,
                                })
                            }

                        }
                        ,err=>{
                            reject(err);
                        }
                    );
                }else{
                    reject(new Error("khong tim thay auction"));
                }
            }
            ,err => {
                reject(err);
            }
        );
    });
}



//provider get provider auction
router.get("/get_provider_send_auction/:provider_id", function (req, res) {
    Providersendaution.find({
        provider_id: req.params.provider_id,
       // status: {$not: /Sent Auction/},
    }, function (err, providerauction) {
        if (err) {
            res.json({
                "response": false,
                "value": err
            });
        } else if (providerauction) {
            let proOder =[];
            console.log(providerauction);
            Async.forEachOf(providerauction, function (item, key, callback) {
                //console.log(item);
                FindUserAuction(item.auction_id)
                .then(
                    Cateauction => {
                        proOder.push({
                            link_file: Cateauction.link_file,
                            sub_category_id: Cateauction.sub_category_id,
                            "consumer_info": Cateauction.consumer_info,
                            "auction": Cateauction.auction,
                            "category_id": Cateauction.category_id,
                           "_id":item._id,
                            "provider_id": item.provider_id,
                            "auction_id": item.auction_id,
                            "status": item.status,
                            "from_price": item.from_price,
                            "to_price": item.to_price,
                            "create_at": item.create_at
                        });
                        callback();
                    }
                    ,err =>{
                        callback(err);
                    }
                );
            }, function (err) {
                if (err) {
                    res.json({
                        "response": false,
                        "value": err
                    });
                }
                res.json({
                    "response": true,
                    "value": proOder
                });
            });
        } else {
            res.json({
                "response": false,
                "value": "not find with provider id: " + req.params.provider_id
            });
        }
    });
});

module.exports = router;
