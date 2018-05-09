const express = require('express');
const router = express.Router();
const Historypayment = require('../models/historypayment');
const Async = require("async");

let service = [];
service.push("Buy service top");//0
service.push("Auction serivce");//1
service.push("Change membership");//2
service.push("Send requiriment service");//3

//get history
router.get("/get_payment_service/:user_id", function (req, res) {

    Historypayment.find({user_id:req.params.user_id}, function (err, history) {
        if (err) {
            res.json({"response": [], "value":false});
        }
        else {
            if (history) {
                let history_pay = [];
                Async.forEachOf(history, function (item, key, callback) {
                    history_pay.push({
                        "_id": item._id,
                        "payment": item.payment,
                        "user_id": item.user_id,
                        "create_at": item.create_at,
                        "service": item.service,
                        "content_service": service[item.service],
                    });
                        callback();
                }, function (err) {
                    if (err)   res.json({"response": [], "value":false});
                    // configs is now a map of JSON data
                    res.json({"response": history_pay, "value":true});
                });
            }else{
                res.json({"response": [], "value":false});
            }
        }
    });


});



module.exports = router;