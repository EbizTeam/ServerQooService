const express = require('express');
const router = express.Router();
const Comment = require('../models/service_provider_comments');
//get
router.get("/:provider_id", function (req, res) {
    Comment.find({provider_id: req.params.provider_id,active: true }, function (err, comments) {
        if (err) {
            res.json({"response": [], "value": false});
        }
        else {
            if (comments) {
                res.json({"response": comments, "value": true});
            } else {
                res.json({"response": [], "value": false});
            }
        }
    });
});

module.exports = router;
