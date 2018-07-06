'use strict';
const Appointment = require('../models/AppointmentModel');
const admin = require('../controllers/adminController');
const sortBy = require('array-sort');
const multer = require('multer');
const config = require('../config');
const SendMail = require('../controllers/sendMailController');
const Wallet = require('../controllers/walletController');
const History = require('../controllers/historyPaymentController');
//save appointment
let createAppoitnment = (obj) => {
    return new Promise((resolve, reject) => {
        obj.save(function (err, app) {
            if (err) return reject(err);
            resolve(app);
        })
    });
}
////find appointment follow by acount id
let FindAppointmentConsumer = (account_id) => {
    return new Promise((resolve, reject) => {
        Appointment.find({
            from_id: account_id,
            user_deleted: {$ne: account_id}
        }, function (err, app) {
            if (err) return reject(err);
            resolve(app);
        })
    });
}
let FindAppointmentProvider = (account_id) => {
    return new Promise((resolve, reject) => {
        Appointment.find({
            to_id: account_id,
            user_deleted: {$ne: account_id}
        }, function (err, app) {
            if (err) return reject(err);
            resolve(app);
        })
    });
}
//sort servide new and abc
let sortappointment = (appointment) => {
    return new Promise(async (resolve, reject) => {
        if (appointment) {
            let ascending = await sortBy(appointment, 'time_insert', {reverse: false});
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
                    } else {
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
                                    } else {
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
let updateAppointmentID = (id, obj) => {
    return new Promise((resolve, reject) => {
        Appointment.findOneAndUpdate({_id: id}, obj, {new: true}, function (err, aa) {
            if (err) return reject(err);
            resolve(aa);
        });
    });
};
exports.update_appointment = function (req, res) {
    updateAppointmentID(req.params.id, req.body)
        .then(
            serSor => {
                return res.json({"response": serSor, "value": true});
            },
            err => {
                return res.json({"response": err, "value": false});
            }
        );
}
exports.list_all_appointment = function (req, res) {
    let {account_id, page} = req.params;
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

let storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, config.APath + '/asset/appointment_file/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.txt');
    }
});
let upload = multer({ //multer settings
    storage: storage
}).single('Appointment');
let Err = [];
Err.push("1. update wallet success, create appoint fail");
Err.push("2. update wallet fail");
Err.push("3. Not enough money");
Err.push("4. Upload file fail");
exports.insert_book_appointment_file = function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            // An error occurred when uploading
            return res.json({
                "response": 4,
                "message": err
            });
        } else {
            admin.findOnePriceID(req.body.price_id)
                .then(mprice => {
                    //console.log(mprice);
                    let {Price, date, Name} = mprice;
                    Wallet.find_wallet_user_id(req.body.from_id)
                        .then(
                            wallet => {
                                // console.log(wallet.balance, Price);
                                if (wallet) {
                                    if (wallet.balance >= Price) {
                                        Wallet.update_wallet_user_id({
                                            user_id: req.body.from_id,
                                            balance: wallet.balance - Price
                                        }).then(
                                            wal => {
                                                if (wal) {
                                                    // insert story history payment buy banner ads
                                                    History.insert_new_history_paymeny({
                                                        user_id: req.body.from_id,
                                                        payment: Price,
                                                        content_service: `${Name} pay ${Price} uses ${date}`,
                                                    });
                                                    //insert data appoint
                                                    let newApp = new Appointment(Object.assign(req.body, {link_file: "appointment_file/" + req.file.filename}));
                                                    createAppoitnment(newApp)
                                                        .then(app => {
                                                                if (app) {
                                                                    let data = {
                                                                        id: req.body.from_id + "",
                                                                        notify : 1 , //appointment
                                                                        // notify : 2, // requirement
                                                                    };
                                                                    SendMail.send_mail(config.url_mail_notifyop, data);
                                                                    return res.json({
                                                                        "response": Object.assign(JSON.parse(JSON.stringify(wal)), JSON.parse(JSON.stringify(app))),
                                                                        "value": 0
                                                                    });
                                                                } else {
                                                                    return res.json({"response": 1, "message": Err});
                                                                }
                                                            },
                                                            err => {
                                                                return res.json({"response": 1, "message": Err});
                                                            }
                                                        );
                                                }
                                                else {
                                                    res.json({
                                                        "response": Err,
                                                        "value": 2
                                                    });
                                                }
                                            },
                                            err => {
                                                res.json({
                                                    "response": Err,
                                                    "value": 2
                                                });
                                            }
                                        );
                                    } else {
                                        res.json({
                                            "response": Err,
                                            "value": 3
                                        });
                                    }
                                } else {
                                    res.json({
                                        "response": Err,
                                        "value": 3
                                    });
                                }
                            },
                            err => {
                                res.json({
                                    "response": Err,
                                    "value": 3
                                });
                            }
                        );
                }, err => {
                    return res.json({
                        "response": 4,
                        "message": err
                    });
                });
        }
    });
};

exports.insert_book_appointment = function (req, res) {
    admin.findOnePriceID(req.body.price_id)
        .then(mprice => {
            //console.log(mprice);
            let {Price, date, Name} = mprice;
            Wallet.find_wallet_user_id(req.body.from_id)
                .then(
                    wallet => {
                        // console.log(wallet.balance, Price);
                        if (wallet) {
                            if (wallet.balance >= Price) {
                                Wallet.update_wallet_user_id({
                                    user_id: req.body.from_id,
                                    balance: wallet.balance - Price
                                }).then(
                                    wal => {
                                        if (wal) {
                                            // insert story history payment buy banner ads
                                            History.insert_new_history_paymeny({
                                                user_id: req.body.from_id,
                                                payment: Price,
                                                content_service: `${Name} pay ${Price} uses ${date}`,
                                            });
                                            //insert data appoint
                                            let newApp = new Appointment(req.body);
                                            createAppoitnment(newApp)
                                                .then(app => {
                                                        if (app) {
                                                            let data = {
                                                                id: req.body.from_id + "",
                                                                notify : 1 , //appointment
                                                                // notify : 2, // requirement
                                                            };
                                                            SendMail.send_mail(config.url_mail_notifyop, data);
                                                            return res.json({
                                                                "response": Object.assign(JSON.parse(JSON.stringify(wal)), JSON.parse(JSON.stringify(app))),
                                                                "value": 0
                                                            });
                                                        } else {
                                                            return res.json({"response": 1, "message": Err});
                                                        }
                                                    },
                                                    err => {
                                                        return res.json({"response": 1, "message": Err});
                                                    }
                                                );
                                        }
                                        else {
                                            res.json({
                                                "response": Err,
                                                "value": 2
                                            });
                                        }
                                    },
                                    err => {
                                        res.json({
                                            "response": Err,
                                            "value": 2
                                        });
                                    }
                                );
                            } else {
                                res.json({
                                    "response": Err,
                                    "value": 3
                                });
                            }
                        } else {
                            res.json({
                                "response": Err,
                                "value": 3
                            });
                        }
                    },
                    err => {
                        res.json({
                            "response": Err,
                            "value": 3
                        });
                    }
                );
        }, err => {
            return res.json({
                "response": 4,
                "message": err
            });
        });
};

