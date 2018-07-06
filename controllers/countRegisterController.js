'use strict';
const countRegister = require('../models/countRegisterModel');

let CreateCountRegister  = (type,provider) =>{
    return new Promise((resolve, reject) => {
        countRegister.create({
            type:type,
            provider:provider,
        },function (err, aa) {
            if (err) return reject(err);
            resolve(aa);
        });
    });
}

let updateCountRegister = (type,provider,count) => {
    return new Promise((resolve, reject) => {
        countRegister.findOneAndUpdate({type: type,provider:provider}, {count: count,updated_at:Date.now()}, {new: true}, function (err, aa) {
            if (err) return reject(err);
            resolve(aa);
        });
    });
}


let FindCountRegister= (type,provider) =>{
    return new Promise((resolve, reject) => {
        countRegister.findOne({
            type:type,
            provider:provider,
        },function (err, aa) {
            if (err) return reject(err);
            resolve(aa);
        });
    });
}

exports.count_register  = function (type,provider) {
    FindCountRegister(type,provider)
        .then(
            USer=> {
                if(USer){
                    updateCountRegister(type,provider,USer.count+1)
                        .then(uup => console.log(uup), err=> console.log(err));
                }else{
                    CreateCountRegister(type,provider)
                        .then(uup => console.log(uup), err=> console.log(err));
                }
            },
            err => {
               console.log(err);
            }
        )
}

