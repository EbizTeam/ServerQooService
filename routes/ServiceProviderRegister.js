const express = require('express');
const router = express.Router();
const Providers = require('../models/serviceproviderdata');
const Customer = require('../models/customerdata');
const CountRegister = require('../controllers/countRegisterController');
//~ var passwordHash = require('password-hash');
const passwordHash = require("node-php-password");
const Wallet = require('../models/wallet');
const request_promise = require('request-promise');
// file config use to config all port,
const config = require('../config');
const urlapi = config.urlapi;
const urlPHP = config.APathPHP;
const multer = require('multer');
const path = require('path');
const fs = require('fs');


let FindProviderfollowemail = (email) => {
    return new Promise((resolve, reject) => {
        Providers.findOne({
            'email': email
        }, function (err, user) {
            if (err) return reject(new Error('loi tim id: ' + id));
            resolve(user);
        });
    });
};

let FindCustomerfollowemail = (email) => {
    return new Promise((resolve, reject) => {
        Customer.findOne({
            'email': email
        }, function (err, user) {
            if (err) return reject(new Error('loi tim id: ' + id));
            resolve(user);
        });
    });
};

let RegisterProvider = (provider) => {
    return new Promise(async (resolve, reject) => {
        let hashedPassword = await passwordHash.hash(provider.password);
        let newProvider = await new Providers(provider);
            newProvider.password = await hashedPassword;
            newProvider.firstname = await provider.first_name;
            newProvider.linkweb = await provider.company_name;
            newProvider.lastname = await provider.last_name;
            newProvider.mobile = await provider.mobile_number;
        newProvider.save( function (err, user) {
            if (err) return reject(new Error('RegisterProvider: ' + provider));
            resolve(user);
        });
    });
};


let CreateWallet = (providerID) => {
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


let SendMail = (email, firstname, lastname) => {
    return new Promise((resolve, reject) => {
        //SEND MAIL HERE
        var options = {
            method: 'POST',
            uri: urlapi + config.api_mail_register,
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


//upload file
var Storage = multer.diskStorage({
    destination: urlPHP + '/system/public/uploadfile/avatar',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() +
            path.extname(file.originalname));
    }


});

var upload = multer({
    storage: Storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.png'
            && ext !== '.jpg'
            && ext !== '.jpeg'
        ) {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    },
    limits: {
        fileSize: 6000000
    }
}).single('avatar'); //Field name and max count


router.post("/update_service_provider/avatar", function (req, res) {

    upload(req, res, function (err) {
        if (err) {
            res.json({
                "response": Error,
                "value": false
            });
        } else {

            try {
                fs.unlinkSync(urlPHP + '/system/public/uploadfile/avatar/' + req.body.logo_provider);
            } catch (err) {
                console.log(err);
            }

            let myquery = {
                _id: req.body._id
            };

            let newvalues = {
                $set: {
                    logo_provider: req.file.filename,
                    updated_at: Date.now(),
                }
            };
            Providers.updateOne(myquery, newvalues, function (err, pro) {
                if (err) {
                    res.json({
                        response: err,
                        value: false
                    });
                } else {
                    res.json({
                        response: req.file.filename,
                        value: true
                    });
                }
            });
        }
    });


});

router.put("/update_service_provider/:proId",function(req, res) {
    Providers.findOneAndUpdate({_id:req.params.proId}, req.body, {new: true}, function(err, pro) {
        if (err) {
            res.json({
                response:err,
                value:false
            });
        }else{
            if (pro) {
                pro.password = undefined;
                res.json({
                    response:pro,
                    value:true
                });
            }else{
                res.json({
                    response:"id not find",
                    value:false
                });
            }

        }
    });
});

router.post("/update_service_provider/info",async function (req, res) {

            let myquery =await {
                _id: req.body._id
            };

            let newvalues =await {
                $set: {
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    mobile: req.body.mobile,
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
            Providers.updateOne(myquery, newvalues, function (err, pro) {
                if (err) {
                    res.json({
                        response: err,
                        value: false
                    });
                } else {
                    res.json({
                        response: pro.result.ok,
                        value: true
                    });
                }
            });

});

router.post("/", function (req, res) {

    FindProviderfollowemail(req.body.email)
        .then(provider => {
            if (provider) {
                res.json({
                    "response": false,
                    "value": "email Registered provider"
                });
            } else {
                FindCustomerfollowemail(req.body.email)
                    .then(customer => {
                        if (customer) {
                            res.json({
                                "response": false,
                                "value": "email Registered customer"
                            });
                        } else {
                            RegisterProvider(req.body)
                                .then(user => {
                                    if (user) {
                                        Wallet.findOne({
                                            "user_id": user._id
                                        }, function (err, wlet) {
                                            if (wlet === null) {
                                                CreateWallet(user._id)
                                                    .then(
                                                        wl => {
                                                        },
                                                        err => {
                                                            console.log(err)
                                                        }
                                                    );
                                            }
                                        });
                                        // count số lượng đăng ký
                                        if (req.body.isPlatform !== undefined && req.body.isPlatform === 1) {
                                            CountRegister.count_register(1,true);
                                        } else { CountRegister.count_register(2,true); }
                                        SendMail(user.email, user.firstname, user.lastname)
                                            .then(
                                                result => {
                                                    if (result) {
                                                        res.json({
                                                            "response": true,
                                                            "_id": user._id,
                                                            "sendmail": result
                                                        });
                                                    } else {
                                                        res.json({
                                                            "response": false,
                                                            "_id": user._id,
                                                            "sendmail": result
                                                        });
                                                    }
                                                }
                                                , err => {
                                                    console.log(err);
                                                    res.json({
                                                        "response": false,
                                                        "value": err
                                                    });
                                                }
                                            );
                                    } else {
                                        res.json({
                                            "response": false,
                                            "value": "Register fail"
                                        });
                                    }
                                }, err => {
                                    console.log(err);
                                    res.json({
                                        "response": false,
                                        "value": err
                                    });
                                })
                        }
                    }, err => {
                        console.log(err);
                        res.json({
                            "response": false,
                            "value": err
                        });
                    })
            }
        }, err => {
            console.log(err);
            res.json({
                "response": false,
                "value": err
            });
        });
});

module.exports = router;
