const express = require('express');
const router = express.Router();
const Autions = require('../models/autions');
const Checktoken = require('../models/checktoken');
const FindPSAuction = require('../models/findprovidersendautionfollowid');
const Providersendaution = require('../models/providersendaution');
const Createaution = require('../models/createaution');
const Findauctionfollowid = require('../models/findauctionfollowid');


router.use(function (req, res, next) {
    Checktoken(req, res, next);
});

//add a new to the db
router.post('/', function (req, res) {
    //Add New
    new_provider_auction = new Providersendaution({
        provider_id: req.body.provider_id,
        auction_id: req.body.auction_id,
        status: "Sent Auction",
        from_price: req.body.from_price,
        to_price: req.body.to_price,
    });

    Createaution(new_provider_auction)
        .then(
            new_provider_auction =>{
                if (new_provider_auction) {
                    Findauctionfollowid(req.body.auction_id)
                        .then(
                            aution=>{
                                if (aution){
                                    var num_order_list = aution.num_of_order_list;
                                    num_order_list++;
                                    Autions.update({'_id': req.body.auction_id}, {$set: {num_of_order_list: num_order_list}}, {upsert: false}, function (err, acc) {
                                        if (err) {
                                            res.json({"response": false});
                                        }
                                        else {
                                            res.json({
                                                "response": true,
                                                "value": new_provider_auction
                                            });
                                        }
                                    });
                                }
                            }
                            ,err => {
                                res.json({"response": false});
                            }
                        )
                }
            },
            err=>{
                res.json({"response": false});
            }
        );

});

module.exports = router;
