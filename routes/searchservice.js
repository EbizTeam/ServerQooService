const sortBy = require('array-sort');
const express = require('express');
const routes = express.Router();
const Services = require('../models/services');
const ServiceProvider = require('../models/serviceproviderdata');
const findProvider = require('../models/finduserfolloweid');
var Async = require("async");


//add a new to the db
routes.post("/", function (req, res) {
    if (req.body.searchtext) {
        if (req.body.filter == 1) {
            let query = {company_name: {$regex: req.body.searchtext, $options: 'i'}};
            ServiceProvider.find(query,
                function (err, provider) {
                    if (err) {
                        res.json({"response": [], "value": false});
                    }
                    else if (provider) {
                        sortOject(provider)
                            .then(
                                providers => {
                                    if (providers.length > 0) {
                                        let services = [];
                                        Async.forEachOf(providers, function (serPro, key, callback) {
                                            Services.find({provider_id: serPro._id},
                                                function (err, servicesm) {
                                                    if (err) return callback(err)
                                                    if (servicesm) {
                                                        Async.forEachOf(servicesm, function (sv, key, callback) {
                                                            sv.detail = '/qooservice/system/public/provider/servicedetail/' + sv.detail;
                                                            // let images = [];
                                                            // Async.forEachOf(sv.image, function (image, key, callback) {
                                                            //     images.push('/qooservice/system/public/uploadfile/services/' + image);
                                                            //     callback();
                                                            // },function (err) {
                                                            //     sv.image = images;
                                                            //     services.push(sv);
                                                            // });
                                                            callback();
                                                        }, function (err) {

                                                        });
                                                    }
                                                    callback();
                                                });
                                        }, function (err) {
                                            // configs is now a map of JSON data
                                            if (err)  res.json({"response": [], "value": false});
                                            res.json({"response": services, "value": true});
                                        });
                                    } else {
                                        res.json({"response": [], "value": false});
                                    }
                                }
                                , err => {
                                    res.json({"response": [], "value": false});
                                }
                            )
                    } else {
                        res.json({"response": [], "value": false});
                    }
                });
        } else {
            let query = {name: {$regex: req.body.searchtext, $options: 'i'}};
            Services.find(query,
                function (err, servicesname) {
                    if (servicesname) {
                        sortandtoservice(servicesname, res);
                    } else {
                        res.json({"response": [], "value": false});
                    }
                });

        }
    }

});


let sortOject = (service_providers) => {
    return new Promise((resolve, reject) => {
        if (service_providers) {
            let value4 = sortBy(service_providers, 'name');
            let value3 = sortBy(value4, 'no_of_neutral', {reverse: true});
            let value2 = sortBy(value3, 'no_of_recommended', {reverse: true});
            let value1 = sortBy(value2, 'no_of_hight_recommended', {reverse: true});
            let value = sortBy(value1, 'member_ship', {reverse: true});
            resolve(value);
        }
        else return reject(new Error('loi tim id: ' + id));
    });
}

let path = {'path': '/qooservice/system/public/uploadfile/services/'};

let findMemberShip = (servicesname) => {
    return new Promise((resolve, reject) => {
        let service_providers = [];
        Async.forEachOf(servicesname, function (item, key, callback) {
            findProvider(item.provider_id)
                .then(
                    provider => {
                        if (provider) {
                            noti = {
                                id: item._id,
                                name: item.name,
                                member_ship: provider.member_ship,
                                no_of_hight_recommended: provider.no_of_hight_recommended,
                                no_of_recommended: provider.no_of_recommended,
                                no_of_neutral: provider.no_of_neutral,
                            }
                            service_providers.push(noti);
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

let sortandtoservice = async (servicesname, res) => {
    let service_providers = [];
    let services = [];
    await findMemberShip(servicesname)
        .then(serviceProviders => {
            if (serviceProviders) {
                service_providers = serviceProviders;
            }
        }, err => {
            if (err) res.json({"response": [], "value": false});
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
                    res.json({"response": services, "value": true});
                });
            }
        },
        err => {
            if (err) res.json({"response": [], "value": false});
        }
    );
}


module.exports = routes;
