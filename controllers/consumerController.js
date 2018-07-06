'use strict';
const Consumer = require('../models/customerdata');

// get all nguoi dung tu mongodb
let GetOneConsumer =  (userID) => {
    return new Promise((resolve, reject) => {
        Consumer.findOne({
            "_id": userID
        }, function (err, provider) {
            if (err)return reject(err);
            resolve(provider);
        });
    });
}
exports.GetOneConsumer = GetOneConsumer;
