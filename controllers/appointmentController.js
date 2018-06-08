'use strict';
var Appointment = require('../models/AppointmentModel');
const Wallet = require('../models/wallet');
const Consumer = require('../models/customerdata');
const Provider = require('../models/serviceproviderdata');
const Async = require("async");
const sortBy = require('array-sort');

////find appointment follow by acount id
let FindAppointmentConsumer   = (account_id) => {
    return new Promise((resolve, reject) => {
        Appointment.find({
            from_id: account_id,
            user_deleted: {$ne:account_id}
        },function(err, app){
            if (err) return reject(err);
            resolve(app);
        })
    });
}

let FindAppointmentProvider  = (account_id) => {
    return new Promise((resolve, reject) => {
        Appointment.find({
            to_id: account_id,
            user_deleted: {$ne:account_id}
        },function(err, app){
            if (err) return reject(err);
            resolve(app);
        })
    });
}


//sort servide new and abc
let sortappointment = (appointment) => {
    return new Promise(async (resolve, reject) => {
        if (appointment) {
            let ascending = await sortBy(appointment, 'time_insert',{reverse: false});
            let percent = await sortBy(ascending, 'time_for_appointment', {reverse: false});
            resolve(percent);
        }
        else return reject(new Error('loi tim sort '));
    });
}


// paging Appoitment
let pagingAppoitment = (page, id) => {
    return new Promise(async (resolve, reject) => {
        FindAppointmentConsumer(id)
            .then(
                serNew => {
                    if (serNew) {
                        sortappointment(serNew)
                            .then(
                                serSor => {
                                    return resolve(serSor.slice((0 + page - 1) * 10, page * 10));
                                },
                                err => {
                                    return reject(err);
                                }
                            );
                    }else{
                        FindAppointmentProvider(id)
                            .then(
                                serNew => {
                                    if (serNew) {
                                        sortappointment(serNew)
                                            .then(
                                                serSor => {
                                                    return resolve(serSor.slice((0 + page - 1) * 10, page * 10));
                                                },
                                                err => {
                                                    return reject(err);
                                                }
                                            );
                                    }else{
                                        return reject("not find appointment");
                                    }
                                },
                                err => {
                                    return reject(err);
                                }
                            );
                    }
                },
                err => {
                    return reject(err);
                }
            );
    });

}

exports.list_all_appointment = function (req, res) {
    let {account_id,page} = req.params;
    pagingAppoitment(page, account_id)
        .then(
            serSor => {
                return res.json({"response": serSor, "value": true});
            },
            err => {
                return res.json({"response": err, "value": false});
            }
        );
};
