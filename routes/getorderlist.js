const express = require('express');
const router = express.Router();
const Providersendaution = require('../models/providersendaution');
const Checktoken = require('../models/checktoken');
const Useraccount = require('../models/useraccount');
const ChatUsers = require('../models/userchat');



router.use(function (req, res, next) {
    Checktoken(req, res, next);
});

//add a new to the db
router.get("/:auction_id", function (req, res) {
    Providersendaution.find({auction_id: req.params.auction_id}, function (err, order_list) {
        if (err) {
            res.json({"response": false});
        }else
        if (order_list) {
            for (let key in order_list) {
                id = order_list[key].provider_id;
                Provider_list(key, order_list, data, id);

            }

            function Provider_list(i, order_list, data, id) {
                Useraccount.find({_id: id}, function (err, provider_list) {
                    if (provider_list) {
                        Users(i, provider_list, order_list, data);
                    }
                });
            }

            function Users(i, provider_list, order_list, data) {
                ChatUsers.find({userID: provider_list[0]._id}, function (err, users) {
                    if (users.length > 0) {
                        data.push({
                            "_id": order_list[i]._id,
                            "auction_id": order_list[i].auction_id,
                            "from_price": order_list[i].from_price,
                            "provider_id": order_list[i].provider_id,
                            "status": order_list[i].status,
                            "to_price": order_list[i].to_price,
                            "_id_provider": provider_list[0]._id,
                            "firstname": provider_list[0].firstname,
                            "lastname": provider_list[0].lastname,
                            "company_name": provider_list[0].company_name,
                            "no_of_hight_recommended": provider_list[0].no_of_hight_recommended,
                            "no_of_neutral": provider_list[0].no_of_neutral,
                            "no_of_not_recommended": provider_list[0].no_of_not_recommended,
                            "no_of_recommended": provider_list[0].no_of_recommended,
                            "onlline_status": 1
                        });
                    }
                    else {
                        data.push({
                            "_id": order_list[i]._id,
                            "auction_id": order_list[i].auction_id,
                            "from_price": order_list[i].from_price,
                            "provider_id": order_list[i].provider_id,
                            "status": order_list[i].status,
                            "to_price": order_list[i].to_price,
                            "_id_provider": provider_list[0]._id,
                            "firstname": provider_list[0].firstname,
                            "lastname": provider_list[0].lastname,
                            "company_name": provider_list[0].company_name,
                            "no_of_hight_recommended": provider_list[0].no_of_hight_recommended,
                            "no_of_neutral": provider_list[0].no_of_neutral,
                            "no_of_not_recommended": provider_list[0].no_of_not_recommended,
                            "no_of_recommended": provider_list[0].no_of_recommended,
                            "onlline_status": 2
                        });
                    }
                    if (i == (order_list.length - 1)) {
                        res.send(data);
                        //console.log("order_list");
                    }

                });

            }

        }else{
            res.json({"response": false});
        }

    });
});

module.exports = router;
