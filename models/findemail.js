const express = require('express');
const router = express.Router();
const Providers = require('../models/provider');

let FindEmail = (email) =>{
    return new Promise((resolve, reject) => {
        Providers.findOne({
            'email': email
        }, function (err, user) {
            if (err) return reject(new Error('loi tim email: ' + email));
            resolve(user);
        });
    });
}

module.exports = FindEmail;

