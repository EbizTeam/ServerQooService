const express = require('express');
const router = express.Router();
const Services = require('../models/services');
const ServicesTop = require('../models/servicesbuytop');
const findProvider = require('../models/finduserfolloweid');
const Async = require("async");
const sortBy = require('array-sort');

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
                    else if (services.length > 20){
                        let service20 = [];
                        let i = 0;
                        Async.forEachOf(services, function (item, key, callback) {
                            i++;
                            if(i <= 20){service20.push(item);}
                            callback();
                        }, function (err) {
                            // configs is now a map of JSON data
                            res.json({"response": service20, "value":true});
                        });
                    }   else{
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

router.post("/create", function (req, res) {
    ServicesTop.create({
        service_id: req.body.service_id,
        create_buy: Date.now(),
        create_end: Date.now()
    },function (err, service ) {
        if (err) res.json({"response": [], "value":false});
        res.json({"response": service, "value":false});
    });
});

module.exports = router;