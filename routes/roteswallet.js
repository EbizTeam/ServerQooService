const express = require('express');
const router = express.Router();
const Wallet = require('../models/wallet');

// get the use with that id (accessed at GET http://localhost:4000/GetInfoAccount/:email)
router.get('/balance/:user_id',function(req, res, next) {
    Wallet.findOne({
        'user_id': req.params.user_id
    }, function (err, wl) {
        if (err) res.json({ "value": false,"response": ""});
        if (wl) {
            res.json({ "value": true,
                "response": wl.balance});
        } else
            res.json({ "value": false,"response": ""});
    });
});


module.exports = router;
