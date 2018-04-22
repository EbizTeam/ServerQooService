const express = require('express');
const router = express.Router();
const Providers = require('./useraccount');

let Finduserfollowemail = (id) =>{
    return new Promise((resolve, reject) => {
        Providers.findOne({
            '_id': id
        }, function (err, user) {
            if (err) return reject(new Error('loi tim id: ' + id));
            resolve(user);
        });
    });
}

module.exports = Finduserfollowemail;

