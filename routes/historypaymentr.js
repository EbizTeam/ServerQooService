const express = require('express');
const router = express.Router();
const Historypayment = require('../models/historypayment');

//get history
router.get("/get_payment_service/:user_id", function (req, res) {
    Historypayment.find({user_id:req.params.user_id}, function (err, history) {
        if (err) {
            res.json({"response": [], "value":false});
        }
        else {
            if (history) {
                res.json({"response": history, "value":true});
            }else{
                res.json({"response": [], "value":false});
            }
        }
    });

});

module.exports = router;
