'use strict';
const Services = require('../models/services');
const ServicesTop = require('../models/servicesbuytop');
const Async = require("async");
const sortBy = require('array-sort');
const Comment = require('../models/comments');
const ServiceProvider = require('../models/serviceproviderdata');

let FindServiceTop = () => {
    return new Promise((resolve, reject) => {
        let allService = [];
        ServicesTop.find({}, function (err, SVTop) {
            if (err) return reject(err);
            Async.forEachOf(SVTop, function (item, key, callback) {
                Services.findOne({"_id": item.service_id, active: true}, function (err, service) {
                    if (err) return callback(err);
                    if (service) {
                        service.updated_at = item.create_at;
                        allService.push(service);
                    } else {
                        return callback(err);
                    }
                    callback();
                });
            }, function (err) {
                if (err) reject(err);
                // configs is now a map of JSON data
                resolve(allService);
            });
        });

    });
}


let findProviderService = (service) => {
    return new Promise((resolve, reject) => {
        let allProvider = [];
        Async.forEachOf(service, function (item, key, callback) {
            ServiceProvider.findOne({"_id": item.provider_id}, function (err, SVPro) {
                if (err) return callback(err);
                if (SVPro) {
                    item.detail = '/qooservice/system/public/provider/servicedetail/' + item.detail;
                    // let images = [];
                    // Async.forEachOf(item.image, function (image, key, callback) {
                    //     images.push('/qooservice/system/public/uploadfile/services/' + image);
                    //     callback();
                    // }, function (err) {
                    //     // configs is now a map of JSON data
                    //     item.image = images;
                    // });
                    allProvider.push(Object.assign(JSON.parse(JSON.stringify(item)), {
                        member_ship: SVPro.member_ship,
                        member_ship_time: SVPro.member_ship_time,
                        no_of_hight_recommended: SVPro.no_of_hight_recommended,
                        no_of_recommended: SVPro.no_of_recommended,
                        no_of_neutral: SVPro.no_of_neutral,
                        no_of_not_recommended: SVPro.no_of_not_recommended,
                    }));
                }
                callback();
            });
        }, function (err) {
            if (err) reject(err);
            // configs is now a map of JSON data
            resolve(allProvider);
        });

    });
}

let sortServiceProvider = (services) => {
    return new Promise(async (resolve, reject) => {
        if (services) {
            let updated_at = await sortBy(services, 'updated_at', {reverse: false});
            let no_of_not_recommended = await sortBy(updated_at, 'no_of_not_recommended', {reverse: false});
            let no_of_neutral = await sortBy(no_of_not_recommended, 'no_of_neutral', {reverse: true});
            let no_of_recommended = await sortBy(no_of_neutral, 'no_of_recommended', {reverse: true});
            let no_of_hight_recommended = await sortBy(no_of_recommended, 'no_of_hight_recommended', {reverse: true});
            let member_ship = await sortBy(no_of_hight_recommended, 'member_ship', {reverse: true});
            resolve(member_ship);
        }
        else return reject(new Error('loi tim soert '));
    });
}

let pagingTopService = (page) => {
    return new Promise(async (resolve, reject) => {
        FindServiceTop()
            .then(
                serTop => {
                    findProviderService(serTop)
                        .then(
                            serPro => {
                                sortServiceProvider(serPro)
                                    .then(
                                        serSor => {
                                            return resolve(serSor.slice((0 + page - 1) * 10, page * 10));
                                        },
                                        err => {
                                            return reject(err);
                                        }
                                    );
                            },
                            err => {
                                return reject(err);
                            }
                        );
                },
                err => {
                    return reject(err);
                }
            );
    });

}

// find top comment
let FindServiceTopComment = () => {
    return new Promise((resolve, reject) => {
        let allService = [];
        Services.find({active: true}, function (err, services) {
            if (err) return reject(err);
            Async.forEachOf(services, function (item, key, callback) {
                item.detail = '/qooservice/system/public/provider/servicedetail/' + item.detail;
                // let images = [];
                // Async.forEachOf(item.image, function (image, key, callback) {
                //     images.push('/qooservice/system/public/uploadfile/services/' + image);
                //     callback();
                // }, function (err) {
                //     // configs is now a map of JSON data
                //     item.image = images;
                // });
                Comment.find({services_id: item._id}, function (err, comms) {
                    if (err) return callback(err)
                    if (comms) {
                        let rate_services = 0;
                        let rate_attitude = 0;
                        let rate_price = 0;
                        let rate_friendliness = 0;
                        let rate_servicestrue = 0;
                        let rate_attitudetrue = 0;
                        let rate_pricetrue = 0;
                        let rate_friendlinesstrue = 0;
                        let High = 0;
                        let Recommended = 0;
                        let Neutral = 0;
                        let Not_Recommended = 0;
                        Async.forEachOf(comms, function (comm, key, callback) {
                            if (comm.rate_services === '1') {
                                rate_servicestrue = rate_servicestrue + 1;
                            } else {
                                rate_services = rate_services + 1;
                            }
                            if (comm.rate_attitude === '1') {
                                rate_attitudetrue = rate_attitudetrue + 1;
                            } else {
                                rate_attitude = rate_attitude + 1;
                            }
                            if (comm.rate_price === '1') {
                                rate_pricetrue = rate_pricetrue + 1;
                            } else {
                                rate_price = rate_price + 1;
                            }
                            if (comm.rate_services === '1') {
                                rate_friendlinesstrue = rate_friendlinesstrue + 1;
                            } else {
                                rate_friendliness = rate_friendliness + 1;
                            }
                            switch (comm.recommenrded_this_provider) {
                                case "1":
                                    High++;
                                    break;
                                case "2":
                                    Recommended++;
                                    break;
                                case "3":
                                    Neutral++;
                                    break;
                                case "4":
                                    Not_Recommended++;
                                    break;
                                default:
                            }

                            callback();
                        }, function (err) {
                            // configs is now a map of JSON data
                            if (err) reject(err);
                            else {
                                allService.push(Object.assign(JSON.parse(JSON.stringify(item)), {
                                    rate_services: rate_services,
                                    rate_attitude: rate_attitude,
                                    rate_price: rate_price,
                                    rate_friendliness: rate_friendliness,
                                    rate_servicestrue: rate_servicestrue,
                                    rate_attitudetrue: rate_attitudetrue,
                                    rate_pricetrue: rate_pricetrue,
                                    rate_friendlinesstrue: rate_friendlinesstrue,
                                    High: High,
                                    Recommended: Recommended,
                                    Neutral: Neutral,
                                    Not_Recommended: Not_Recommended,
                                    total_comment: comms.length,
                                }));
                            }
                        });
                    }
                    callback();
                });
            }, function (err) {
                // configs is now a map of JSON data
                if (err) reject(err);
                else {
                    resolve(allService);
                }
            });
        });

    });
}

//sort top comment
let sortServiceComment = (services) => {
    return new Promise(async (resolve, reject) => {
        if (services) {
            let Not_Recommended = await sortBy(services, 'Not_Recommended', {reverse: true});
            let Neutral = await sortBy(Not_Recommended, 'Neutral', {reverse: true});
            let Recommended = await sortBy(Neutral, 'Recommended', {reverse: true});
            let High = await sortBy(Recommended, 'High', {reverse: true});
            let rate_services = await sortBy(High, 'rate_services', {reverse: false});
            let rate_attitude = await sortBy(rate_services, 'rate_attitude', {reverse: false});
            let rate_price = await sortBy(rate_attitude, 'rate_price', {reverse: false});
            let rate_friendliness = await sortBy(rate_price, 'rate_friendliness', {reverse: false});
            let rate_servicestrue = await sortBy(rate_friendliness, 'rate_servicestrue', {reverse: true});
            let rate_attitudetrue = await sortBy(rate_servicestrue, 'rate_attitudetrue', {reverse: true});
            let rate_pricetrue = await sortBy(rate_attitudetrue, 'rate_pricetrue', {reverse: true});
            let rate_friendlinesstrue = await sortBy(rate_pricetrue, 'rate_friendlinesstrue', {reverse: true});
            let total_comment = await sortBy(rate_friendlinesstrue, 'total_comment', {reverse: true});
            resolve(total_comment);
        }
        else return reject(new Error('loi tim soert '));
    });
}

//paging top service comment
let pagingTopServiceComment = (page) => {
    return new Promise(async (resolve, reject) => {
        FindServiceTopComment()
            .then(
                serCom => {
                    sortServiceComment(serCom)
                        .then(
                            serSor => {
                                return resolve(serSor.slice((0 + page - 1) * 10, page * 10));
                            },
                            err => {
                                return reject(err);
                            }
                        );
                },
                err => {
                    return reject(err);
                }
            );
    });

}

// find service follow provider have memberhsip hight
let FindServiceProvider = () => {
    return new Promise((resolve, reject) => {
        let allService = [];
        ServiceProvider.find({isActived: true}, function (err, providers) {
            if (err) return reject(err);
            Async.forEachOf(providers, function (svprovider, key, callback) {
                Services.find({provider_id: svprovider._id, active: true}, function (err, services) {
                    if (err) return callback(err);
                    if (services.length > 0) {
                        Async.forEachOf(services.slice(0, 3), function (serv, key, callback) {
                            serv.detail = '/qooservice/system/public/provider/servicedetail/' + serv.detail;
                            // let images = [];
                            // Async.forEachOf(serv.image, function (image, key, callback) {
                            //     images.push('/qooservice/system/public/uploadfile/services/' + image);
                            //     callback();
                            // }, function (err) {
                            //     // configs is now a map of JSON data
                            //     if (err) reject(err);
                            //     serv.image = images;
                            // });
                            allService.push(Object.assign(JSON.parse(JSON.stringify(serv)), {
                                member_ship: svprovider.member_ship,
                                member_ship_time: svprovider.member_ship_time,
                                no_of_hight_recommended: svprovider.no_of_hight_recommended,
                                no_of_recommended: svprovider.no_of_recommended,
                                no_of_neutral: svprovider.no_of_neutral,
                                no_of_not_recommended: svprovider.no_of_not_recommended,
                            }));
                            callback();
                        }, function (err) {
                        });
                    }
                    callback();
                });
            }, function (err) {
                // configs is now a map of JSON data
                if (err) reject(err);
                else {
                    resolve(allService);
                }
            });
        });

    });
}

//sort servide membership
let sortServiceMembership = (services) => {
    return new Promise(async (resolve, reject) => {
        if (services) {
            let no_of_not_recommended = await sortBy(services, 'no_of_not_recommended', {reverse: false});
            let member_ship_time = await sortBy(no_of_not_recommended, 'member_ship_time', {reverse: false});
            let no_of_neutral = await sortBy(member_ship_time, 'no_of_neutral', {reverse: true});
            let no_of_recommended = await sortBy(no_of_neutral, 'no_of_recommended', {reverse: true});
            let no_of_hight_recommended = await sortBy(no_of_recommended, 'no_of_hight_recommended', {reverse: true});
            let member_ship = await sortBy(no_of_hight_recommended, 'member_ship', {reverse: true});
            resolve(member_ship);
        }
        else return reject(new Error('loi tim soert '));
    });
}

// paging service top membership
let pagingTopServiceMembership = (page) => {
    return new Promise(async (resolve, reject) => {
        FindServiceProvider()
            .then(
                serPro => {
                    sortServiceMembership(serPro)
                        .then(
                            serSor => {
                                return resolve(serSor.slice((0 + page - 1) * 10, page * 10));
                            },
                            err => {
                                return reject(err);
                            }
                        );
                },
                err => {
                    return reject(err);
                }
            );
    });

}

////top service new
let FindServiceNew = () => {
    return new Promise((resolve, reject) => {
        let allService = [];
        Services.find({active: true}, function (err, services) {
            if (err) return reject(err);
            Async.forEachOf(services, function (item, key, callback) {
                item.detail = '/qooservice/system/public/provider/servicedetail/' + item.detail;
                // let images = [];
                // Async.forEachOf(item.image, function (image, key, callback) {
                //     images.push('/qooservice/system/public/uploadfile/services/' + image);
                //     callback();
                // }, function (err) {
                //     // configs is now a map of JSON data
                //     item.image = images;
                // });
                allService.push(item);
                callback();
            }, function (err) {
                // configs is now a map of JSON data
                if (err) reject(err);
                else {
                    resolve(allService);
                }
            });
        });

    });
}

//sort servide new and abc
let sortServiceNew = (services) => {
    return new Promise(async (resolve, reject) => {
        if (services) {
            let ascending = await sortBy(services, 'name',{reverse: false});
            let create_at = await sortBy(ascending, 'create_at', {reverse: true});
            resolve(create_at);
        }
        else return reject(new Error('loi tim sort '));
    });
}


// paging service new
let pagingTopServiceNew = (page) => {
    return new Promise(async (resolve, reject) => {
        FindServiceNew()
            .then(
                serNew => {
                    sortServiceNew(serNew)
                        .then(
                            serSor => {
                                return resolve(serSor.slice((0 + page - 1) * 10, page * 10));
                            },
                            err => {
                                return reject(err);
                            }
                        );
                },
                err => {
                    return reject(err);
                }
            );
    });

}


////top sale
let FindServiceSale = () => {
    return new Promise((resolve, reject) => {
        let allService = [];
        Services.find({active: true}, function (err, services) {
            if (err) return reject(err);
            Async.forEachOf(services, function (item, key, callback) {
                item.detail = '/qooservice/system/public/provider/servicedetail/' + item.detail;
                // let images = [];
                // Async.forEachOf(item.image, function (image, key, callback) {
                //     images.push('/qooservice/system/public/uploadfile/services/' + image);
                //     callback();
                // }, function (err) {
                //     // configs is now a map of JSON data
                //     item.image = images;
                // });
                allService.push(Object.assign(JSON.parse(JSON.stringify(item)),{
                    percent:item.old_price/item.sell_price
                }));
                callback();
            }, function (err) {
                // configs is now a map of JSON data
                if (err) reject(err);
                else {
                    resolve(allService);
                }
            });
        });

    });
}

//sort servide new and abc
let sortServiceSale = (services) => {
    return new Promise(async (resolve, reject) => {
        if (services) {
            let ascending = await sortBy(services, 'name',{reverse: false});
            let percent = await sortBy(ascending, 'percent', {reverse: true});
            resolve(percent);
        }
        else return reject(new Error('loi tim sort '));
    });
}


// paging service new
let pagingTopServiceSale = (page) => {
    return new Promise(async (resolve, reject) => {
        FindServiceSale()
            .then(
                serNew => {
                    sortServiceSale(serNew)
                        .then(
                            serSor => {
                                return resolve(serSor.slice((0 + page - 1) * 10, page * 10));
                            },
                            err => {
                                return reject(err);
                            }
                        );
                },
                err => {
                    return reject(err);
                }
            );
    });

}

exports.list_all_services = async function (req, res) {
    let page = 1;
    let allServices = [];
   await pagingTopService(page)
        .then(
            serSor => {
                allServices.push({
                    type:1,
                    topbuy:serSor
                })
            },
            err => {
                console.log(err);
            }
        );

    await pagingTopServiceComment(page)
        .then(
            serSor => {
                allServices.push({
                    type:2,
                    topComment:serSor
                })
            },
            err => {
                console.log(err);
            }
        );
    await pagingTopServiceMembership(page)
        .then(
            serSor => {
                allServices.push({
                    type:3,
                    topMembership:serSor
                })
            },
            err => {
                console.log(err);
            }
        );

    await pagingTopServiceNew(page)
        .then(
            serSor => {
                allServices.push({
                    type:4,
                    servicenew:serSor
                })
            },
            err => {
                console.log(err);
            }
        );
    await pagingTopServiceSale(page)
        .then(
            serSor => {
                allServices.push({
                    type:5,
                    servicesale:serSor
                })
            },
            err => {
                console.log(err);
            }
        );
    return res.json({"response": allServices, "value": true});
};

exports.list_all_top_buy_services = function (req, res) {
    let page = req.params.page;
    pagingTopService(page)
        .then(
            serSor => {
                return res.json({"response": serSor, "value": true});
            },
            err => {
                return res.json({"response": err, "value": false});
            }
        );
};

exports.list_all_top_comment_services = function (req, res) {
    let page = req.params.page;
    pagingTopServiceComment(page)
        .then(
            serSor => {
                return res.json({"response": serSor, "value": true});
            },
            err => {
                return res.json({"response": err, "value": false});
            }
        );
};

exports.list_all_top_membership_services = function (req, res) {
    let page = req.params.page;
    pagingTopServiceMembership(page)
        .then(
            serSor => {
                return res.json({"response": serSor, "value": true});
            },
            err => {
                return res.json({"response": err, "value": false});
            }
        );
};

exports.list_all_services_new = function (req, res) {
    let page = req.params.page;
    pagingTopServiceNew(page)
        .then(
            serSor => {
                return res.json({"response": serSor, "value": true});
            },
            err => {
                return res.json({"response": err, "value": false});
            }
        );
};

exports.list_all_services_sale = function (req, res) {
    let page = req.params.page;
    pagingTopServiceSale(page)
        .then(
            serSor => {
                return res.json({"response": serSor, "value": true});
            },
            err => {
                return res.json({"response": err, "value": false});
            }
        );
};


//find service follow provider id
let FindServiceProviderID = (providerID) => {
    return new Promise(async (resolve, reject) => {
        Services.find({
            provider_id:providerID,
            active: true,
        },function (err, services) {
            if (err) return reject(err);
            resolve(services);
        });
    });
}

//sort servide new and abc
let sortService = (services) => {
    return new Promise(async (resolve, reject) => {
        if (services) {
            let ascending = await sortBy(services, 'create_at',{reverse: false});
            let percent = await sortBy(ascending, 'name', {reverse: true});
            resolve(percent);
        }
        else return reject(new Error('loi tim sort '));
    });
}


// paging service new
let pagingServiceProvider = (page,provierID) => {
    return new Promise(async (resolve, reject) => {
        FindServiceProviderID(provierID)
            .then(
                serNew => {
                    sortService(serNew)
                        .then(
                            serSor => {
                                return resolve(serSor.slice((0 + page - 1) * 10, page * 10));
                            },
                            err => {
                                return reject(err);
                            }
                        );
                },
                err => {
                    return reject(err);
                }
            );
    });

}

exports.list_service_follow_provider = function (req, res) {
    let {page, provider_id} = req.body;
    pagingServiceProvider(page,provider_id)
        .then(
            serSor => {
                return res.json({"response": serSor, "value": true});
            },
            err => {
                return res.json({"response": err, "value": false});
            }
        );
};


