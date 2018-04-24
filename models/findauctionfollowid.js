const express = require('express');
const router = express.Router();
const Autions = require('./autions');

let FindAutions = (id) =>{
    return new Promise((resolve, reject) => {
        Autions.findOne({
            '_id': id
        }, function (err, aution) {
            if (err) return reject(new Error('loi tim id: ' + id));
            resolve(aution);
        });
    });
}

module.exports = FindAutions;

