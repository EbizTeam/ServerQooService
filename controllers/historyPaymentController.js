'use strict';
const History = require('../models/historypayment');

let createHistory = (obj) =>{
    return new Promise((resolve, reject) => {
        let his = new History(obj);
        his.save(function (err, history) {
            if (err) return reject(err);
            resolve(history);
        });
    });
};
exports.insert_new_history_paymeny = createHistory;

