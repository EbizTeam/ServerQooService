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
            if (err) return reject(new Error('loi tim id: ' + id));
            resolve(user);
        });
    });
}

let FindCustomerfollowemail = (email) =>{
    return new Promise((resolve, reject) => {
        Customer.findOne({
            'email': email
        }, function (err, user) {
            if (err) return reject(new Error('loi tim id: ' + id));
            resolve(user);
        });
    });
}

let RegisterProvider = (provider) =>{
    return new Promise((resolve, reject) => {
        let hashedPassword = passwordHash.hash(provider.password);
        Providers.create({
            firstname: provider.first_name,
            lastname: provider.last_name,
            email: provider.email,
            password: hashedPassword,
            mobile: provider.mobile_number,
            building_name: provider.building_name,
            postal_code: provider.postal_code,
            city: provider.city,
            country: provider.country,
            birth_date: provider.birth_date,
            sex: provider.sex,
            company_name: provider.company_name,
            retail_outlets: provider.retail_outlets,
            any_operation_overseas: provider.any_operation_overseas,
            status: provider.status,
            businesstitle_position: provider.businesstitle_position,
            job_responsibilities: provider.job_responsibilities,
            office_number: provider.office_number,
            main_office_address1: provider.main_office_address1,
            main_office_address2: provider.main_office_address2,
            device_token: provider.device_token,
            device_token_old: "",
            isActived: false,
            create_at: Date.now(),
            member_ship: 1,
            member_ship_time: 0,
            confirm_status: 0,
            no_of_not_recommended: 0,
            no_of_hight_recommended: 0,
            no_of_recommended: 0,
            no_of_neutral: 0,
            no_of_not_recommended: 0
        }, function (err, user) {
            if (err) return reject(new Error('RegisterProvider: ' + provider));
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


router.post("/update_service_provider", function (req, res) {
    let myquery = {
        _id: req.body._id
    };

    let newvalues = {
        $set: {
            firstname: req.body.first_name,
            lastname: req.body.last_name,
            mobile: req.body.mobile_number,
            building_name: req.body.building_name,
            postal_code: req.body.postal_code,
            city: req.body.city,
            country: req.body.country,
            birth_date: req.body.birth_date,
            sex: req.body.sex,
            company_name: req.body.company_name,
            retail_outlets: req.body.retail_outlets,
            any_operation_overseas: req.body.any_operation_overseas,
            businesstitle_position: req.body.businesstitle_position,
            job_responsibilities: req.body.job_responsibilities,
            office_number: req.body.office_number,
            main_office_address1: req.body.main_office_address1,
            main_office_address2: req.body.main_office_address2,
            maps_latitude: req.body.maps_latitude,
            maps_longitude: req.body.maps_longitude,
            updated_at: Date.now(),
        }
    };
    Providers.updateOne(myquery, newvalues, function (err, res) {
        if (err) {
            res.json({
                response:err,
                value:false
            });
        }else{
            res.json({
                response:res.result.ok,
                value:true
            });
        }
    });


});

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
                        if (customer){
                            res.json({
                                "response": false,
                                "value":"email Registered customer"
                            });
                        }else{
                            RegisterProvider(req.body)
                                .then(user => {
                                    if (user){
                                        Wallet.findOne({
                                            "user_id":user._id
                                        },function (err, wlet) {
                                            if(wlet === null){
                                                CreateWallet(user._id)
                                                    .then(
                                                        wl => {},
                                                        err => {console.log(err)}
                                                    );
                                            }
                                        });
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