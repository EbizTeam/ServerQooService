const express = require('express');
const router = express.Router();

const Checktoken = require('../models/checktoken');
const CustomerComment = require('../models/comments');
const Useraccount = require('../models/useraccount');



//Get comment by services id
router.get("/get_comment/:services_id", function (req, res) {
    CustomerComment.find({services_id: req.params.services_id}, function (err, comments) {
        res.send(comments);
    });
});

router.use(function (req, res, next) {
    Checktoken(req, res, next);
});

//add a new to the db
router.post("/post_comment", function (req, res) {
    customercomment = new CustomerComment({
        customer_comment_id: req.body.customer_comment_id,
        name: req.body.name,
        title_comment: req.body.titlecomment,
        comment: req.body.comment,
        services_id: req.body.servicesid,
        rate_services: req.body.rate_services,
        rate_attitude: req.body.rate_attitude,
        rate_price: req.body.rate_price,
        rate_friendliness: req.body.rate_friendliness,
        recommenrded_this_provider: req.body.recommenrded_this_provider
    });

    //Update provider recommended
    if (req.body.recommenrded_this_provider == 1) {
        //High
        Useraccount.find({_id: req.body.services_provider_id}, function (err, providers_id) {
            if (providers_id.length == 0) {
                res.json({"response": "false 1"});
            }
            else {
                var new_no_of_high_recommended = providers_id[0].no_of_hight_recommended;
                new_no_of_high_recommended += 1;
                Useraccount.update({'_id': req.body.services_provider_id}, {$set: {'no_of_hight_recommended': new_no_of_high_recommended}}, function (err, providers_info) {
                    if (err) {
                        res.json({"response": "false 2"});
                    } else {
                        // UPDATE IS OK - save comment
                        customercomment.save(function (err, cus) {
                            if (err) {
                                res.json({"response": "false 3"});
                            } else {
                                CustomerComment.find({customer_comment_id: req.body.customer_comment_id}, function (err, comment) {
                                    res.json({
                                        "response": true,
                                        "value": comment
                                    });
                                });
                            }
                        });
                    }
                });
            }
        });
    }
    else if (req.body.recommend_services_provider == 2) {
        //Recommended
        Useraccount.find({_id: req.body.services_provider_id}, function (err, providers_id) {
            if (providers_id.length == 0) {
                res.json({"response": "false 1"});
            }
            else {
                var new_no_of_recommended = providers_id[0].no_of_recommended;
                new_no_of_recommended += 1;
                Useraccount.update({'_id': req.body.services_provider_id}, {$set: {'no_of_recommended': new_no_of_recommended}}, function (err, providers_info) {
                    if (err) {
                        res.json({"response": "false 2"});
                    } else {
                        // UPDATE IS OK - save comment
                        customercomment.save(function (err, cus) {
                            if (err) {
                                res.json({"response": "false 3"});
                            } else {
                                CustomerComment.find({customer_comment_id: req.body.customer_comment_id}, function (err, comment) {
                                    res.json({
                                        "response": true,
                                        "value": comment
                                    });
                                });
                            }
                        });
                    }
                });
            }
        });
    }
    else if (req.body.recommend_services_provider == 3) {
        //Neutral
        Useraccount.find({_id: req.body.services_provider_id}, function (err, providers_id) {
            if (providers_id.length == 0) {
                res.json({"response": "false 1"});
            }
            else {
                var new_no_of_neutral = providers_id[0].no_of_neutral;
                new_no_of_neutral += 1;
                Useraccount.update({'_id': req.body.services_provider_id}, {$set: {'no_of_neutral': new_no_of_neutral}}, function (err, providers_info) {
                    if (err) {
                        res.json({"response": "false 2"});
                    } else {
                        // UPDATE IS OK - save comment
                        customercomment.save(function (err, cus) {
                            if (err) {
                                res.json({"response": "false 3"});
                            } else {
                                CustomerComment.find({customer_comment_id: req.body.customer_comment_id}, function (err, comment) {
                                    res.json({
                                        "response": true,
                                        "value": comment
                                    });
                                });
                            }
                        });
                    }
                });
            }
        });
    }
    else {
        //Not Rrcommended
        Useraccount.find({_id: req.body.services_provider_id}, function (err, providers_id) {
            if (providers_id.length == 0) {
                res.json({"response": "false 1"});
            }
            else {
                var new_no_of_not_recommended = providers_id[0].no_of_not_recommended;
                new_no_of_not_recommended += 1;
                Useraccount.update({'_id': req.body.services_provider_id}, {$set: {'no_of_not_recommended': new_no_of_not_recommended}}, function (err, providers_info) {
                    if (err) {
                        res.json({"response": "false 2"});
                    } else {
                        // UPDATE IS OK - save comment
                        customercomment.save(function (err, cus) {
                            if (err) {
                                res.json({"response": "false 3"});
                            } else {
                                CustomerComment.find({customer_comment_id: req.body.customer_comment_id}, function (err, comment) {
                                    res.json({
                                        "response": true,
                                        "value": comment
                                    });
                                });
                            }
                        });
                    }
                });
            }
        });
    }

});


module.exports = router;
