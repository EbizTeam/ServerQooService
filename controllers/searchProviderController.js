'use strict';
const keyProvider = require('../models/keySearchProviderModel');
const Async = require("async");

let createKey = (key) => {
    return new Promise((resolve, reject) => {
        keyProvider.create({
            key_name: key
        }, function (err, aa) {
            if (err) return reject(err);
            resolve(aa);
        });
    });
};

let updateKey = (key,count) => {
    return new Promise((resolve, reject) => {
        keyProvider.findOneAndUpdate({key_name: key}, {views: count,updated_at:Date.now()}, {new: true}, function (err, aa) {
            if (err) return reject(err);
            resolve(aa);
        });
    });
};

let FindkeyProvider = (key) =>{
    return new Promise((resolve, reject) => {
        keyProvider.findOne({
            key_name:key,
        },function (err, aa) {
            if (err) return reject(err);
            resolve(aa);
        });
    });
};

let FindMoreKeyService = (key) =>{
    return new Promise((resolve, reject) => {
        let query = {key_name: {$regex: key, $options: 'i'}};
        keyService.find(query,function (err, aa) {
            if (err) return reject(err);
            resolve(aa);
        }).sort({views:-1});
    });
};

exports.insert_key = function (key) {
    FindkeyProvider(key)
        .then(
            keyProvider=>  {
                if(keyProvider){
                    updateKey(key, keyProvider.views+1)
                        .then(uup => console.log(uup), err=> console.log(err));
                }else{
                    createKey(key)
                        .then(uup => console.log(uup), err=> console.log(err));
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
