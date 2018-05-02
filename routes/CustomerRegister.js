const express = require('express');
const router = express.Router();
const Providers = require('../models/serviceproviderdata');
const Customer  = require('../models/customerdata');
//~ var passwordHash = require('password-hash');
const passwordHash = require("node-php-password");
const Wallet = require('../models/wallet');
const request_promise = require('request-promise');
// file config use to config all port,
const config = require('../config');
const urlapi = config.urlapi;


let FindProviderfollowemail = (email) =>{
    return new Promise((resolve, reject) => {
        Providers.findOne({
            'email': email
        }, function (err, user) {
            if (err) return reject(new Error('loi tim id: ' + email));
            resolve(user);
        });
    });
}

let FindCustomerfollowemail = (email) =>{
    return new Promise((resolve, reject) => {
        Customer.findOne({
            'email': email
        }, function (err, user) {
            if (err) return reject(new Error('loi tim id: ' + email));
            resolve(user);
        });
    });
}

let RegisterCustomer = (customer) =>{
    return new Promise((resolve, reject) => {
        let hashedPassword = passwordHash.hash(customer.password);
        Customer.create({
            firstname: customer.first_name,
            lastname: customer.last_name,
            email: customer.email,
            password: hashedPassword,
            mobile: customer.mobile_number,
            building_name: customer.building_name,
            postal_code: customer.postal_code,
            city: customer.city,
            country: customer.country,
            birth_date: customer.birth_date,
            sex: customer.sex,
            home_number: customer.home_number,
            address1: customer.address1,
            address2: customer.address2,
            device_token: customer.device_token,
            device_token_old: "",
            occupation: customer.occupation,
            //Set true value for test
            isActived: false,
            member_ship: 0,
            member_ship_time: 0,
            confirm_status: 0
        }, function (err, user) {
            if (err) return reject(new Error('RegisterProvider: ' + customer));
            resolve(user);
        });
    });
}


let CreateWallet = (providerID) =>{
    return new Promise((resolve, reject) => {
          Wallet.create({
              user_id: providerID,
              balance: 0
        }, function (err, wl) {
            if (err) return reject(new Error('CreateWallet: ' + providerID));
            resolve(wl);
        });
    });
}


let SendMail = (email, firstname, lastname) =>{
    return new Promise((resolve, reject) => {
        //SEND MAIL HERE
        var options = {
            method: 'POST',
            uri: urlapi + '/qooservice/php/api_mail_register.php',
            form: {
                // Like <input type="text" name="name">
                PtxtMAil: email,
                PtxtFName: firstname,
                PtxtLName: lastname
            },
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            }
        };

        request_promise(options)
            .then(function (body) {
                // POST succeeded...
                console.log(body);
                let obj = JSON.parse(body);
                if (obj.response === true) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            })
            .catch(function (err) {
                if (err) return reject(err);
            });
    });
}


router.post("/", function (req, res) {
    FindProviderfollowemail(req.body.email)
        .then(provider => {
            if (provider){
                res.json({
                    "response": false,
                    "value":"email Registered provider"
                });
            }else{
                FindCustomerfollowemail(req.body.email)
                    .then(customer => {
                        if (customer) {
                            res.json({
                                "response": false,
                                "value":"email Registered Customer"
                            });
                        }else
                        if (customer === null){
                            RegisterCustomer(req.body)
                                .then(user => {
                                    if (user){
                                        CreateWallet(user._id)
                                            .then(
                                                wl => {},
                                                err => {console.log(err)}
                                            );
                                        SendMail(user.email, user.firstname,user.lastname )
                                            .then(
                                                result => {
                                                    if (result){
                                                        res.json({
                                                            "response": true,
                                                            "_id": user._id,
                                                            "sendmail": result
                                                        });
                                                    }else{
                                                        res.json({
                                                            "response": false,
                                                            "_id": user._id,
                                                            "sendmail": result
                                                        });
                                                    }
                                                }
                                                ,err=>{
                                                    console.log(err);
                                                    res.json({
                                                        "response": false,
                                                        "value":err
                                                    });
                                                }
                                            );
                                    }else{
                                        res.json({
                                            "response": false,
                                            "value":"Register fail"
                                        });
                                    }
                                }, err => {
                                    console.log(err);
                                    res.json({
                                        "response": false,
                                        "value":err
                                    });
                                })
                        }
                    }, err => {
                        console.log(err);
                        res.json({
                            "response": false,
                            "value":err
                        });
                    })
            }
        }, err => {
            console.log(err);
            res.json({
                "response": false,
                "value":err
            });
        });
});

module.exports = router;