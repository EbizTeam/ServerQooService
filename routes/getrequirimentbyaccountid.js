const express = require('express');
const router = express.Router();
const AAuction = require('../models/autions');
const PSAProviderSentAuction = require('../models/providersendaution');
const Spscategory = require('../models/spscategory');
const Async = require("async");

let FindSpsProvider = (provider_id) => {
    return new Promise((resolve, reject) => {
        Spscategory.findOne({"provider_id": provider_id}, function (err, spspay) {
            if (err) {
                reject(err);
            } else if (spspay) {
                resolve(spspay.category_id.split(",").map(String));
            }
            else{
                resolve([]);
            }
        });
    });
}

let FindAuction = (category) =>{
    return new Promise((resolve, reject) => {
        AAuction.find({
            category_id: category,
            status: "New Auction",
        },function (err, auctions) {
            if (err) reject(err);
            resolve(auctions);
        })
    });
}

let FindAAuctionProvider = (provider_id) => {
    return new Promise((resolve, reject) => {
        FindSpsProvider(provider_id)
            .then(
                categries => {
                    if (categries){
                        let auction_p = [];
                        Async.forEachOf(categries, function (category, key, callback) {
                            FindAuction(category)
                                .then(
                                    auctions => {
                                        if(auctions){
                                            for (let i in auctions ) {
                                                auction_p.push(auctions[i]);
                                            }
                                        }
                                        callback();
                                    }
                                    ,err => {
                                        callback(err);
                                    }
                                )
                        }, function (err) {
                            if (err) reject(err);
                            // configs is now a map of JSON data
                            resolve(auction_p);
                        });
                    } else {
                        reject(new Error("khong tim thay"));
                    }
                }
                ,err => {
                    reject(err);
                }
            );
    });
}

let FindProviderauction = (provider_id) => {
    return new Promise((resolve, reject) => {
        PSAProviderSentAuction.find({
            "provider_id": provider_id
            }, function (err, psalist) {
            if (err) reject(err);
            // configs is now a map of JSON data
            resolve(psalist);
        });
    });
}



let delRequirimentAuctioned = (provider_id) => {
    return new Promise((resolve, reject) => {
        FindAAuctionProvider(provider_id)
            .then(
                auctions => {
                    console.log(auctions.length);
                    if (auctions.length > 0){
                        FindProviderauction(provider_id)
                            .then(
                                Auctionted => {
                                    console.log(Auctionted.length);
                                    if (Auctionted.length > 0) {
                                        let len = Auctionted.length;
                                        let auction_providers = [];
                                        Async.forEachOf(auctions, function (auction, key, callback) {
                                            let i = 0;
                                            Async.forEachOf(Auctionted, function (item, key, callback) {
                                                    if (auction._id != item.auction_id ){
                                                        i++;
                                                    }
                                                    callback();
                                            }, function (err) {
                                                if(i === len){
                                                    auction_providers.push(auction);
                                                }
                                            });
                                            callback();
                                        }, function (err) {
                                            if (err) reject(err);
                                            // configs is now a map of JSON data
                                            resolve(auction_providers);
                                        });
                                    }else{
                                        resolve(auctions);
                                    }
                                }
                                ,err => { reject(err)}
                            );
                    } else{
                        resolve([]);
                    }
                }
                ,err => { reject(err)}
            );

    });
}



router.post("/", function (req, res) {
    let account_id = req.body.account_id;
    let account_type = req.body.account_type;

    if (account_type == 1) {
        // PROVIDER
        delRequirimentAuctioned(account_id)
            .then(
                auctions => {
                    if (auctions ) {
                        res.json({
                            "response": true,
                            "value": auctions
                        });
                    }else
                    {
                        res.json({
                            "response": false,
                            "value": []
                        });
                    }
                }
                ,err => {
                    res.json({
                        "response": false,
                        "value": err
                    });
                }
            );
    }
    else {
        // CUSTOMER
        AAuction.find({
            'customer_id': account_id
        }, function (err, auctionslist) {
            let listauction = [];
            Async.forEachOf(auctionslist, function (auction, key, callback) {
                PSAProviderSentAuction.find({
                    auction_id: auction._id,
                    status: {$not: /Decline/},
                }, function (err, providerauction) {
                    if (err) {
                        res.json({
                            "response": false,
                            "value": []
                        });
                    }else{
                        listauction.push({
                            _id:auction._id,
                            customer_id: auction.customer_id,
                            category_id: auction.category_id,
                            sub_category_id: auction.sub_category_id,
                            status: auction.status,
                            time_auction: auction.time_auction,
                            num_of_order_list: providerauction.length,
                            link_file: auction.link_file,
                            user_deleted: auction.user_deleted,
                            created_at: auction.created_at,
                            });
                    }
                    callback();
                });
            }, function (err) {
                if (err)  {
                    res.json({
                        "response": false,
                        "value": []
                    });
                }
                else{
                    res.json({
                        "response": true,
                        "value": listauction
                    });
                }

            });
        });
    }
});


module.exports = router;
