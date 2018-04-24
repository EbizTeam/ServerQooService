const express = require('express');
const router = express.Router();
const Autions = require('../models/autions');
const Checktoken = require('../models/checktoken');
const FindPSAuction = require('../models/findprovidersendautionfollowid');


router.use(function (req, res, next) {
    Checktoken(req, res, next);
});

//add a new to the db
router.post('/', function (req, res) {
    let account_id = req.body.account_id;
    let data = [];
    // PROVIDER
    FindPSAuction(account_id)
        .then(
            auctions =>{
                if (auctions){
                    let dataauctionid = [];
                    for (let key in auctions){
                        dataauctionid.push(auctions[key].auction_id);
                    }
                    setTimeout(findAuctionID(res,account_id,dataauctionid), 2000);
                }
                else {
                    Autions.find({$and: [{user_deleted: {$ne: account_id}}, {status: "New Auction"}]}, function (err, auctionslist) {
                        data.push(auctionslist);
                        res.json({
                            "response": true,
                            "value": data
                        });
                    });
                }
            }
            ,err => {
                res.json({
                    "response": true,
                    "value": data
                });
            }
        );
});

let findAuctionID = (res, account_id,dataauctionid ) => {
    Autions.find({$and: [{user_deleted: {$ne: account_id}}, {_id: {$nin: dataauctionid}}, {status: "New Auction"}]}, function (err, aucitonObj) {
        if (aucitonObj) {
            res.json({
                "response": true,
                "value": aucitonObj
            });
        }
        else {
            res.json({
                "response": false,
                "value": []
            });
        }

    });
}

module.exports = router;
