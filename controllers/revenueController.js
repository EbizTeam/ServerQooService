'use strict';
const Revenue = require('../models/revenueModel');
const Provider = require('../models/serviceproviderdata');

let CreateRevenue = (accountID,provider,amount) =>{
    return new Promise((resolve, reject) => {
        Revenue.create({
            accountID:accountID,
            provider:provider,
            amount:amount,
        },function (err, aa) {
            if (err) return reject(err);
            resolve(aa);
        });
    });
};

let findProvider = (accountID) =>{
    return new Promise((resolve, reject) => {
        Provider.findOne({
            _id:accountID,
        },function (err, aa) {
            if (err) return reject(err);
            resolve(aa);
        });
    });
};

exports.add_money = function (accountID,amount) {
    findProvider(accountID)
        .then(
            Provider=>{
                if (Provider){
                    CreateRevenue(accountID,true,amount)
                        .then(
                            Revenue=> {
                                if(Revenue){
                                    console.log(Revenue);
                                }
                            },
                            err => {
                                console.log(err);
                            }
                        )
                } else {
                    CreateRevenue(accountID,false,amount)
                        .then(
                            Revenue=> {
                                if(Revenue){
                                    console.log(Revenue);
                                }
                            },
                            err => {
                                console.log(err);
                            }
                        )
                }
            },
            err=>{
                console.log(err);
            }
        );
}

