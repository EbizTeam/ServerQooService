'use strict';
const Wallet = require('../models/wallet');
const Provider = require('../models/serviceproviderdata');
const Membership = require('../models/manage_membership');
const Historypayment = require('../models/historypayment');
const Async = require("async");
const sortBy = require('array-sort');


let GetOneUserWallet = (user_id) => {
    return new Promise((resolve, reject) => {
        Wallet.findOne({
            "user_id": user_id
        }, function (err, mw) {
            if (err) return reject(err);
            resolve(mw);
        });
    });
}

let GetMemberShip = (mType) => {
    return new Promise((resolve, reject) => {
        Membership.findOne({
            Id_Membership: mType
        }, function (err, member_ship) {
            if (err) return reject(err);
            resolve(member_ship);
        });
    });
}

let checkMembership = (userID) => {
    return new Promise((resolve, reject) => {
        Provider.findOne({
            _id: userID
        }, function (err, svProvider) {
            if (err) return reject(err);
            resolve(svProvider);
        });
    });
}


let CreateWallet = (providerID) => {
    return new Promise((resolve, reject) => {
        Wallet.create({
            user_id: providerID,
            balance: 0
        }, function (err, wl) {
            if (err) return reject(err);
            resolve(wl);
        });
    });
}


let SaveHistoryPayment = (newCode) => {
    newCode.save(function (err, user) {
        if (err) console.log(err);
    });
}

let updateMembershipProvider = (user_id, membership) => {
    return new Promise((resolve, reject) => {
        Provider.findOneAndUpdate({_id: user_id}, {
            member_ship: membership,
            member_ship_time: Date.now()
        }, {new: true}, function (err, provider) {
            if (err) return reject(err);
            resolve(provider);
        });
    });
}

let updateWallet = (user_id, balance) => {
    return new Promise((resolve, reject) => {
        Wallet.findOneAndUpdate({user_id: user_id}, {balance: balance}, {new: true}, function (err, WL) {
            if (err) return reject(err);
            resolve(WL);
        });
    });
}

let verifyEnough = (user_id, mType) => {
    return new Promise((resolve, reject) => {
        GetOneUserWallet(user_id)
            .then(
                wallet => {
                    if (wallet) {
                        GetMemberShip(mType)
                            .then(
                                member_ship => {
                                    console.log(member_ship);
                                    if (member_ship.Monthly_Fee <= wallet.balance) {
                                        return resolve({member_ship: member_ship, wallet: wallet});
                                    } else {
                                        return reject('not enough money');
                                    }
                                },
                                err => {
                                    return reject(err);
                                }
                            )
                    } else {
                        CreateWallet(user_id)
                            .then(
                                wlnew => {
                                    GetMemberShip(mType)
                                        .then(
                                            member_ship => {

                                                if (member_ship.Monthly_Fee <= wlnew.balance) {
                                                    return resolve({member_ship: member_ship, wallet: wlnew});
                                                } else {
                                                    return reject('not enough money');
                                                }
                                            },
                                            err => {
                                                return reject(err);
                                            }
                                        )
                                },
                                err => {
                                    return reject(err)
                                }
                            );
                    }

                },
                err => {
                    return reject(err);
                }
            )
    });
}

let checkDayRest = async function (days, dates) {
    return (dates +(days*24*60*60*1000) - Date.now()) / 1000 / 60 / 60 / 24;
}

let checkBalance = (svprovider) => {
    return new Promise(async (resolve, reject) => {
        let {_id, member_ship_time, member_ship} = await svprovider;
        let day = await checkDayRest(30, member_ship_time);
        if (member_ship_time +(30*24*60*60*1000) > Date.now()) {
            GetMemberShip(member_ship)
                .then(
                    memberShip => {
                        if (memberShip) {
                            resolve(Math.round(day - 0.5) * memberShip.Monthly_Fee / 30);
                        } else {
                            resolve(0);
                        }
                    },
                    err => {
                        return reject(err);
                    }
                )
        } else {
            // update member ship ve 1
            resolve(0);
        }
    });
}

let upgradeMembership = (user_id, mType, res, rest) => {
    verifyEnough(user_id, mType)
        .then(
            venough => {
                let {member_ship, wallet} = venough;
                updateWallet(user_id, wallet.balance + rest - member_ship.Monthly_Fee)
                    .then(
                        walletBalnce => {
                            let newHis = new Historypayment({
                                payment: member_ship.Monthly_Fee - rest,
                                user_id: user_id,
                                service: member_ship.Id_Membership*(-1),
                                content_service: "upgrade Membership " + member_ship.Name,
                            });

                            updateMembershipProvider(user_id, mType)
                                .then(
                                    svpro => {
                                        //lưu lịch sữ giao dịch
                                        SaveHistoryPayment(newHis);

                                        return res.json({
                                            "response": {
                                                "balance": walletBalnce.balance,
                                                "update": true,
                                                "mType": svpro.member_ship,
                                            }, "value": 0, mesage: Errors
                                        });
                                    },
                                    err => {
                                        return res.json({"response": err, "value": 5, mesage: Errors});
                                    }
                                );
                        },
                        err => {
                            return res.json({"response": err, "value": 4, mesage: Errors});
                        }
                    );
            },
            err => {
                return res.json({"response": err, "value": 3, mesage: Errors});
            }
        );
}

let Errors = {
    0: "Update membership success ",
    1: "Membership is max level, cannot upgrade over ",
    2: "User information not incorrect ",
    3: "Not enough money ",
    4: "Error when payment ",
    5: "Error when payment and update membership, please contact supplier ",
    6: "Only upgrade not downgrade ",
}


exports.change_member_ship = function (req, res) {
    let user_id = req.body.userID;
    let mType = req.body.mType;
    checkMembership(user_id)
        .then(
            svprovider => {
                if (svprovider.member_ship >= mType) {
                    return res.json({"response": " > " + svprovider.member_ship, "value": 6, mesage: Errors});
                } else if (svprovider.member_ship === 1) {
                    return upgradeMembership(user_id, mType, res, 0);
                } else if (svprovider.member_ship === 4) {
                    return res.json({"response": "", "value": 1, mesage: Errors});
                } else if (svprovider.member_ship > 1 && svprovider.member_ship < 4) {
                    checkBalance(svprovider)
                        .then(
                            balance => {
                                return upgradeMembership(user_id, mType, res, balance);
                            },
                            err=>{
                                return res.json({"response": err, "value": 5, mesage: Errors});
                            }
                        )
                } else {
                    return res.json({"response": "", "value": 2, mesage: Errors});
                }
            },
            err => {
                return res.json({"response": "", "value": 2, mesage: Errors});
            }
        );
};

exports.get_price_chang_member_ship = function (req, res) {
    let user_id = req.body.userID;
    let mType = req.body.mType;
    checkMembership(user_id)
        .then(
            svprovider => {
              if (svprovider.member_ship < mType && svprovider.member_ship > 0 && svprovider.member_ship < 4) {
                    checkBalance(svprovider)
                        .then(
                            balance => {
                                GetMemberShip(mType)
                                    .then(
                                        memberShip => {
                                            if (memberShip) {
                                                if (balance){
                                                    return res.json({"response": true, "value": memberShip.Monthly_Fee - balance});
                                                } else {
                                                    return res.json({"response": true, "value": memberShip.Monthly_Fee });
                                                }
                                            } else {
                                                return res.json({"response": false, "value": 0, err:memberShip, mType:mType});
                                            }
                                        },
                                        err => {
                                            return res.json({"response": false, "value": 0, err:err});
                                        }
                                    )
                            },
                            err=>{
                                return res.json({"response": false, "value": 0});
                            }
                        )
                } else {
                  return res.json({"response": false, "value": 0});
                }
            },
            err => {
                return res.json({"response": false, "value": 0});
            }
        );
};

exports.get_price_member_ship = function (req, res) {
    Membership.find({
    }, function (err, member_ship) {
        if (err)  return res.json({"response": false, "value": []});
        return res.json({"response": true, "value": member_ship});
    });
};

exports.downgrade_membership = function () {
    Provider.find({
        member_ship: {
            $gte: 2
        }
    }, function (err, svprovicers) {
        svprovicers.map((svprovider, key) =>{
            let {_id, member_ship_time} =  svprovider;
            if (member_ship_time+(30*24*60*60*1000) <= Date.now()) {
                Provider.findOneAndUpdate({_id: _id}, {
                    member_ship: 1,
                    member_ship_time: Date.now()
                }, {new: true}, function (err, provider) {
                    if (err) return  console.log(err);
                });
            }
        });

    });
};





