'use strict';
const CoundtUser = require('../models/countUserModel');

let CreateCoundtUser = (type,provider) =>{
    return new Promise((resolve, reject) => {
        CoundtUser.create({
            type:type,
            provider:provider,
        },function (err, aa) {
            if (err) return reject(err);
            resolve(aa);
        });
    });
}

let updateCoundtUser = (type,provider,count) => {
    return new Promise((resolve, reject) => {
        CoundtUser.findOneAndUpdate({type: type,provider:provider}, {count: count,updated_at:Date.now()}, {new: true}, function (err, aa) {
            if (err) return reject(err);
            resolve(aa);
        });
    });
}


let FindCoundtUser = (type,provider) =>{
    return new Promise((resolve, reject) => {
        CoundtUser.findOne({
            type:type,
            provider:provider,
        },function (err, aa) {
            if (err) return reject(err);
            resolve(aa);
        });
    });
}

exports.count_user = function (type,provider) {
    FindCoundtUser(type,provider)
        .then(
            USer=> {
                if(USer){
                    updateCoundtUser(type,provider,USer.count+1)
                        .then(uup => console.log(uup), err=> console.log(err));
                }else{
                    CreateCoundtUser(type,provider)
                        .then(uup => console.log(uup), err=> console.log(err));
                }
            },
            err => {
               console.log(err);
            }
        )
}

