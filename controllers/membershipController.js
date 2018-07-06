'use strict';
const Wallet = require('../models/wallet');
const Provider = require('../models/serviceproviderdata');
const Membership = require('../models/manage_membership');
const Historypayment = require('../models/historypayment');
const config = require('../config');
const urlapi = config.urlapi;
const request_promise = require('request-promise');

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
            Id_Membership: parseInt(mType, 10)
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

let FindSubProvider = (userID) => {
    return new Promise((resolve, reject) => {
        Provider.find({
            provider_id: userID
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

let updateMembershipProvider = (user_id, membership, timeEnd) => {
    return new Promise((resolve, reject) => {
        Provider.findOneAndUpdate({_id: user_id}, {
            member_ship: membership,
            member_ship_time: timeEnd,
            sendMail:0,
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

let updateProvider = (user_id, obj) => {
    return new Promise((resolve, reject) => {
        Provider.findOneAndUpdate({_id: user_id}, obj, {new: true}, function (err, WL) {
            if (err) return reject(err);
            resolve(WL);
        });
    });
}


let checkDayRest = async function (dates) {
    return (dates - Date.now()) / 1000 / 60 / 60 / 24;
}

let checkBalance = (svprovider) => {
    return new Promise(async (resolve, reject) => {
        let {member_ship_time, member_ship} = await svprovider;
        let day = await checkDayRest(member_ship_time);
        if (member_ship_time > Date.now()) {
            GetMemberShip(member_ship)
                .then(
                    memberShip => {
                        if (memberShip) {
                            resolve({
                                balance: Math.round(day - 0.5) * memberShip.Monthly_Fee / 30,
                                dayRest: Math.round(day - 0.5),
                            });
                        } else {
                            return reject("không tìm thấy membership");
                        }
                    },
                    err => {
                        return reject(err);
                    }
                )
        } else {
            // update member ship ve 1
            return reject(" ngày hết hạn nhỏ hon ngày hiện tại");
        }
    });
}

let checkPay = (user_id, mType) => {
    return new Promise((resolve, reject) => {
        if (mType > 0 && mType <= 4) {
            checkMembership(user_id)
                .then(
                    svprovider => {
                        if (svprovider.member_ship > 0 && svprovider.member_ship <= 4) {
                            if (svprovider.member_ship === 1) {
                                GetMemberShip(mType)
                                    .then(
                                        memberShipPrice => {
                                            if (memberShipPrice) {
                                                resolve({
                                                    balance: 0,
                                                    pay: memberShipPrice.Monthly_Fee,
                                                    dayRest: 0,
                                                    type: 1,
                                                    membership_time: Date.now(),
                                                    member_ship_old: svprovider.member_ship
                                                });
                                            } else {
                                                return reject("Không tìm thấy giá membership");
                                            }
                                        },
                                        err => {
                                            return reject(err);
                                        }
                                    );
                            } else {
                                if (svprovider.member_ship.toString() === mType.toString()) {
                                    GetMemberShip(mType)
                                        .then(
                                            memberShipPrice => {
                                                if (memberShipPrice) {
                                                    resolve({
                                                        balance: 0,
                                                        pay: memberShipPrice.Monthly_Fee,
                                                        dayRest: 0,
                                                        type: 0,
                                                        membership_time: svprovider.member_ship_time,
                                                        member_ship_old: svprovider.member_ship
                                                    });
                                                } else {
                                                    return reject("Không tìm thấy giá membership");
                                                }
                                            },
                                            err => {
                                                return reject(err);
                                            }
                                        );
                                } else {
                                    checkBalance(svprovider)
                                        .then(
                                            CheckBalance => {
                                                if (CheckBalance.balance) {
                                                    GetMemberShip(mType)
                                                        .then(
                                                            memberShip => {
                                                                if (memberShip) {
                                                                    resolve({
                                                                        pay: memberShip.Monthly_Fee - CheckBalance.balance,
                                                                        balance: CheckBalance.balance,
                                                                        dayRest: CheckBalance.dayRest,
                                                                        type: 1,
                                                                        membership_time: svprovider.member_ship_time,
                                                                        member_ship_old: svprovider.member_ship
                                                                    });
                                                                } else {
                                                                    return reject("Không thấy bảng giá");
                                                                }
                                                            },
                                                            err => {
                                                                return reject(err);
                                                            }
                                                        )
                                                } else {
                                                    return reject("Không tìm thấy số tiền còn lại");
                                                }
                                            },
                                            err => {
                                                return reject(err);
                                            }
                                        )
                                }
                            }
                        } else {
                            return reject("Là consumer không phải provider");
                        }
                    },
                    err => {
                        return reject(err);
                    }
                );
        } else {
            return reject("type không hop le");
        }
    });
}

let upgradeMembership = (user_id, mType, payBalance, balance_old) => {
    return new Promise((resolve, reject) => {
        let {pay} = payBalance;
        updateWallet(user_id, balance_old - pay)
            .then(
                walletBalnce => {
                    console.log(walletBalnce);
                    if (walletBalnce) {
                        let mTime = Date.now();
                        if (payBalance.type === 1) {
                            updateMembershipProvider(user_id, mType, mTime + 30 * 24 * 60 * 60 * 1000)
                                .then(
                                    svpro => {
                                        //lưu lịch sữ giao dịch
                                        GetMemberShip(mType)
                                            .then(
                                                membership => {
                                                    let newHis = new Historypayment({
                                                        payment: payBalance.pay,
                                                        user_id: user_id,
                                                        content_service: "Change Membership: " + membership.Name +
                                                        "The Price: " + membership.Monthly_Fee +
                                                        "Your remain money for Old Membership: " + payBalance.balance,
                                                    });
                                                    SaveHistoryPayment(newHis);
                                                });
                                        resolve(svpro);
                                    },
                                    err => {
                                        return reject("update membership provider lỗi");
                                    }
                                );
                        } else {
                            updateMembershipProvider(user_id, mType, payBalance.membership_time * 1 + (30 * 24 * 60 * 60 * 1000))
                                .then(
                                    svpro => {
                                        //lưu lịch sữ giao dịch
                                        GetMemberShip(mType)
                                            .then(
                                                membership => {
                                                    let newHis = new Historypayment({
                                                        payment: payBalance.pay,
                                                        user_id: user_id,
                                                        content_service: "Update Membership: " + membership.Name +
                                                        "The Price: " + membership.Monthly_Fee,
                                                    });
                                                    SaveHistoryPayment(newHis);
                                                });
                                        resolve(svpro);
                                    },
                                    err => {
                                        return reject("update membership provider lỗi");
                                    }
                                );
                        }
                    } else {
                        return reject("update wallet lỗi");
                    }

                },
                err => {
                    return reject("update wallet lỗi");
                }
            );

    });
}

let Errors = {
    0: "Update membership success ",
    1: "Membership is max level, cannot upgrade over ",
    2: "User information not incorrect ",
    3: "Not enough money ",
    4: "Error when payment ",
    5: "Error when payment and update membership, please contact supplier ",
    6: "Only upgrade not downgrade ",
    7: "mType illegal ",
    8: "Update membership fail ",
    9: "Find wallet fail ",
}


exports.change_member_ship = function (req, res) {
    let user_id = req.body.userID;
    let mType = req.body.mType;
    if (mType < 1 || mType > 4) {
        return res.json({"response": "" + svprovider.member_ship, "value": 7, mesage: Errors});
    } else {
        checkPay(user_id, mType)
            .then(
                payBalance => {
                    console.log(payBalance);
                    if (payBalance) {
                        GetOneUserWallet(user_id)
                            .then(
                                Wallet => {
                                    if (Wallet) {
                                        if (payBalance.pay <= Wallet.balance) {
                                            upgradeMembership(user_id, mType, payBalance, Wallet.balance).then(
                                                provider => {
                                                    if (provider) {
                                                        console.log(provider._id,user_id);
                                                        let url  = config.api_mail_changeUpdateMemberShip;
                                                        let data = {
                                                            changeUpdateMs:payBalance.type,
                                                            idProvider:provider._id+"",
                                                            levelOldMemberShip:payBalance.member_ship_old,
                                                            moneyExcess:payBalance.balance,
                                                            numberOfDay:payBalance.dayRest,
                                                            oldBank:Wallet.balance,
                                                        };
                                                        SendMail(url,data);
                                                        deleteSubProvider(provider);
                                                        return res.json({
                                                            "response": {
                                                                provider: provider,
                                                                message: payBalance,
                                                            }, "value": 0, mesage: Errors
                                                        });
                                                    } else {
                                                        return res.json({"response": "", "value": 8, mesage: Errors});
                                                    }
                                                },
                                                err => {
                                                    return res.json({"response": "", "value": 8, mesage: Errors});
                                                }
                                            );
                                        } else {
                                            return res.json({"response": "", "value": 3, mesage: Errors});
                                        }
                                    } else {
                                        return res.json({"response": "", "value": 9, mesage: Errors});
                                    }
                                },
                                err => {
                                    return res.json({"response": "", "value": 9, mesage: Errors});
                                }
                            );
                    } else {
                        return res.json({"response": "", "value": 2, mesage: Errors});
                    }
                },
                err => {
                    return res.json({"response": "", "value": 2, mesage: Errors});
                }
            );
    }
};

exports.get_price_chang_member_ship = function (req, res) {
    let user_id = req.body.userID;
    let mType = req.body.mType;
    checkPay(user_id, mType)
        .then(
            payBalance => {
                GetOneUserWallet(user_id)
                    .then(
                        Wallet => {
                            if (Wallet) {
                                return res.json({
                                    "response": true,
                                    "value": Object.assign(JSON.parse(JSON.stringify(payBalance)), {balance_old: Wallet.balance})
                                });
                            } else {
                                CreateWallet(user_id)
                                    .then(wlnew => {
                                    }, err => {
                                        console.log(err);
                                    });
                                return res.json({
                                    "response": true,
                                    "value": Object.assign(JSON.parse(JSON.stringify(payBalance)), {balance_old: 0})
                                });
                            }
                        },
                        err => {
                            return res.json({"response": false, "value": 0, err: err});
                        }
                    );
            },
            err => {
                return res.json({"response": false, "value": 0, err: err});
            }
        );
};

exports.get_price_member_ship = function (req, res) {
    Membership.find({}, function (err, member_ship) {
        if (err) return res.json({"response": false, "value": []});
        return res.json({"response": true, "value": member_ship});
    });
};

let deleteSubProvider = (provider)=>{
    GetMemberShip(provider.member_ship)
        .then(
            MemberShip =>{
                let submem = MemberShip.Sub_Accounts;
                let i = 0;
                FindSubProvider(provider._id)
                    .then(
                        subprovider =>{
                            subprovider.map(prosub=>{
                                i++;
                                if(i > submem) {
                                    updateProvider(prosub._id, {
                                        isActived:false,
                                        member_ship:0,
                                    })
                                }
                            })
                        }
                    );
            }
        );
}

exports.downgrade_membership = function () {
    Provider.find({
        member_ship: {
            $gte: 2
        },
        member_ship_time: {
            $lte: Date.now(),
        },
    }, function (err, svprovicers) {
        if (svprovicers.length > 0){
            svprovicers.map((svprovider, key) => {
                Provider.findOneAndUpdate({_id:svprovider._id}, {
                    member_ship: 1,
                    member_ship_time: Date.now(),
                    sendMail:0,
                }, {new: true}, function (err, provider) {
                    if (err) return console.log(err);
                    if (provider) {
                        let url  = config.api_mail_notifyExprie;
                        let data = {
                            notifyExprie:2,
                            idProvider:provider._id+"",
                        };
                        SendMail(url,data);
                        deleteSubProvider(provider);
                    }
                });
            });

        }
    });
};

exports.sendmail_membership = function () {
    Provider.find({
        member_ship: {
            $gte: 2
        },
        sendMail:0,
        member_ship_time: {
            $gte: Date.now() + (5*24*60*60*1000),
            $lte: Date.now() + (6*24*60*60*1000),
        },
    }, function (err, svprovicers) {
        if (svprovicers.length > 0) {
            svprovicers.map((svprovider, key) => {
                let url = config.api_mail_notifyExprie;
                let data = {
                    notifyExprie: 1,
                    idProvider: svprovider._id + "",
                };
                SendMail(url, data);
            });
        }
    });
};

exports.sendmail_membership2 = function () {
    Provider.find({
        member_ship: {
            $gte: 2
        },
        sendMail:1,
        member_ship_time: {
            $gte: Date.now() + (2*24*60*60*1000),
            $lte: Date.now() + (3*24*60*60*1000),
        },
    }, function (err, svprovicers) {
        if (svprovicers.length > 0) {
            svprovicers.map((svprovider, key) => {
                let url = config.api_mail_notifyExprie;
                let data = {
                    notifyExprie: 1,
                    idProvider: svprovider._id + "",
                };
                SendMail(url, data);
            });
        }
    });
};

let SendMail = (url,data) =>{
        //SEND MAIL HERE
        var options = {
            method: 'POST',
            uri: urlapi + url,
            form:data,
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            }
        };
        request_promise(options)
            .then(function (body) {
                // POST succeeded...
                console.log(body);
            })
            .catch(function (err) {
                if (err)  console.log(err);
            });
}



