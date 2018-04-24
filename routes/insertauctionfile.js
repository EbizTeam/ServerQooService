const express = require('express');
const router = express.Router();
const Auctions = require('../models/autions');
const Checktoken = require('../models/checktoken');
const Createaution = require('../models/createaution');
const Uploadfile = require('../models/uploadfile');

router.use(function (req, res, next) {
    Checktoken(req, res, next);
});

//add a new to the db
router.post('/', function (req, res, next) {
    //loai 1 chat
    //loai 2 appoint
    //loai 3 aution
    Uploadfile(req, res, 3)
        .then(linkfile => {
                if (linkfile) {
                    //Add to Auction
                    new_auction = new Auctions({
                        customer_id: req.body.customer_id,
                        category_id: req.body.category_id,
                        sub_category_id: req.body.sub_category_id,
                        status: req.body.status,
                        time_auction: req.body.time_auction,
                        num_of_order_list: 0,
                        user_deleted: "",
                        link_file: linkfile,
                        create_at: Date.now(),
                    });

                    Createaution(new_auction)
                        .then(auction => {
                            if (auction) {
                                res.json({
                                    "response": true,
                                    "value": auction
                                });
                            }
                        }, err => {
                            res.json({
                                "response": false,
                                "message": err
                            });
                        });
                } else {
                    res.json({
                        "response": false,
                        "message": err
                    });
                }
            },
            err => {
                res.json({
                    "response": false,
                    "message": err
                });
            });
});

module.exports = router;
