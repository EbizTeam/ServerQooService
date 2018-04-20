const express = require('express');
const router = express.Router();
const Wallet = require('../models/wallet');


let CreateNewWallet = (user_id, balance) =>{
    return new Promise((resolve, reject) => {

        sptemp = new Wallet({
            user_id: user_id,
            balance: balance
        });

        sptemp.save( function (err, wallet) {
            if (err) return reject(new Error('loi tao wallet roi anh em oi: '));
            resolve(wallet);
        });
    });
}

module.exports = CreateNewWallet;