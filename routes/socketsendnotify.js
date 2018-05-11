const sortBy = require('array-sort');
const express = require('express');
const routes = express.Router();
const spscategory = require('../models/spscategory');


var Async = require("async");






module.exports = function (category){
    let providerID = [];
    return new Promise((resolve, reject) => {
        spscategory.find({}, function (err, listsps) {
            if (err) {
                reject(err);
            }
            else {
                Async.forEachOf(listsps, function (item, key, callback) {
                    if (item.category_id.indexOf(category) > -1) {
                        providerID.push(item.provider_id);
                    }
                    callback();
                }, function (err) {
                    if (err) reject(err);
                    // configs is now a map of JSON data
                    console.log(providerID);
                    resolve(providerID);

                });
            }
        });
    });
    }

