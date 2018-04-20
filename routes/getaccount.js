const express = require('express');
const router = express.Router();
const FindEmail = require("../models/findemail");

//add a new to the db
router.post('/GetInfoAccount', function (req, res, next) {
    FindEmail(req.body.p_email).then((account) => {
        if (account) {
            res.json({"response": account});
        } else
            res.json({"response": false});

    }, err => {
        res.json({"response": false});
    }).catch(next);
});

module.exports = router;
