'use strict';
const inquiry = require('../models/inquiriesModel');
const UserChat = require('../controllers/userController');
const Provider = require('../controllers/providerController');
const Consumer = require('../controllers/consumerController');
const NotifyIOS = require('../controllers/notifyIOSController');
const service = require('../controllers/serviceController');
const Async = require("async");

let findInquiryOne = (id) => {
    return new Promise((resolve, reject) => {
        inquiry.findOne({
            _id: id
        }, function (err, wl) {
            if (err) return reject(err);
            resolve(wl);
        });
    });
};

let findInquiryServiceID = (serviceID, consumerID) => {
    return new Promise((resolve, reject) => {
        inquiry.findOne({
            serviceID: serviceID,
            consumerID: consumerID,
        }, function (err, wl) {
            if (err) return reject(err);
            resolve(wl);
        });
    });
};

let findInquiryAll = (obj) => {
    return new Promise((resolve, reject) => {
        inquiry.find({
            $or: [{
                consumerID: obj.id
            }, {
                providerID: obj.id
            }],
        }, function (err, wl) {
            if (err) return reject(err);
            resolve(wl);
        });

    });
};

let CreateInquiry = (obj) => {
    return new Promise((resolve, reject) => {
        obj.save(function (err, wl) {
            if (err) return reject(err);
            resolve(wl);
        });
    });
};

let UpdateInquiry = (obj) => {
    return new Promise((resolve, reject) => {
        inquiry.findOneAndUpdate({_id: obj._id}, obj, {new: true}, function (err, iq) {
            if (err) return reject(err);
            resolve(iq);
        });
    });
};
exports.update_inquiry = UpdateInquiry;

/*
* api get one inquiry by _id
* method: get
* */
exports.get_inquiry_one_id = function (req, res) {
    findInquiryOne(req.params.id)
        .then(
            serSor => {
                return res.json({"response": serSor, "value": true});
            },
            err => {
                return res.json({"response": err, "value": false});
            }
        );
};

/*
* api get one inquiry by service id and cuonsumer ID
* method: post
* */
exports.get_inquiry_service_consumer = function (req, res) {
    findInquiryServiceID(req.body.serviceID, req.body.consumerID)
        .then(
            serSor => {
                if (serSor) {
                    return res.json({
                        "response": serSor,
                        "value": serSor.agree, // chưa có inquiry
                    });
                } else {
                    return res.json({
                        "response": serSor,
                        "value": 2, // chưa có inquiry
                    });
                }
            },
            err => {
                return res.json({"response": err, "value": false});
            }
        );
};

/*
* api get all list inquiry by user
* method: post
* */
let InsertConsumerInquiry = (inquiries) => {
    return new Promise((resolve, reject) => {
        let a = [];
        Async.forEachOf(inquiries, function (inqui, key, callback) {
            Consumer.GetOneConsumer(inqui.consumerID)
                .then(user => {
                    if (user) {
                        a.push(Object.assign(JSON.parse(JSON.stringify(inqui)), {
                            consumer: {
                                firstname: user.firstname,
                                lastname: user.lastname,
                            }
                        }));
                    }
                    callback();
                }, err => {
                    return callback(err);
                })
        }, function (err) {
            if (err) return reject(err);
            resolve(a);
        });
    });
};
let InsertProviderInquiry = (inquiries) => {
    return new Promise(async (resolve, reject) => {
        let b = await [];
        await Async.forEachOf(inquiries, function (inqui, key, callback) {
            Provider.GetOneProvider(inqui.providerID)
                .then(provider => {
                    if (provider) {
                        b.push(Object.assign(JSON.parse(JSON.stringify(inqui)), {
                            provider: {
                                firstname: provider.firstname,
                                lastname: provider.lastname,
                            }
                        }));
                    }
                    callback();
                }, err => {
                    return callback(err);
                })
        }, function (err) {
            if (err) return reject(err);
            resolve(b);
        });
    });
};
let InsertServiceInquiry = (inquiries) => {
    return new Promise(async (resolve, reject) => {
        let c = await [];
        await Async.forEachOf(inquiries, function (inqui, key, callback) {
            service.findOneServiceId(inqui.serviceID)
                .then(service => {
                    if (service) {
                        c.push(Object.assign(JSON.parse(JSON.stringify(inqui)), {
                            services: service,
                        }));
                    }
                    callback();
                }, err => {
                    return callback(err);
                })
        }, function (err) {
            if (err) return reject(err);
            // console.log(c);
            resolve(c);
        });
    });
};

exports.get_inquiry_list_user_id = function (req, res) {
    findInquiryAll(req.body)
        .then(
            serSor => {
                if (serSor.length < 1) return res.json({"response": "không tồn tại", "value": false});
                InsertConsumerInquiry(serSor)
                    .then(cons => {
                        InsertProviderInquiry(cons)
                            .then(provi => {
                                InsertServiceInquiry(provi)
                                    .then(servi => {
                                        return res.json({"response": servi, "value": true});
                                    }, err => {
                                        return res.json({"response": err, "value": false});
                                    })
                            }, err => {
                                return res.json({"response": err, "value": false});
                            })
                    }, err => {
                        return res.json({"response": err, "value": false});
                    })
            },
            err => {
                return res.json({"response": err, "value": false});
            }
        );
};

/*
* api create inquiry
* method: post
* */
exports.insert_inquiry = function (req, res) {
    let newInquiry = new inquiry(req.body);
    CreateInquiry(newInquiry)
        .then(
            serSor => {
                return res.json({"response": serSor, "value": true});
            },
            err => {
                return res.json({"response": err, "value": false});
            }
        );
};


//socket io
exports.consumer_send_message_inquiry = (io, socket, obj) => {
    let newInquiry = new inquiry(obj);
    CreateInquiry(newInquiry)
        .then(
            inquiry => {
                if (inquiry) {
                    console.log(inquiry);
                    socket.emit("server-saved-inquiry", {response: true, value: inquiry});
                    UserChat.GetOneUsers(obj.providerID)
                        .then(
                            user => {
                                if (user) {
                                    io.to(user._id).emit("consumer-sent-inquiry-to-provider", inquiry);
                                } else {
                                    // sent Appointment iOS
                                    Provider.GetOneProvider(obj.providerID)
                                        .then(provider => {
                                            if (provider.device_token !== undefined && provider.device_token !== null) {
                                                NotifyIOS.sendNotifyIOS(provider.device_token, "You had received an new inquiry.", 1);
                                            } else {
                                                console.log(provider.device_token);
                                            }
                                        }, err => console.log(err));
                                }
                            }, err => console.log(err));
                } else {
                    socket.emit("server-saved-inquiry", {response: false, value: inquiry});
                }
            },
            err => {
                console.log(err);
                socket.emit("server-saved-inquiry", {response: false, value: err});
            }
        );
};

exports.provider_send_message_inquiry = (io, socket, obj) => {
    UpdateInquiry(obj)
        .then(
            inquiry => {
                socket.emit("server-updated-inquiry", inquiry);
                UserChat.GetOneUsers(obj.consumerID)
                    .then(
                        user => {
                            if (user) {
                                io.to(user._id).emit("provider-sent-inquiry-to-consumer", inquiry);
                            } else {
                                // sent Appointment iOS
                                Consumer.GetOneConsumer(obj.consumerID)
                                    .then(consumer => {
                                        if (consumer.device_token !== undefined && consumer.device_token !== null) {
                                            NotifyIOS.sendNotifyIOS(consumer.device_token, "Your inquiry was accepted. ", 1);
                                        } else {
                                            console.log(consumer.device_token);
                                        }
                                    }, err => console.log(err));
                            }
                        }, err => console.log(err));
            },
            err => {
                console.log(err);
            }
        );
};
