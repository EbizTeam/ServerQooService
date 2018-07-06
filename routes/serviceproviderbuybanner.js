const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const ServiceProvider = require('../models/serviceproviderdata');
const Wallet = require('../models/wallet');
const manage_service_price = require('../models/manage_service_price');
const Historypayment = require('../models/historypayment');
const SPrBuyBanner = require('../models/ServiceProviderBuyBannerData');
const config = require('../config');
const Async = require("async");
const sortBy = require('array-sort');
const SendMail = require('../controllers/sendMailController');


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
};

let FindWallet = (user_id) => {
    return new Promise((resolve, reject) => {
        Wallet.findOne({
            'user_id': user_id
        }, function (err, wl) {
            if (err) return reject(new Error('loi tim id: ' + user_id));
            resolve(wl);
        });
    });
};

let find_manage_service_price = () => {
    return new Promise((resolve, reject) => {
        manage_service_price.findOne({
            message: 4
        }, function (err, svtop) {
            if (err) return reject(err);
            resolve(svtop);
        })
    })
};

//upload file
let Storage = multer.diskStorage({
    destination: config.APath + '/asset/banner/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() +
            path.extname(file.originalname));
    }
});

let upload = multer({
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
}).single('imagebanner'); //Field name and max count


router.post("/inser_banner", function (req, res) {
    return res.json({
        "response": "api ngừng hoạt động 06/28/2018",
        "value": 5
    });

    let Error = [];
    Error.push("1. update wallet success, create data buy banner fail");
    Error.push("2. update wallet fail");
    Error.push("3. Not enough money");
    Error.push("4. Upload Image banner fail");
    Error.push("5. Upload Image banner fail");

    let dat = new Date();
    Date.prototype.addDays = function (days) {
        let dat = new Date(this.valueOf());
        dat.setDate(dat.getDate() + days);
        return dat;
    };
    upload(req, res, function (err) {
        if (err) {
            res.json({
                "response": Error,
                "value": 4
            });
        } else {
            find_manage_service_price()
                .then(
                    svPrice => {
                        let {Price, date, Name, message} = svPrice;
                        FindWallet(req.body.provider_id)
                            .then(
                                wallet => {
                                    if (wallet) {
                                        if (wallet.balance >= Price) {
                                            UpdateWallet(req.body.provider_id, wallet.balance - Price)
                                                .then(
                                                    wal => {
                                                        if (wal) {
                                                            //lưu lịch sử giao dịch
                                                            Historypayment.create({
                                                                user_id: req.body.provider_id,
                                                                payment: Price,
                                                                service: message,
                                                                content_service:Name,
                                                            }, function (err, htr) {
                                                                if (err) console.log(err);
                                                            });

                                                            //insert data banner
                                                            SPrBuyBanner.create({
                                                                provider_id: req.body.provider_id,
                                                                link_banner: '/banner/' + req.file.filename,
                                                                // create_end: dat.addDays(date).getTime(),
                                                            }, function (err, SPBBanner) {
                                                                if (err) {
                                                                    res.json({
                                                                        "response": Error,
                                                                        "value": 1
                                                                    });
                                                                }
                                                                else {
                                                                    let data = {
                                                                        idProvider:req.body.provider_id+"",
                                                                        notifyCreate:1//Banner
                                                                        //notifyCreate:2//slide
                                                                        //notifyCreate:3//service
                                                                    };
                                                                    SendMail.send_mail(config.url_mail_notify,data);
                                                                    res.json({
                                                                        "response": SPBBanner,
                                                                        "value": 0
                                                                    });
                                                                }
                                                            });

                                                        }
                                                        else {
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
                                    res.json({
                                        "response": Error,
                                        "value": 3
                                    });
                                }
                            );
                    },
                    err => {
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
        SPrBuyBanner.find({}, function (err, res) {
            if (err) return reject(err);
            resolve(res);
        });
    });
};

let FindProviderID = (id) => {
    return new Promise((resolve, reject) => {
        ServiceProvider.findOne({
            '_id': id
        }, function (err, user) {
            if (err) return reject(new Error('loi tim id: ' + id));
            resolve(user);
        });
    });
};

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
                                created_at: item.created_at,
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
};

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
};


let sorttopBanner = async (res) => {
    let sprBanner = [];
    let service_providers = [];
    let Banners = [];

    let Errors = [];
    Errors.push("1. Not banner ");
    Errors.push("2. Sort banner ");
    Errors.push("3. Find membership ");
    Errors.push("4. Find Banner ");

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
};

//add a new to the db
router.get("/get_banner_top", async function (req, res) {
    let num = await SPrBuyBanner.count({isActived:true});
    let random = await Math.floor(Math.random() * num);
    if (num > 10) {
        if (num - random < 10 ) {
            random  -= 10;
            SPrBuyBanner.find({isActived:true}, function (err, svpro) {
                if (svpro) {
                    res.json({"response": svpro.slice(0, 10), "value": 0});
                } else {
                    res.json({"response": err, "value": 1});
                }
            }).skip(random - 10 +tong);
        }else{
            SPrBuyBanner.find({isActived:true}, function (err, svpro) {
                if (svpro) {
                    res.json({"response": svpro.slice(0, 10), "value": 0});
                } else {
                    res.json({"response": err, "value": 1});
                }
            }).skip(random);
        }

    } else {
        SPrBuyBanner.find({isActived:true}, function (err, svpro) {
            if (svpro) {
                res.json({"response": svpro.slice(0, 10), "value": 0});
            } else {
                res.json({"response": err, "value": 1});
            }
        });
    }
    //sorttopBanner(res);
});

module.exports = router;
