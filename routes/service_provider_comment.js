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

router.post("/create", function (req, res) {
    Comment.create({
        provider_id: req.body.provider_id,
        user_name: req.body.user_name,
        comment_title: req.body.comment_title,
        comment_content: req.body.comment_content,
        rating_star: req.body.rating_star,
        active:false,
        create_at: Date.now()
    }, function (err, comment) {
        if (err) res.json({"response": [], "value": false});
        res.json({"response": comment, "value": true});
    });
});

module.exports = router;