const express = require('express');
const router = express.Router();
const Providersendaution = require('../models/providersendaution');

let FindPSAuction = (id) =>{
    return new Promise((resolve, reject) => {
        Providersendaution.find({
            'provider_id': id
        }, function (err, providersendauction) {
            if (err) return reject(new Error('loi tim id: ' + id));
            resolve(providersendauction);
        });
    });
}

module.exports = FindPSAuction;

