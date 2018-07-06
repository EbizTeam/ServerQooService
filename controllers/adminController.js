'use strict';
const Admin = require('../models/admin');
const ManagePrice = require('../models/manage_service_price');
const Async = require("async");

let findAllPrice = () => {
    return new Promise((resolve, reject) => {
        let price = [];
        ManagePrice.find({}, function (err, Price) {
            if (err) return reject(err);
            Async.forEachOf(Price, function (item, key, callback) {
                item.updated_at = undefined;
                item.created_at = undefined;
                item.Description = undefined;
                price.push(item);
                callback();
            }, function (err) {
                if (err) reject(err);
                // configs is now a map of JSON data
                resolve(price);
            });
        });
    });
};
exports.findAllPrice = findAllPrice;

let findOnePriceID = (_id) => {
    return new Promise((resolve, reject) => {
        ManagePrice.findOne({_id: _id}, function (err, price) {
            if (err) return reject(err);
            // configs is now a map of JSON data
            resolve(price);
        });
    });
};
exports.findOnePriceID = findOnePriceID;

exports.get_admin = function (req, res) {
    Admin.findOne({}, function (err, admin) {
        if (err) res.json({"value": false, "response": err});
        if (admin) {
            admin.password = undefined,
                findAllPrice()
                    .then(
                        Price => {
                            res.json({
                                "value": true,
                                "response": {
                                    displayCurentcy: admin.displayCurentcy,
                                    rateMoney: admin.rateMoney,
                                    curentcy: admin.curentcy,
                                    price: Price
                                }
                            });
                        },
                        err => {
                            res.json({"value": false, "response": err});
                        }
                    )
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

