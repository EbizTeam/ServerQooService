'use strict';
const Admin = require('../models/admin');

exports.get_admin = function (req, res) {
    Admin.findOne({}, function (err, admin) {
        if (err) res.json({"value": false, "response": err});
        if (admin) {
            admin.password =undefined,
            res.json({
                "value": true,
                "response": {
                    displayCurentcy:admin.displayCurentcy,
                    rateMoney:admin.rateMoney,
                    curentcy:admin.curentcy,
                }
            });
        } else {
            res.json({"value": false, "response": err});
        }
    });
}

exports.insert_admin = function (req, res) {
    Admin.create(req.body, function (err, admin) {
        if (err) res.json({"value": false, "response": err});
        if (admin) {
            res.json({
                "value": true,
                "response": admin
            });
        } else {
            res.json({"value": false, "response": err});
        }
    });
}

