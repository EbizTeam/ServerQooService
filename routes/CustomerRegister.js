const express = require('express');
const router = express.Router();
const Providers = require('../models/serviceproviderdata');
const Customer  = require('../models/customerdata');
const CountRegister  = require('../controllers/countRegisterController');
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


let SendMail = (email) =>{
    return new Promise((resolve, reject) => {
        //SEND MAIL HERE
        var options = {
            method: 'POST',
            uri: urlapi + config.api_mail_register,
            form: {
                // Like <input type="text" name="name">
                PtxtMAil: email
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
                                        // count số lượng đăng ký
                                        if (req.body.isPlatform !== undefined && req.body.isPlatform === 1) {
                                            CountRegister.count_register(1,false);
                                        } else { CountRegister.count_register(2,false); }

                                        SendMail(user.email)
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



router.post("/update_consumer/avata", function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            res.json({
                "response": Error,
                "value": false
            });
        } else {
            try {
                fs.unlinkSync(urlPHP + '/system/public/uploadfile/avatar/'+req.body.linkavatar);
            } catch (err) {
                console.log(err);
            }
            if (req.file.filename) {
                let myquery =  {
                    _id: req.body._id
                };

                let newvalues = {
                    $set: {
                        linkavatar:req.file.filename,
                        updated_at: Date.now(),
                    }
                };
                Customer.updateOne(myquery, newvalues, function (err, cus) {
                    if (err) {
                        res.json({
                            response:err,
                            value:false
                        });
                    }else{
                        res.json({
                            response:req.file.filename,
                            value:true
                        });
                    }
                });
            }else{
                res.json({
                    response:req.file,
                    value:false
                });
            }
        }
    });
});

router.put("/update_consumer/:cusId",function(req, res) {
    Customer.findOneAndUpdate({_id:req.params.cusId}, req.body, {new: true}, function(err, Custom) {
        if (err) {
            res.json({
                response:err,
                value:false
            });
        }else{
            if (Custom) {
                Custom.password = undefined;
                res.json({
                    response:Custom,
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

router.post("/update_consumer/info",async function (req, res) {
    let  myquery = await {
        _id: req.body._id
    };

    let newvalues = await {
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
            home_number: req.body.home_number,
            address1: req.body.address1,
            address2: req.body.address2,
            occupation: req.body.occupation,
            updated_at: Date.now(),
        }
    };
    Customer.updateOne(myquery, newvalues, function (err, cus) {
        if (err) {
            res.json({
                response:err,
                value:false
            });
        }else{
            res.json({
                response:cus.result.ok,
                value:true
            });
        }
    });

});


module.exports = router;
