'use strict';
const keyService = require('../models/keySearchServiceModel');
const serviceController = require('../controllers/serviceController');
const Async = require("async");

let createKey = (key) => {
    return new Promise((resolve, reject) => {
        keyService.create({
            key_name: key
        }, function (err, aa) {
            if (err) return reject(err);
            resolve(aa);
        });
    });
};

let updateKey = (key, count) => {
    return new Promise((resolve, reject) => {
        keyService.findOneAndUpdate({key_name: key}, {
            views: count,
            updated_at: Date.now()
        }, {new: true}, function (err, aa) {
            if (err) return reject(err);
            resolve(aa);
        });
    });
};

let FindKeyService = (key) => {
    return new Promise((resolve, reject) => {
        keyService.findOne({
            key_name: key,
        }, function (err, aa) {
            if (err) return reject(err);
            resolve(aa);
        });
    });
};

let FindMoreKeyService = (key) => {
    return new Promise((resolve, reject) => {
        let query = {key_name: {$regex: key, $options: 'i'}};
        keyService.find(query, function (err, aa) {
            if (err) return reject(err);
            resolve(aa);
        }).sort({views:-1});
    });
};

exports.insert_key = function (key) {
    FindKeyService(key)
        .then(
            keyService => {
                if (keyService) {
                    updateKey(key, keyService.views + 1)
                        .then(uup => console.log(uup), err => console.log(err));
                } else {
                    createKey(key)
                        .then(uup => console.log(uup), err => console.log(err));
                }
            },
            err => {
                console.log(err);
            }
        )
};

exports.find_trend = function (key) {
    return new Promise(async (resolve, reject) => {
        FindMoreKeyService(key)
            .then(
                serSor => {
                    return resolve(serSor.slice(0, 5));
                },
                err => {
                    return reject(err);
                }
            );

    })

};
