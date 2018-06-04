'use strict';
const Services = require('../models/services');
const ServicesTop = require('../models/servicesbuytop');
const Async = require("async");
const sortBy = require('array-sort');
const Historypayment = require('../models/historypayment');
const Comment = require('../models/comments');
const ServiceProvider = require('../models/serviceproviderdata');

let FindServiceTop = () => {
    return new Promise((resolve, reject) => {
        let allService = [];
        ServicesTop.find({}, function (err, SVTop) {
            if (err) return reject(err);
            Async.forEachOf(SVTop, function (item, key, callback) {
                Services.findOne({"_id": item.service_id}, function (err, service) {
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
                    allProvider.push(Object.assign( JSON.parse(JSON.stringify(item)),{
                        member_ship: SVPro.member_ship,
                        member_ship_time: SVPro.member_ship_time,
                        no_of_hight_recommended:SVPro.no_of_hight_recommended,
                        no_of_recommended:SVPro.no_of_recommended,
                        no_of_neutral:SVPro.no_of_neutral,
                        no_of_not_recommended: SVPro.no_of_not_recommended,
                    }));
                } else {
                    allProvider.push(item);
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
                                            return resolve(serSor.slice((0 + page-1)*10, page*10));
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

exports.list_all_services = function (req, res) {
    FindServiceTop()
        .then(
            serTop => {
                findProviderService(serTop)
                    .then(
                        serPro => {
                            sortServiceProvider(serPro)
                                .then(
                                    serSor => {
                                        return res.json({"response": serSor.slice(0, 10), "value": true});
                                    },
                                    err => {
                                        return res.json({"response": err, "value": false});
                                    }
                                );

                        },
                        err => {
                            return res.json({"response": err, "value": false});
                        }
                    );
            },
            err => {
                return res.json({"response": err, "value": false});
            }
        );
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


