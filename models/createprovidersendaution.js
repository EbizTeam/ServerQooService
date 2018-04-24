const express = require('express');
const router = express.Router();


let CreateNewAution = (auction) =>{
    return new Promise((resolve, reject) => {
        auction.save(function (err, auction) {
            if (err) return reject(new Error('loi tim email: ' + obj));
            resolve(auction);
        });
    });
}

module.exports = CreateNewAution;