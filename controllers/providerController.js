'use strict';
const Provider = require('../models/serviceproviderdata');

// get all nguoi dung tu mongodb
let GetOneProvider =  (userID) => {
    return new Promise((resolve, reject) => {
        Provider.findOne({
            "_id": userID
        }, function (err, provider) {
            if (err)return reject(err);
            resolve(provider);
        });
    });
}
exports.GetOneProvider = GetOneProvider;

// get all service provder active
let GetAllProviderActive =  (userID) => {
    return new Promise((resolve, reject) => {
        Provider.find({isActived: true}, function (err, provider) {
            if (err)return reject(err);
            resolve(provider);
        });
    });
}
exports.GetAllProviderActive = GetAllProviderActive;

//update service provider
let UpdateOneProvider = (obj) => {
    return new Promise((resolve, reject) => {
        Provider.findOneAndUpdate({_id:obj._id}, obj, {new: true},
            function (err, provider) {
            if (err) return reject(err);
            resolve(provider);
        });
    });
};
exports.UpdateOneProvider = UpdateOneProvider;
