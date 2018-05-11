const express = require('express');
const router = express.Router();
const Services = require('../models/services');
const Wallet = require('../models/wallet');
const ServicesTop = require('../models/servicesbuytop');
const findProvider = require('../models/finduserfolloweid');
const Async = require("async");
const sortBy = require('array-sort');
const Historypayment = require('../models/historypayment');

let FindServiceTop = (service) => {
    return new Promise((resolve, reject) => {
        let service_top = [];
        Async.forEachOf(service, function (item, key, callback) {
            ServicesTop.findOne({"service_id":item.services_id}, function (err, servicetop) {
                if (err) return callback(err);
                    if (servicetop) {
                        item.updated_at = servicetop.create_buy;
                        service_top.push(item);
                    }else{
                        return callback(err);
                    }
                    callback();
            });
        }, function (err) {
            if (err)  reject(err);
            // configs is now a map of JSON data
            resolve(service_top);
        });
    });
}

let findMemberShip = (servicesname) => {
    return new Promise((resolve, reject) => {
        let service_providers = [];
        Async.forEachOf(servicesname, function (item, key, callback) {
            findProvider(item.provider_id)
                .then(
                    provider => {
                        if (provider) {

                            item.top_service = provider.member_ship ;
                            service_providers.push(item);

                        }
                        callback();
                    },
                    err=>{callback(err)}
                );
        }, function (err) {
            if (err)  reject(err);
            // configs is now a map of JSON data
            resolve(service_providers);
        });
    });
}

let sorttopservice = async (servicesname, res) => {
    let service_top = [];
    let service_providers = [];
    let services = [];

    await FindServiceTop(servicesname)
        .then(stop => {
            if (stop) {

                service_top = stop;
            }
        }, err => {
            console.log(err)
        });

    await findMemberShip(service_top)
        .then(serviceProviders => {
            if (serviceProviders) {
                service_providers = serviceProviders;

            }
        }, err => {
            console.log(err)
        });

    sortOject(service_providers).then(
        service => {
            if (service) {
                Async.forEachOf(service, function (item, key, callback) {
                    Services.findOne({_id: item.id},
                        function (err, sv) {
                            if (err)  return callback(err)
                            if (sv) {
                                sv.detail = '/qooservice/system/public/provider/servicedetail/'+item.detail;
                                    let images = [];
                                    Async.forEachOf(sv.image, function (image, key, callback) {
                                        images.push( '/qooservice/system/public/uploadfile/services/'+image);
                                        callback();
                                    }, function (err) {
                                        // configs is now a map of JSON data
                                        sv.image = images;
                                    });
                                services.push(sv);
                            }
                            callback();
                        });
                }, function (err) {
                    // configs is now a map of JSON data
                    if(err)  res.json({"response": [], "value":false});
                    else {
                        res.json({"response": services, "value":true});
                    }
                });
            }
        },
        err => {
            res.json({"response": [], "value":false});
            //console.log(err);
        }
    );
}

let sortOject = (service_providers) => {
    return new Promise((resolve, reject) => {
        if (service_providers) {
           let value = sortBy(service_providers, 'updated_at');
           let value1 = sortBy(value, 'top_service', {reverse: true});
            resolve(value1);
        }
        else return reject(new Error('loi tim id: ' + id));
    });
}

//topservice
router.get("/", function (req, res) {

    Services.find({}, function (err, service) {
        if (err) {
            res.send(err);
        }
        else {
            if (service) {
                sorttopservice(service, res);

            }else{
                res.json({"response": [], "value":false});
            }
        }
    });


});


let FindWallet = (user_id) => {
    return new Promise((resolve, reject) => {
        Wallet.findOne({
            'user_id': user_id
        }, function (err, wl) {
            if (err) return reject(new Error('loi tim id: ' + user_id));
            resolve(wl);
        });
    });
}

let UpdateWallet = (userID, balance) => {
    return new Promise((resolve, reject) => {
        let myquery = {
            user_id: userID
        };

        let newvalues = {
            $set: {
                balance: balance
            }
        };
        Wallet.updateOne(myquery, newvalues, function (err, res) {
            if (err) return reject(new Error('UpdateWallet: ' + balance));
            console.log(res);
            resolve(res);
        });
    });
}

router.post("/create", function (req, res) {

    var dat = new Date();
    Date.prototype.addDays = function(days) {
        var dat = new Date(this.valueOf());
        dat.setDate(dat.getDate() + days);
        return dat;
    }
    let phidv = 5;
    let date = 7;
    FindWallet(req.body.provider_id)
        .then(
            wallet => {
                if (wallet) {
                    if (wallet.balance >= phidv) {
                        UpdateWallet(req.body.provider_id, wallet.balance - phidv)
                            .then(
                                wal => {
                                    if (wal) {
                                        ServicesTop.create({
                                            service_id: req.body.service_id,
                                            provider_id: req.body.provider_id,
                                            create_at: Date.now(),
                                            create_end: dat.addDays(date).getTime()
                                        },function (err, service ) {
                                            if (err) res.json({"response": [], "value":false});
                                            else
                                                FindWallet(req.body.provider_id)
                                                    .then(
                                                        walletafter => {
                                                            res.json({"response": walletafter, "value":true});
                                                            },
                                                        err=>{
                                                            res.json({"response": [], "value":false});
                                                        });
                                        });

                                        Historypayment.create({
                                            payment: phidv,
                                            user_id: req.body.provider_id,
                                            service:0,
                                            create_at: Date.now()
                                        },function (err, htr ) {
                                            if (err) console.log(err);
                                            else console.log(htr);
                                        });
                                    }
                                    else {
                                        res.json({
                                            "response": false,
                                            "message": 4,
                                            "value": "Cap nhat gio hang bi loi"
                                        });
                                    }

                                }
                            );

                    } else {
                        res.json({
                            "response": false,
                            "message": 3,
                            "value": wallet.balance
                        });
                    }
                } else {
                    res.json({
                        "response": false,
                        "message": 2,
                        "value": "loi gio hang khong ton tai"
                    });
                }
            },
            err => {
                res.json({
                    "response": false,
                    "message": 2,
                    "value": "loi gio hang khong ton tai"
                });
            }
        );


});

module.exports = router;