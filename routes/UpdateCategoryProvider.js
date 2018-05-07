const express = require('express');
const router = express.Router();
const Spscategory = require('../models/spscategory');


router.post("/update_category_for_provider", function (req, res) {
    let provider_id = req.body.provider_id;
    let string_category = req.body.list_category;
    Spscategory.findOne({"provider_id": provider_id}, function (err, spspay) {
        if (err) {
            res.json({
                "response": false,
                "value": err
            });
        } else if (spspay) {
            //update
            Spscategory.updateOne(
                {"provider_id": provider_id},
                {$set: {'category_id': string_category}}
                , function (err, update) {
                    if (err) {
                        res.json({
                            "response": false,
                            "value": err
                        });
                    } else if (update.ok === 1) {
                        Spscategory.findOne({"provider_id": provider_id}, function (err, cate) {
                            if (err) {
                                res.json({
                                    "response": false,
                                    "value": err
                                });
                            } else {
                                res.json({
                                    "response": true,
                                    "value": cate
                                });
                            }
                        });
                    }
                });

        } else {
            //create
            Spscategory.create({
                "provider_id": provider_id,
                "category_id": string_category,
            }, function (err, spscategory) {
                if (err) {
                    res.json({
                        "response": false,
                        "value": err
                    });
                } else {
                    res.json({
                        "response": true,
                        "value": spscategory
                    });
                }
            });
        }
    });

});

module.exports = router;
