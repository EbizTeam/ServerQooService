const express = require('express');
const router = express.Router();
const Services = require('../models/services');

router.post("/", function (req, res) {
    var query = {provider_id: req.body.provider_id};
    Services.find(query,
        function (err, servicesname) {
            if (err) {
                res.json({"response": "false"});
            }
            else {
                if (servicesname) {
                    res.json({"response": servicesname});
                }
                else {
                    res.json({"response": []});
                }

            }
        });
});

module.exports = router;