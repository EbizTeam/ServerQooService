const sortBy = require('array-sort');
const express = require('express');
const routes = express.Router();
const Services = require('../models/services');
const findProvider = require('../models/finduserfolloweid');
var Async = require("async");


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
                    err=>{callback(err)}
                );
        }, function (err) {
            if (err)  reject(err);
            // configs is now a map of JSON data
            resolve(service_providers);
        });
    });
}

let sortandtoservice = async (servicesname, socket) => {
    let service_providers = [];
    let services = [];
    await findMemberShip(servicesname)
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
                                services.push(sv);
                            }
                            callback();
                        });
                }, function (err) {
                    // configs is now a map of JSON data
                    socket.emit("search", {'response': services, 'path': path});
                });
            }
        },
        err => {
            console.log(err)
        }
    );
}

exports.initialize = function (server,io) {

    //let io = require('socket.io')(server);

    io.of('/searchservice')
        .on('connection', function (socket) {
            console.log("connect " + socket.id);
            socket.on("search", function (data) {
                var query = {name: {$regex: data, $options: 'i'}};
                Services.find(query,
                    function (err, servicesname) {

                        if (servicesname) {
                            sortandtoservice(servicesname, socket);
                        }
                    });
            });
        });
};