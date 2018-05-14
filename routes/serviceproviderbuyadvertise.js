const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const ServiceProvider = require('../models/serviceproviderdata');
const Wallet = require('../models/wallet');
const Historypayment = require('../models/historypayment');
const SPrBuyAdvertise = require('../models/ServiceProviderBuyAdvertiseData');
const config = require('../config');
const Async = require("async");
const sortBy = require('array-sort');


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
            if (err) return reject(err);
            resolve(res);
        });
    });
}

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

//upload file
var Storage = multer.diskStorage({

    destination: config.APath + '/asset/advertise/',
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
}).single('imageadvertise'); //Field name and max count


router.post("/inser_advertise", function (req, res) {
    let pay = 5;
    let date = 7;

    let Error = [];
    Error.push("1. update wallet success, create data buy banner fail");
    Error.push("2. update wallet fail");
    Error.push("3. Not enough money");
    Error.push("4. Upload Image banner fail");

    var dat = new Date();
    Date.prototype.addDays = function (days) {
        var dat = new Date(this.valueOf());
        dat.setDate(dat.getDate() + days);
        return dat;
    }
    upload(req, res, function (err) {
        if (err) {
            res.json({
                "response": Error,
                "value": 4
            });
        } else {
            FindWallet(req.body.provider_id)
                .then(
                    wallet => {
                        if (wallet) {
                            if (wallet.balance >= pay) {
                                UpdateWallet(req.body.provider_id, wallet.balance - pay)
                                    .then(
                                        wal => {
                                            if (wal) {
                                                Historypayment.create({
                                                    payment: pay,
                                                    user_id: req.body.provider_id,
                                                    service: 5,
                                                    create_at: Date.now()
                                                }, function (err, htr) {
                                                    if (err) console.log(err);
                                                    else console.log(htr);
                                                });

                                                //insert data banner
                                                SPrBuyAdvertise.create({
                                                    provider_id: req.body.provider_id,
                                                    link_banner: '/advertise/' + req.file.filename,
                                                    create_end: dat.addDays(date).getTime(),
                                                    create_at: Date.now()
                                                }, function (err, SPBBanner) {
                                                    if (err) {
                                                        console.log(err);
                                                        res.json({
                                                            "response": Error,
                                                            "value": 1
                                                        });
                                                    }
                                                    else {
                                                        res.json({
                                                            "response": SPBBanner,
                                                            "value": 0
                                                        });
                                                    }
                                                    ;
                                                });

                                            }
                                            else {
                                                console.log(err);
                                                res.json({
                                                    "response": Error,
                                                    "value": 2
                                                });
                                            }

                                        }
                                    );

                            } else {
                                res.json({
                                    "response": Error,
                                    "value": 3
                                });
                            }
                        } else {
                            res.json({
                                "response": Error,
                                "value": 3
                            });
                        }
                    },
                    err => {
                        console.log(err);
                        res.json({
                            "response": Error,
                            "value": 3
                        });
                    }
                );
        }
    });
});


let FindBanner = () => {
    return new Promise((resolve, reject) => {
        SPrBuyAdvertise.find({}, function (err, res) {
            if (err) return reject(err);
            resolve(res);
        });
    });
}

let FindProviderID = (id) => {
    return new Promise((resolve, reject) => {
        ServiceProvider.findOne({
            '_id': id
        }, function (err, user) {
            if (err) return reject(new Error('loi tim id: ' + id));
            resolve(user);
        });
    });
}

let findMemberShip = (Baner) => {
    return new Promise((resolve, reject) => {
        let service_providers = [];
        Async.forEachOf(Baner, function (item, key, callback) {
            FindProviderID(item.provider_id)
                .then(
                    provider => {
                        if (provider) {
                            service_providers.push({
                                provider_id: item.provider_id,
                                link_banner: item.link_banner,
                                create_at: item.create_at,
                                create_end: item.create_end,
                                member_ship: provider.member_ship,
                                no_of_hight_recommended: provider.no_of_hight_recommended,
                                no_of_recommended: provider.no_of_recommended,
                                no_of_neutral: provider.no_of_neutral,
                            });
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

let sortOject = (service_providers) => {
    return new Promise((resolve, reject) => {
        if (service_providers) {
            let member_ship = sortBy(service_providers, 'member_ship');
            let no_of_hight_recommended = sortBy(member_ship, 'no_of_hight_recommended');
            let no_of_recommended = sortBy(no_of_hight_recommended, 'no_of_recommended');
            let no_of_neutral = sortBy(no_of_recommended, 'no_of_neutral');
            resolve(no_of_neutral);
        }
        else return reject(new Error('loi tim id: ' + id));
    });
}


let sorttopAdvertise = async (res) => {
    let sprBanner = [];
    let service_providers = [];
    let Banners = [];

    let Errors = [];
    Errors.push("1. Not advertise ");
    Errors.push("2. Sort advertise ");
    Errors.push("3. Find membership ");
    Errors.push("4. Find advertise ");

    await FindBanner()
        .then(banner => {
            if (banner) {
                sprBanner = banner;
            }
        }, err => {
            res.json({"response": Errors, "value": 4});
        });

    await findMemberShip(sprBanner)
        .then(aa => {
            if (aa) {
                service_providers = aa;
            }
        }, err => {
            res.json({"response": Errors, "value": 3});
        });

    sortOject(service_providers).then(
        svpro => {
            if (svpro) {
                res.json({"response": svpro, "value": 0});
            } else {
                res.json({"response": Errors, "value": 1});
            }
        },
        err => {
            res.json({"response": Errors, "value": 2});
            //console.log(err);
        }
    );
}

//add a new to the db
router.get("/get_advertise_top",  async function (req, res) {
    //sorttopAdvertise(res);
        let num = await SPrBuyAdvertise.count({});
        if (num > 3) {
            let random = await Math.floor(Math.random() * num);
            SPrBuyAdvertise.find({}, function (err, svpro) {
                if (svpro) {
                    res.json({"response": svpro, "value": 0});
                } else {
                    res.json({"response": Errors, "value": 1});
                }
            }).limit(3).skip(random);
        } else{
            SPrBuyAdvertise.find({}, function (err, svpro) {
                if (svpro) {
                    res.json({"response": svpro, "value": 0});
                } else {
                    res.json({"response": Errors, "value": 1});
                }
            });
        }

});

module.exports = router;
