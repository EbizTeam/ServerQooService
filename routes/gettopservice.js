const express = require('express');
const router = express.Router();
const Services = require('../models/services');
const Wallet = require('../models/wallet');
const ServicesTop = require('../models/servicesbuytop');
const findProvider = require('../models/finduserfolloweid');
const Async = require("async");
const sortBy = require('array-sort');
const Historypayment = require('../models/historypayment');
const Comment = require('../models/comments');
const ServiceProvider = require('../models/serviceproviderdata');
const manage_service_price = require('../models/manage_service_price');

let FindServiceTop = (service) => {
    return new Promise((resolve, reject) => {
        let service_top = [];
        Async.forEachOf(service, function (item, key, callback) {
            ServicesTop.findOne({"service_id": item.services_id}, function (err, servicetop) {
                if (err) return callback(err);
                if (servicetop) {
                    item.updated_at = servicetop.create_buy;
                    service_top.push(item);
                } else {
                    return callback(err);
                }
                callback();
            });
        }, function (err) {
            if (err) reject(err);
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

                            item.top_service = provider.member_ship;
                            service_providers.push(item);

                        }
                        callback();
                    },
                    err => {
                        callback(err)
                    }
                );
        }, function (err) {
            if (err) reject(err);
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
                            if (err) return callback(err)
                            if (sv) {
                                sv.detail = '/qooservice/system/public/provider/servicedetail/' + item.detail;
                                // let images = [];
                                // Async.forEachOf(sv.image, function (image, key, callback) {
                                //     images.push('/qooservice/system/public/uploadfile/services/' + image);
                                //     callback();
                                // }, function (err) {
                                //     // configs is now a map of JSON data
                                //     sv.image = images;
                                // });
                                services.push(sv);
                            }
                            callback();
                        });
                }, function (err) {
                    // configs is now a map of JSON data
                    if (err) res.json({"response": [], "value": false});
                    else {
                        res.json({"response": services, "value": true});
                    }
                });
            }
        },
        err => {
            res.json({"response": [], "value": false});
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

//topservice ads
router.get("/", function (req, res) {

    Services.find({}, function (err, service) {
        if (err) {
            res.send(err);
        }
        else {
            if (service) {
                sorttopservice(service, res);

            } else {
                res.json({"response": [], "value": false});
            }
        }
    });


});

let countServicer = (services) => {
    return new Promise((resolve, reject) => {
        let seviceCom = [];
        Async.forEachOf(services, function (item, key, callback) {
            Comment.find({services_id: item._id},
                function (err, comm) {
                    if (err) return callback(err)
                    if (comm) {
                        seviceCom.push({
                            services_id: item._id,
                            sum: comm.length
                        })
                    }
                    callback();
                });
        }, function (err) {
            // configs is now a map of JSON data
            if (err) reject(err);
            else {
                resolve(seviceCom);
            }
        });
    });
}

let sortServiceCom = async (serviceCom) => {
    let servicer10 = [];
    let valuesort = await sortBy(serviceCom, 'sum', {reverse: true});
    return new Promise((resolve, reject) => {
        if (valuesort) {
            let i = 0;
            Async.forEachOf(valuesort, function (svsort, key, callback) {
                if (i < 10) {
                    servicer10.push(svsort);
                }
                i++;
                callback();
            }, function (err) {
                // configs is now a map of JSON data
                if (err) reject(err);
                else {
                    resolve(servicer10);
                }
            });

        }
        else return reject(new Error('Sort'));
    });
}

let FindServiceComment = (serviceCom) => {
    let serviceIsComm = [];
    return new Promise((resolve, reject) => {
        Async.forEachOf(serviceCom, function (serviceComm, key, callback) {
            Services.findOne({_id: serviceComm.services_id},
                function (err, sv) {
                    if (err) return callback(err)
                    if (sv) {
                        sv.detail = '/qooservice/system/public/provider/servicedetail/' + serviceComm.detail;
                        sv.top_service = serviceComm.sum;
                        // let images = [];
                        // Async.forEachOf(sv.image, function (image, key, callback) {
                        //     images.push('/qooservice/system/public/uploadfile/services/' + image);
                        //     callback();
                        // }, function (err) {
                        //     // configs is now a map of JSON data
                        //     sv.image = images;
                        // });
                        serviceIsComm.push(sv);
                    }
                    callback();
                });
        }, function (err) {
            // configs is now a map of JSON data
            console.log(serviceIsComm);
            if (err) return reject(err);
            resolve(  sortBy(serviceIsComm, 'top_service', {reverse: true}));

        });
    });
}


let findServiceCommentTop = async (services, res) => {
    let serviceCom = [];
    let serviceComSort = [];
    await countServicer(services)
        .then(svComm => {
            serviceCom = svComm;
        }, err => {
            res.json({"response": err, "value": false});
        });
    await sortServiceCom(serviceCom)
        .then(svComm => {
            serviceComSort = svComm;
        }, err => {
            res.json({"response": err, "value": false});
        });
    FindServiceComment(serviceComSort)
        .then(serv => {
            res.json({"response": serv, "value": true});
        }, err => {
            res.json({"response": err, "value": false});
        });

}

//topservice comment
router.get("/comment-top", function (req, res) {
    Services.find({}, function (err, services) {
        if (err) {
            res.send(err);
        }
        else {
            if (services) {
                findServiceCommentTop(services, res);
            } else {
                res.json({"response": [], "value": false});
            }
        }
    });


});


let findOneService = (SerPros) => {
    return new Promise((resolve, reject) => {
        let serviceIsComm = [];
        Async.forEachOf(SerPros, function (SerPro, key, callback) {
            Services.findOne({provider_id: SerPro._id},
                function (err, sv) {
                    if (err) return callback(err)
                    if (sv) {
                        sv.detail = '/qooservice/system/public/provider/servicedetail/' + sv.detail;
                        // let images = [];
                        // Async.forEachOf(sv.image, function (image, key, callback) {
                        //     images.push('/qooservice/system/public/uploadfile/services/' + image);
                        //     callback();
                        // }, function (err) {
                        //     // configs is now a map of JSON data
                        //     sv.image = images;
                        // });
                        serviceIsComm.push(sv);
                    }
                    callback();
                }).sort({
                create_at: -1
            });
        }, function (err) {
            // configs is now a map of JSON data
            if (err) return reject(err);
            resolve(serviceIsComm);

        });
    })
}

//topservice provider best
router.get("/provider-top-membership", function (req, res) {
    ServiceProvider.find({}, function (err, SerPro) {
        if (err) {
            res.json({"response": err, "value": false});
        }
        else {
            if (SerPro) {
                findOneService(SerPro)
                    .then(service => {
                            if (service) {
                                res.json({"response": service, "value": true});
                            } else {
                                res.json({"response": [], "value": false});
                            }
                        },
                        err => {
                            res.json({"response": err, "value": false});
                        });

            } else {
                res.json({"response": [], "value": false});
            }
        }
    }).sort({
        member_ship: -1,
        member_ship_time: -1,
        no_of_hight_recommended: -1,
        no_of_recommended: -1,
        no_of_neutral: -1,
        no_of_not_recommended: 1
    }).limit(10);
});

//top service new
router.get("/service-top-new", function (req, res) {
    Services.find({}, function (err, service) {
        if (err) {
            res.json({"response": err, "value": false});
        }
        else {
            if (service) {
                let serviceIsComm = [];
                Async.forEachOf(service, function (sv, key, callback) {
                    if (sv) {
                        sv.detail = '/qooservice/system/public/provider/servicedetail/' + sv.detail;

                        // let images = [];
                        // Async.forEachOf(sv.image, function (image, key, callback) {
                        //     images.push('/qooservice/system/public/uploadfile/services/' + image);
                        //     callback();
                        // }, function (err) {
                        //     // configs is now a map of JSON data
                        //     sv.image = images;
                        // });
                        serviceIsComm.push(sv);
                    }
                    callback();
                }, function (err) {
                    // configs is now a map of JSON data
                    if (err) return res.json({"response": err, "value": false});
                    res.json({"response": serviceIsComm, "value": true});
                });

            } else {
                res.json({"response": [], "value": false});
            }
        }
    }).sort({
        create_at: -1
    }).limit(10);
});

let servicePricePecent = (service) => {
    return new Promise((resolve , reject) => {
        let serPercent = [];
        Async.forEachOf(service, function (sv, key, callback) {
            if(sv.sell_price !== 0 && sv.sell_price !== undefined){
                serPercent.push({
                    services_id:sv._id,
                    percent:sv.old_price/sv.sell_price
                });
            }
            callback();
        }, function (err) {
            // configs is now a map of JSON data
            if (err) return reject(err);
            resolve(serPercent);
        });
    });
}

let sortServicePer = (servicePer) => {
    let servicer10 = [];
    return new Promise(async (resolve, reject) => {
        if (servicePer) {
            let valuesort = await sortBy(servicePer, 'percent', {reverse: true});
            let i = 0;
            Async.forEachOf(valuesort, function (svsort, key, callback) {
                if (i < 10) {
                    servicer10.push(svsort);
                }
                i++;
                callback();
            }, function (err) {
                // configs is now a map of JSON data
                if (err) reject(err);
                else {
                    resolve(servicer10);
                }
            });

        }
        else return reject(new Error('Sort'));
    });
}

let FindServicePercent = (serviceCom) => {
    let serviceIsComm = [];
    return new Promise((resolve, reject) => {
        Async.forEachOf(serviceCom, function (serviceComm, key, callback) {
            Services.findOne({_id: serviceComm.services_id},
                function (err, sv) {
                    if (err) return callback(err)
                    if (sv) {
                        sv.detail = '/qooservice/system/public/provider/servicedetail/' + serviceComm.detail;
                        sv.flash_sale = serviceComm.percent;
                        // let images = [];
                        // Async.forEachOf(sv.image, function (image, key, callback) {
                        //     images.push('/qooservice/system/public/uploadfile/services/' + image);
                        //     callback();
                        // }, function (err) {
                        //     // configs is now a map of JSON data
                        //     sv.image = images;
                        // });
                        serviceIsComm.push(sv);
                    }
                    callback();
                });
        }, function (err) {
            // configs is now a map of JSON data
            console.log(serviceIsComm);
            if (err) return reject(err);
            resolve(  sortBy(serviceIsComm, 'flash_sale', {reverse: true}));

        });
    });
}


let sortAndfind = async (services, res) => {
    let serviceCom = [];
    let serviceComSort = [];
    await servicePricePecent(services)
        .then(svComm => {
            serviceCom = svComm;
        }, err => {
            res.json({"response": err, "value": false});
        });
    await sortServicePer(serviceCom)
        .then(svComm => {
            serviceComSort = svComm;
        }, err => {
            res.json({"response": err, "value": false});
        });
    FindServicePercent(serviceComSort)
        .then(serv => {
            res.json({"response": serv, "value": true});
        }, err => {
            res.json({"response": err, "value": false});
        });
}

//top service sale
router.get("/service-top-sale", function (req, res) {
    Services.find({}, function (err, service) {
        if (err) {
            res.json({"response": err, "value": false});
        }
        else {
            if (service) {
                sortAndfind(service,res);
            }
            else
            {
               res.json({"response": [], "value": false});
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

let findServiceTop = (service_id) => {
    return new Promise((resolve, reject) => {
        ServicesTop.findOne({
            service_id: service_id
        }, function (err, svtop) {
            if (err) return reject(err);
            resolve(svtop);
        })
    })
}

let find_manage_service_price = () => {
    return new Promise((resolve, reject) => {
        manage_service_price.findOne({
            message: 0
        }, function (err, svtop) {
            if (err) return reject(err);
            resolve(svtop);
        })
    })
}

router.post("/create",async function (req, res) {

    var dat = new Date();
    Date.prototype.addDays = function (days) {
        let dat = new Date(this.valueOf());
        dat.setDate(dat.getDate() + days);
        return dat;
    }

    Date.prototype.updateDays = function (days, dates) {
        let dat = new Date(dates);
        dat.setDate(dat.getDate() + days);
        return dat;
    }
    find_manage_service_price()
        .then(
            svPrice => {
                let {Price, date, Name, message } = svPrice;
                FindWallet(req.body.provider_id)
                    .then(
                        wallet => {
                            if (wallet) {
                                if (wallet.balance >= Price) {
                                    UpdateWallet(req.body.provider_id, wallet.balance - Price)
                                        .then(
                                            wal => {
                                                if (wal) {
                                                    findServiceTop(req.body.service_id)
                                                        .then(
                                                            sevTop => {
                                                                if (sevTop) {
                                                                    ServicesTop.findOneAndUpdate(
                                                                        {service_id: req.body.service_id},
                                                                        {isActived: dat.updateDays(date, sevTop.create_end).getTime()},
                                                                        {new: true},
                                                                        function (err, SVTop) {
                                                                            if (err) {
                                                                                res.json({
                                                                                    "response": false,
                                                                                    "message": 6,
                                                                                    "value": "update service top loi"
                                                                                });
                                                                            } else {
                                                                                FindWallet(req.body.provider_id)
                                                                                    .then(
                                                                                        walletafter => {
                                                                                            res.json({
                                                                                                "response": walletafter,
                                                                                                "value": true
                                                                                            });
                                                                                        },
                                                                                        err => {
                                                                                            res.json({
                                                                                                "response": [],
                                                                                                "value": false
                                                                                            });
                                                                                        });
                                                                            }
                                                                        });
                                                                } else {
                                                                    ServicesTop.create({
                                                                        service_id: req.body.service_id,
                                                                        provider_id: req.body.provider_id,
                                                                        create_at: Date.now(),
                                                                        create_end: dat.addDays(date).getTime()
                                                                    }, function (err, service) {
                                                                        if (err) res.json({"response": [], "value": false});
                                                                        else
                                                                            FindWallet(req.body.provider_id)
                                                                                .then(
                                                                                    walletafter => {
                                                                                        res.json({
                                                                                            "response": walletafter,
                                                                                            "value": true
                                                                                        });
                                                                                    },
                                                                                    err => {
                                                                                        res.json({"response": [], "value": false});
                                                                                    });
                                                                    });
                                                                }
                                                            },
                                                            err => {
                                                                res.json({
                                                                    "response": false,
                                                                    "message": 5,
                                                                    "value": "truyen thieu bien"
                                                                });
                                                            }
                                                        );

                                                    Historypayment.create({
                                                        user_id: req.body.provider_id,
                                                        payment: Price,
                                                        service: message,
                                                        create_at: Date.now(),
                                                        content_service:Name,
                                                    }, function (err, htr) {
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
