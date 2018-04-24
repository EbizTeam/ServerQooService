const Express = require("express");//express
const App = Express();// app express
const router = Express.Router();
const http = require('http').Server(App);
const io = require('socket.io')(http);//socket io

const multer = require('multer');
const config = require('../config');
const path = require('path');


// khuc nay la cua thang socket dung ai dung vao
//khai bao mang luu nguoi dung dang online
const Messages = require('../models/messages');
const ChatUsers = require('../models/userchat');
const Oppointment = require('../models/oppointment');
const AuctionOffline = require('../models/auction');
const Chathistory = require('../models/chathistory');



function isEmpty(str) {
    return (!str || 0 === str.length);
}

let sendNotifyIOS = (device_token, content_text, countMes) => {
    let apnProvider = new apn.Provider({
        token: {
            key: 'apns.p8', // Path to the key p8 file
            keyId: 'PDSQJ33AHF', // The Key ID of the p8 file (available at https://developer.apple.com/account/ios/certificate/key)
            teamId: '45D84HJ79U', // The Team ID of your Apple Developer Account (available at https://developer.apple.com/account/#/membership/)
        },
        production: false // Set to true if sending a notification to a production iOS app
    });
    // Enter the device token from the Xcode console
    let deviceToken = device_token;
    // Prepare a new notification
    let notification = new apn.Notification();
    // Specify your iOS app's Bundle ID (accessible within the project editor)
    notification.topic = 'com.QooServices.QooServices';
    // Set expiration to 1 hour from now (in case device is offline)
    notification.expiry = Math.floor(Date.now() / 1000) + 3600;
    // Set app badge indicator
    notification.badge = countMes;
    // Play ping.aiff sound when the notification is received
    notification.sound = 'ping.aiff';
    // Display the following message (the actual notification text, supports emoji)
    notification.alert = content_text;
    // Send any extra payload data with the notification which will be accessible to your app in didReceiveRemoteNotification
    notification.payload = {
        id: 123
    };
    // Actually send the notification
    apnProvider.send(notification, deviceToken).then(function (result) {
        // Check the result for any failed devices
        //console.log(result);
    });
}

let CountMes = (toID) => {
    return new Promise((resolve, reject) => {
        Messages.find({
            "toID": toID
        }, function (err, message) {
            if (err) return reject(new Error('CountMes: ' + 'khong dem duoc'));
            if (message) {
                resolve(message.length);
            }
            else {
                resolve(null);
            }
        });
    });
}

let CountUsers = () => {
    return new Promise((resolve, reject) => {
        ChatUsers.find({}, function (err, users) {
            if (err) return reject(new Error('CountUsers: ' + 'khong dem duoc'));
            if (users) {
                resolve(users.length);
            } else {
                resolve(null);
            }
        });
    });
}

let GetMesToID = (toID) => {
    return new Promise((resolve, reject) => {
        Messages.find({
            "toID": toID
        }, function (err, messages) {
            if (err) return reject(new Error('GetMesToID: khong lay duoc tin nhan theo toID: ' + toID));
            resolve(messages);
        });
    });
}

//get mesage one to id
let GetMesID = (ID) => {
    return new Promise((resolve, reject) => {
        Messages.findOne({
            "_id": ID
        }, function (err, message) {
            if (err) return reject(new Error('GetMesID: khong lay duoc tin nhan theo ID: ' + ID));
            resolve(message);
        });
    });
}

let callbackMessageOffline = (messages, socketID) => {
    for (let key in messages) {
        //gui den nguoi nhan co id
        io.to(socketID).emit("server-sent-message-recever", {
            messageID: messages[key]._id,
            messageContent: messages[key].messageContent,
            fromID: messages[key].fromID,
            toID: messages[key].toID,
            mTime: messages[key].mTime,
            Type: messages[key].Type,
            mFistName: messages[key].mFistName,
            mLastName: messages[key].mLastName,
            linkAvatar: messages[key].linkAvatar
        });
    }
}
// get all nguoi dung tu mongodb
let GetAllUsers = (userID) => {
    return new Promise((resolve, reject) => {
        ChatUsers.find({
            "userID": userID
        }, function (err, users) {
            if (err) return reject(new Error('GetAllUsers: khong lay duoc nguoi dung' + userID));
            resolve(users);
        });
    });
}
// get all nguoi dung tu mongodb
let GetOneUsers = (userID) => {
    return new Promise((resolve, reject) => {
        ChatUsers.findOne({
            "userID": userID
        }, function (err, user) {
            if (err)
                return reject(new Error('GetOneUsers: khong lay duoc nguoi dung userID ' + userID));
            resolve(user);
        });
    });
}
// get 1 nguoi dung bang _id mongodb
let GetOneUserScoketID = (socketID) => {
    return new Promise((resolve, reject) => {
        ChatUsers.findOne({
            "_id": socketID
        }, function (err, user) {
            if (err) return reject(new Error('GetOneUserScoketID: ' + socketID));
            resolve(user);
        });
    });
}
//tao nguoi dung mOnline
let CreateUser = (socketID, userID) => {
    return new Promise((resolve, reject) => {
        ChatUsers.create({
            _id: socketID,
            userID: userID
        }, function (err, user) {
            if (err) return reject(new Error('CreateUser: socketID: ' + socketID + ' userID: ' + userID));
            resolve(user);
        });
    });
}
//tao nguoi dung mOnline
let CreateMessage = (obj) => {
    return new Promise((resolve, reject) => {
        Messages.create({
            _id: obj.messageID,
            messageContent: obj.messageContent,
            fromID: obj.fromID,
            toID: obj.toID,
            mTime: obj.mTime,
            Type: obj.Type,
            mFistName: obj.mFistName,
            mLastName: obj.mLastName,
            linkAvatar: obj.linkAvatar
        }, function (err, message) {
            if (err) return reject(new Error('CreateMessage: obj: ' + obj));
            resolve(message);
        });
    });
}
// xoa nguoi dung cu
let DelUser = (socketID) => {
    return new Promise((resolve, reject) => {
        GetOneUserScoketID(socketID)
            .then(user => {
                    if (user) {
                        ChatUsers.deleteOne({
                            _id: socketID
                        }, function (err, user) {
                            if (err) return reject(new Error('DelUser: ' + socketID));
                            console.log(user.ok);
                            resolve(user.ok);
                        });
                    } else {
                        resolve(null);
                    }
                }
            );

    });
}
// Xoa tin nhan cu
let DelMessage = (messageID) => {
    return new Promise((resolve, reject) => {
        GetMesID(messageID)
            .then(mes => {
                if (mes) {
                    Messages.deleteOne({
                        "_id": messageID
                    }, function (err, message) {
                        if (err) return reject(new Error('DelMessage: messageID ' + messageID));
                        resolve(message.n);
                    });
                } else {
                    resolve(0);
                }
            });
    });
}

let Connectserver = async (socket, userID) => {
    await GetAllUsers(userID).then(allUsers => {
        if (allUsers) {
            for (let key in allUsers) {
                //console.log(allUsers[key]._id);
                if (allUsers[key]._id !== socket.id) {
                    //ngat ket noi den nguoi dung cu
                    io.to(allUsers[key]._id).emit("server-send-request-disconect", {
                        "userId": allUsers[key].userID
                    });
                    //xoa nguoi dung cu trong data mongodb
                    DelUser(allUsers[key]._id)
                        .then(res => {
                            console.log("Connectserver: ");
                            console.dir(res);
                        }, err => console.log("Connectserver: " + err));
                }
            }
        }
    }, err => console.log("Connectserver: " + err));

    await CreateUser(socket.id, userID)
        .then(user => {
            if (user) {
                socket.broadcast.emit("server-send-person-connect", {
                    "mOnline": userID
                });
            }
        }, err => console.log("Connectserver:  " + err));

    // gui tin nhan offline cho nguoi online
    await GetMesToID(userID)
        .then(messagesOffline => {
            if (messagesOffline) {
                callbackMessageOffline(messagesOffline, socket.id);
            }
        }, err => console.log("Connectserver: " + err));

    // gui oppoints offline cho nguoi online
    await GetOppointFromID(userID)
        .then(oppoints => {
            if (oppoints) {
                callbackOppointOffline(oppoints, socket.id);
            }
        }, err => console.log("Connectserver: " + err));

    // gui oppoints offline cho nguoi online
    await GetAuctionFromID(userID)
        .then(auctions => {
            if (auctions) {
                callbackAuctionOffline(auctions, socket.id);
            }
        }, err => console.log("Connectserver: " + err));

    //view so nguoi dang Online
    let numOnline = await CountUsers();
    console.log("Connectserver: So nguoi connect server hien tai: " + numOnline);
}

let DisconnectServer = async (socket) => {
    await GetOneUserScoketID(socket.id).then(user => {
        if (user) {
            if (user._id === socket.id) {
                //gui den tat ca nguoi dung biet co nguoi offline
                socket.broadcast.emit("server-send-person-disconnect", {
                    "mOnline": user.userID
                });
                //xoa nguoi dung cu trong data mongodb
                DelUser(user._id)
                    .then(res => {
                        console.log("DisconnectServer: ");
                        console.dir(res);
                    }, err => console.log("DisconnectServer: " + err));
            }
        }
    }, err => console.log('GetOneUserScoketID' + err));
    //view so nguoi dang Online
    CountUsers()
        .then(count => {
            console.log("DisconnectServer: So nguoi connect server hien tai: " + count);
        }, err => console.log("DisconnectServer: " + err));
}
//tim nguoi dung customer
let GetCusM = (userID) => {
    return new Promise((resolve, reject) => {
        CusM.findOne({
            "_id": userID
        }, function (err, customer_account) {
            if (err)
                return reject(new Error('GetCusM: khong lay duoc nguoi dung userID ' + userID));
            resolve(customer_account);
        });
    });
}

//tim nguoi dung provider
let GetSerM = (userID) => {
    return new Promise((resolve, reject) => {
        SerM.findOne({
            "_id": userID
        }, function (err, provider_account) {
            if (err)
                return reject(new Error('GetSerM: khong lay duoc nguoi dung userID ' + userID));
            resolve(provider_account);
        });
    });
}

let GetDeviceToken = (userID) => {
    return new Promise((resolve, reject) => {
        let token;
        GetCusM(userID)
            .then(CusM => {
                if (CusM === null) {
                    GetSerM(userID)
                        .then(SerM => {
                            if (SerM === null) return reject(new Error('GetDeviceToken:khong tim thay token ' + userID));
                            resolve(SerM.device_token);
                        }, err => {
                            console.log("GetSerM" + err);
                        });
                }
                else {
                    resolve(CusM.device_token);
                }

            }, err => {
                console.log("GetCusM" + err);
            });
    });
}

let SentAppointMentIOS = (socket, obj) => {

    CreateOppointment(obj)
        .then(oppoint => {
            if (oppoint) {

                GetOneUsers(obj.to_id).then(user => {
                    if (user) {

                        if (user.userID === obj.to_id) {

                            io.to(user._id).emit("server-sent-oppointment", oppoint);
                        }
                    } else {
                        // sent Appointment iOS
                        GetDeviceToken(obj.to_id)
                            .then(token => {
                                if (obj.status_from_provider === "New Appointment") {
                                    let text_content = "You had reveiced a book appointment for services: " + obj.services_name;
                                    sendNotifyIOS(token, text_content, 1);
                                } else if (obj.status_from_provider === "In Review") {
                                    let text_content = "The status of service " + obj.services_name + "had changed to In Review";
                                    sendNotifyIOS(token, text_content, 1);
                                } else if (obj.status_from_provider === "Decline") {
                                    let text_content = "The status of service " + obj.services_name + "had changed to Decline";
                                    sendNotifyIOS(token, text_content, 1);
                                } else if (obj.status_from_provider === "Approve") {
                                    let text_content = "The status of service " + obj.services_name + "had changed to Approve";
                                    sendNotifyIOS(token, text_content, 1);
                                }
                            }, err => console.log("android" + err));
                        socket.broadcast.emit("server-send-person-disconnect", {
                            "mOnline": obj.toID
                        });
                    }
                }, err => console.log('GetOneUsers' + err));
            }
        }, err => {
            console.log('CreateOppointment' + err)
        });
}

let SentMessageReceiver = (obj, socket) => {
    GetOneUsers(obj.toID).then(user => {
        if (user) {
            if (user.userID === obj.toID) {
                //gui den nguoi nhan co id
                io.to(user._id).emit("server-sent-message-recever", obj);
            }
        } else {
            GetDeviceToken(obj.toID)
                .then(token => {
                    let text_content = obj.mFistName + " " + obj.mLastName + ": " + (new Buffer(obj.messageContent, 'base64')).toString();
                    CountMes(obj.toID).then(res => {
                        if (res) {
                            sendNotifyIOS(token, text_content, res);
                        } else {
                            sendNotifyIOS(token, text_content, 1);
                        }
                    }, err => console.log('GetDeviceToken:' + err + ''));
                }, err => console.log(err));
            socket.broadcast.emit("server-send-person-disconnect", {
                "mOnline": obj.toID
            });
        }
    }, err => console.log('GetOneUsers:' + err + ''));
}

let SentMessageSender = (obj) => {

    GetOneUsers(obj.fromID).then(user => {
        if (user) {
            //		console.log("tho test");
            if (user.userID === obj.fromID) {
                io.to(user._id).emit("server-sent-message-sender", obj);
                //console.log(obj);
                //luu tinh nhan
                CreateMessage(obj)
                    .then(res => {
                        console.log("luu thanh cong")
                    }, err => console.log("SentMessageSender" + err));
            }
        }
    }, err => console.log('GetOneUsers: ' + err + ''));
}

let SentMessageSeen = (obj) => {
    DelMessage(obj.messageID)
        .then(res => console.log('DelMessage:' + res), err => console.log('DelMessage:' + err));
    GetOneUsers(obj.toID).then(user => {
        if (user) {
            if (user.userID === obj.toID) {
                io.to(user._id).emit("server-send-message-seen", obj);
            }
        }
    }, err => console.log('GetOneUsers:' + err + ''));
}

let SentMessageReceived = (obj) => {
    DelMessage(obj.messageID)
        .then(res => console.log("del msg offline"), err => console.log('DelMessage:' + err));
    GetOneUsers(obj.toID).then(user => {
        if (user) {
            if (user.userID === obj.toID) {
                io.to(user._id).emit("server-send-message-received", obj);
            }
        }
    }, err => console.log('GetOneUsers:' + err + ''));
}

let NotificationTyping = (obj) => {
    GetOneUsers(obj.toID).then(user => {
        if (user) {
            if (user.userID === obj.toID) {
                io.to(user._id).emit("server-send-person-connect", {
                    "mOnline": user.fromID
                });
                io.to(user._id).emit("server-send-typing", obj);
            }
        }
    }, err => console.log('GetOneUsers' + err + ''));
}

let NotificationTyped = (obj) => {
    GetOneUsers(obj.toID).then(user => {
        if (user) {
            if (user.userID === obj.toID) {
                io.to(user._id).emit("server-send-typed", obj);
            }
        }
    }, err => console.log('GetOneUsers' + err + ''));
}

let GetUserOnline = (arrUsers, socket) => {
    let arrOnline = [];
    for (var onlineKey in arrUsers) {
        GetOneUsers(arrUsers[onlineKey])
            .then(user => {
                if (user) {
                    arrOnline.push(arrUsers[onlineKey]);
                }
            }, err => console.log(''));
    }
    setTimeout(function () {
            socket.emit("client-send-respon-online", {
                "arrUsers": arrOnline
            });
        }
        , 2000);
}


//ngay 20/03
//luu oppintment khinguoi dung offline
let CreateOppointment = (obj) => {
    return new Promise((resolve, reject) => {
        Oppointment.create({
            services_name: obj.services_name,
            services_id: obj.services_id,
            time_for_appointment: obj.time_for_appointment,
            status_from_provider: obj.status_from_provider,
            from_id: obj.from_id,
            to_id: obj.to_id,
            link_file: obj.link_file,
            user_deleted: obj.user_deleted
        }, function (err, oppoint) {
            if (err) return reject(new Error('CreateOppointment: obj: ' + obj));
            resolve(oppoint);
        });
    });
}

//luu Auction khi customer offline
let SaveAuctionOL = (obj, customer_id) => {
    return new Promise((resolve, reject) => {
        AuctionOffline.create({
            provider_id: obj.provider_id,
            auction_id: obj.auction_id,
            toID: customer_id,
            status: obj.status,
            from_price: obj.from_price,
            to_price: obj.to_price
        }, function (err, oppoint) {
            if (err) return reject(new Error('SaveAuctionOL: obj: ' + obj));
            resolve(oppoint);
        });
    });
}


// Xoa oppointment da doc
let DelOppoint = (_id) => {
    return new Promise((resolve, reject) => {
        GetOppointID(_id).then(
            opp => {
                if (opp) {
                    Oppointment.deleteOne({
                        "_id": _id
                    }, function (err, oppoint) {
                        if (err) return reject(new Error('DelOppoint: _id ' + _id));
                        resolve(oppoint.ok);
                    });
                }
                else {
                    resolve(0);
                }
            }
        );

    });
}

// Xoa Aution da doc
let DelAutionOL = (_id) => {
    return new Promise((resolve, reject) => {
        GetAuctionID(_id)
            .then(
                auction => {
                    if (auction) {
                        AuctionOffline.deleteOne({
                            "_id": _id
                        }, function (err, auction) {
                            if (err) return reject(new Error('DelAutionOL: toID ' + userID));
                            resolve(auction.ok);
                        });
                    } else {
                        resolve(0);
                    }
                }
            );
    });
}

//tim userid cua auction
let FindUserIDfolAutionID = (id) => {
    return new Promise((resolve, reject) => {
        AAuction.findOne({
            _id: id
        }, function (err, auction) {
            if (err)
                return reject(new Error('FindUserIDfolAutionID: khong lay duoc customer_id theo autionID ' + id));
            resolve(auction.customer_id);
        });
    });
}

// provider gui auction for
let ProviderSendAuction = (socket, obj) => {
    FindUserIDfolAutionID(obj.auction_id)
        .then(customer_id => {
                if (customer_id) {
                    SaveAuctionOL(obj, customer_id)
                        .then(auction => {
                                if (auction) {
                                    console.log(auction);
                                    GetOneUsers(customer_id).then(user => {
                                        if (user) {
                                            if (user.userID === customer_id) {
                                                io.to(user._id).emit("server-sent-auction-customer", auction);
                                            }
                                        } else {
                                            // sent Appointment iOS
                                            GetDeviceToken(customer_id)
                                                .then(token => {
                                                    let text_content = "You had reveiced a auction for services: ";
                                                    sendNotifyIOS(token, text_content, 1);
                                                }, err => console.log("android" + err));
                                            socket.broadcast.emit("server-send-person-disconnect", {
                                                "mOnline": obj.toID
                                            });
                                        }
                                    }, err => console.log(err + ''));
                                }
                            }
                            , err => console.log(err));
                }
            }
            , err => console.log(err));
}

//tim kiem OppointmentSchema
let GetOppointFromID = (to_id) => {
    return new Promise((resolve, reject) => {
        Oppointment.find({
            "to_id": to_id
        }, function (err, oppoints) {
            if (err) return reject(new Error('GetOppointToID: khong lay duoc oppoint theo to_id: ' + to_id));
            if (oppoints) {
                resolve(oppoints);
            } else {
                resolve(null);
            }
        });
    });
}

//tim kiem OppointmentSchema
let GetOppointID = (_id) => {
    return new Promise((resolve, reject) => {
        Oppointment.findOne({
            "_id": _id
        }, function (err, oppoint) {
            if (err) return reject(new Error('GetOppointID: khong lay duoc oppoint theo to_id: ' + to_id));
            if (oppoint) {
                resolve(oppoint);
            } else {
                resolve(null);
            }
        });
    });
}


let callbackOppointOffline = (oppoints, socketID) => {
    for (let key in oppoints) {
        //gui den nguoi nhan co id
        io.to(socketID).emit("server-sent-oppointment", {
            _id: oppoints[key]._id,
            services_name: oppoints[key].services_name,
            services_id: oppoints[key].services_id,
            time_for_appointment: oppoints[key].time_for_appointment,
            status_from_provider: oppoints[key].status_from_provider,
            from_id: oppoints[key].from_id,
            to_id: oppoints[key].to_id,
            link_file: oppoints[key].link_file,
            user_deleted: oppoints[key].user_deleted
        });
    }
}

//tim kiem Auction
let GetAuctionFromID = (toID) => {
    return new Promise((resolve, reject) => {
        AuctionOffline.find({
            "toID": toID
        }, function (err, auctions) {
            if (err) return reject(new Error('GetAuctionFromID: khong lay duoc auction theo toID: ' + toID));
            resolve(auctions);
        });
    });
}

//tim kiem Auction
let GetAuctionID = (_id) => {
    return new Promise((resolve, reject) => {
        AuctionOffline.findOne({
            "_id": _id
        }, function (err, auction) {
            if (err) return reject(new Error('GetAuctionFromID: khong lay duoc auction theo toID: ' + toID));
            if (auction) {
                resolve(auction);
            } else {
                resolve(null);
            }
        });
    });
}


let callbackAuctionOffline = (auctions, socketID) => {
    for (let key in auctions) {
        //gui den nguoi nhan co id
        io.to(socketID).emit("server-sent-auction-customer", {
            _id: auctions[key]._id,
            provider_id: auctions[key].provider_id,
            auction_id: auctions[key].auction_id,
            status: auctions[key].status,
            from_price: auctions[key].from_price,
            to_price: auctions[key].to_price
        });
    }
}


// khi co nguoi dung ket noi den server
io.on("connection", function (socket) {
    console.log("Co nguoi ket noi " + socket.id);
    // DANG KY NGUOI DUNG
    socket.on("client-connect-server", function (userID) {
        // console.log("Web Id: " + userID);
        if (userID) {
            Connectserver(socket, userID);
        }
    });

    socket.on("ios-connect-server", function (data) {
        // console.log("Web Id: " + userID);
        let obj = JSON.parse(data);

        if (obj) {
            IosConnect(socket, obj);
        }
    });

    socket.on("disconnect", function () {
        //khi nguoi dung ngat ket noi server
        DisconnectServer(socket);
    });
    //nhan tin nhan tu nguoi dung gui len va gui cho nguoi nhan
    socket.on("client-send-message-recever", function (data) {

        let obj = JSON.parse(data);
        obj.mTime = Date.now();
        if (obj) {
            if (!isNaN(Number(obj.Type))) {
                //send cho nguoi nhan

                SentMessageReceiver(obj, socket);
                //send cho nguoi gui
                SentMessageSender(obj);
                //leu cho nguoi gui
                SaveHistoryChatSender(obj);

                //luu cho nguoi nhan
                SaveHistoryChatReceiver(obj);
            }
        }

    });
    socket.on("client-send-oppointment", function (data) {
        // console.log(data);
        let obj = JSON.parse(data);
        // console.log(obj);
        if (obj) {
            SentAppointMentIOS(socket, obj);
        }
    });
    socket.on("client-send-message-seen", function (data) {
        let obj = JSON.parse(data);
        obj.mTime = Date.now();
        if (obj) {
            //gui da xem tin nhan
            console.log("seen"+obj);
            console.log(obj);
            SentMessageSeen(obj);
        }

    });
    socket.on("client-send-message-received", function (data) {
        let obj = JSON.parse(data);
        obj.mTime = Date.now();
        if (obj) {
            //gui da nhan tin nhan
            console.log("received"+obj);
            SentMessageReceived(obj);
        }

    });
    //kiem tra dang dang nhap du lieu
    socket.on("client-send-typing", function (data) {
        let obj = JSON.parse(data);
        obj.mTime = Date.now();
        if (obj) {
            //bao nguoi dung dang nhap du lieu
            console.log("typing"+obj);
            NotificationTyping(obj);
        }

    });
    //kime tra da ngung nhap du lieu
    socket.on("client-send-typed", function (data) {

        let obj = JSON.parse(data);
        obj.mTime = Date.now();
        if (obj) {
            //bao nguoi dung dang nhap du lieu
            console.log("typing"+obj);
            NotificationTyped(obj);
        }
    });

    socket.on("client-send-request-online", function (data) {
        let obj = JSON.parse(data);
        if (obj) {
            var userID = obj.userId;
            var arrUsers = obj.arrUsers;
            //{"userId":"dasjkdhsjdsj","arrUsers";["adasdsadasds","sdsdsdsada"]}
            GetUserOnline(arrUsers, socket);
        }
    });

    //ngay 20/03/2017

    //da xem oppointment
    socket.on("client-oppointment-seen", function (to_id) {
        if (to_id) {
            //xoa oppoint khi nguoi dung da doc
            DelOppoint(to_id);
        }
    });

    //nhan aution tu provider gui cho customer
    socket.on("provider-send-aution", function (data) {
        let obj = JSON.parse(data);
        if (obj) {
            ProviderSendAuction(socket, obj);
        }
    });

    //da xem oppointment
    socket.on("customer-auction-seen", function (userID) {
        if (userID) {
            //xoa oppoint khi nguoi dung da doc
            DelAutionOL(userID);
        }
    });

    //update membership
    socket.on("client-membership", function (data) {
        let obj = JSON.parse(data);
        if (obj) {
            UpdateMembership(socket, obj);
        }
    });

});


//create chathistory
let UpdateChatHistory = (mesage) => {
    return new Promise((resolve, reject) => {
        let myquery = {
            fromID: mesage.toID,
            toID: mesage.fromID,
        };

        let newvalues = {
            $set: {
                messageContent: mesage.messageContent,
                mTime: mesage.mTime,
                Type: mesage.Type,
                mFistName: mesage.mFistName,
                mLastName: mesage.mLastName,
                mImage: mesage.linkAvatar
            }
        };
        Chathistory.updateOne(myquery, newvalues, function (err, res) {
            if (err) return reject(new Error('UpdateChatHistory: mesage: ' + mesage));
            resolve(res);
        });


    });
}
//chat history
let UpdateChatHistorySender = (mesage) => {
    return new Promise((resolve, reject) => {
        let myquery = {
            fromID: mesage.fromID,
            toID: mesage.toID,
        };
        let newvalues = {
            $set: {
                messageContent: mesage.messageContent,
                mTime: mesage.mTime,
                Type: mesage.Type
            }
        };
        Chathistory.updateOne(myquery, newvalues, function (err, res) {
            if (err) return reject(new Error('UpdateChatHistory: mesage: ' + mesage));
            resolve(res);
        });
    });
}


let CreateChatHistory = (obj) => {
    return new Promise((resolve, reject) => {
        Chathistory.create({
            messageContent: obj.messageContent,
            fromID: obj.toID,
            toID: obj.fromID,
            mTime: obj.mTime,
            Type: obj.Type,
            mFistName: obj.mFistName,
            mLastName: obj.mLastName,
            mImage: obj.linkAvatar
        }, function (err, history) {
            if (err) return reject(new Error('co avatar'));
            resolve(history);
        });
    });
}


let GetUserfollowID = (userID) => {
    return new Promise((resolve, reject) => {
        GetCusM(userID)
            .then(CusM => {
                if (CusM === null) {
                    GetSerM(userID)
                        .then(SerM => {
                            if (SerM === null) return reject(new Error('GetUserfollowID:khong tim thay user ' + userID));
                            resolve(SerM);
                        }, err => {
                            console.log("loi GetSerM");
                        });
                }
                else {
                    resolve("loi CusM");
                }

            }, err => {
                console.log("GetUserfollowID");
            });
    });
}

//sender
let CreateChatHistorySender = (obj) => {
    return new Promise((resolve, reject) => {
        GetUserfollowID(obj.toID)
            .then(
                user => {
                    if (user) {
                        Chathistory.create({
                            messageContent: obj.messageContent,
                            fromID: obj.fromID,
                            toID: obj.toID,
                            mTime: obj.mTime,
                            Type: obj.Type,
                            mFistName: user.firstname,
                            mLastName: user.lastname
                        }, function (err, history) {
                            if (err) return reject(new Error('co avatar'));
                            resolve(history);
                        });
                    } else {
                        Chathistory.create({
                            messageContent: obj.messageContent,
                            fromID: obj.fromID,
                            toID: obj.toID,
                            mTime: obj.mTime,
                            Type: obj.Type
                        }, function (err, history) {
                            if (err) return reject(new Error('co avatar'));
                            resolve(history);
                        });
                    }

                },
                err => {
                    return reject(err);
                }
            );


    });

}


//luu history
let SaveHistoryChatReceiver = (mesage) => {
    GetOneChathistory(mesage.toID, mesage.fromID)
        .then(chathtr => {
                if (chathtr) {
                    UpdateChatHistory(mesage);
                    console.log("da co trong history");
                } else {
                    CreateChatHistory(mesage);
                    console.log("khong co history");
                }
            },
            err => {
                console.log(" loi tim history")
            });
}

//sender
let SaveHistoryChatSender = (mesage) => {
    GetOneChathistory(mesage.fromID, mesage.toID)
        .then(chathtr => {
                if (chathtr) {
                    UpdateChatHistorySender(mesage);
                    console.log("da co trong history");
                } else {
                    CreateChatHistorySender(mesage);
                    console.log("khong co history");
                }
            },
            err => {
                console.log(" loi tim history")
            });
}

// get 1 nguoi dung bang _id mongodb
let GetOneChathistory = (fromID, toID) => {
    return new Promise((resolve, reject) => {
        Chathistory.findOne({
            "fromID": fromID,
            "toID": toID
        }, function (err, chathtr) {
            if (err) return reject(new Error('GetOneChathistory: ' + fromID));
            resolve(chathtr);
        });
    });
}

router.get("/get_chat_history/:fromid", function (req, res) {
    Chathistory.find({'fromID': req.params.fromid}, function (err, history) {
        if (err) {
            res.json({'result': false});
        }
        else {
            res.json({'values': history});
        }
    });

});


//tao nguoi dung ofline
let CreateUserOff = (obj) => {
    return new Promise((resolve, reject) => {
        UserchatOff.create({
            userID: obj.userID,
            deviceToken: obj.deviceToken
        }, function (err, message) {
            if (err) return reject(new Error('CreateUserOff: obj: ' + obj));
            resolve(message);
        });
    });
}

// xoa nguoi offline
let DelUserOff = (userID) => {
    return new Promise((resolve, reject) => {
        UserchatOff.deleteMany(
            {
                userID: userID
            }
            , function (err, obj) {
                if (err) return reject(new Error('DelUserOff: userID: ' + userID));
                resolve(obj.result.n + " document(s) deleted");
            });
    });
}

// get all nguoi dung tu mongodb
let GetAllUserOff = (userID) => {
    return new Promise((resolve, reject) => {
        UserchatOff.find({
            "userID": userID
        }, function (err, users) {
            if (err) return reject(new Error('GetAllUserOff: khong lay duoc nguoi dung' + userID));
            resolve(users);
        });
    });
}



router.get("/get_chat_history/:fromid", function (req, res) {
    Chathistory.find({'fromID': req.params.fromid}, function (err, history) {
        if (err) {
            res.json({'result': false});
        }
        else {
            res.json({'values': history});
        }
    });

});

let CheckDeviceToken = (userID,deviceToken) =>
{
    return new Promise((resolve, reject) => {
        GetDeviceToken(userID).then(device=>{
            if (device) {
                if (device === deviceToken) {
                    resolve(true);
                }else{
                    resolve(false);
                }
            }},err=>{
            if (err) return reject(new Error('CheckDeviceToken: khong lay devicetoken' + userID));
        });
    });
}

//connect IOS server chat
let IosConnect =  (socket, obj) => {

    CheckDeviceToken(obj.userID, obj.deviceToken).then(
        res=>{
            if(res && res === true){
                Connectserver(socket, obj.userID);
            }else{
                socket.emit("server-send-request-disconect", {
                    "userId": obj.userID
                });
            }
        }
    );
}

//tim wallet

let GetOneUserWallet = (user_id) => {
    return new Promise((resolve, reject) => {
        MW.findOne({
            "user_id": user_id
        }, function (err, mw) {
            if (err) return reject(new Error('GetOneUserWallet: ' + user_id));
            resolve(mw);
        });
    });
}

let UpdatemembershipProvider = (obj) => {
    return new Promise((resolve, reject) => {
        let myquery = {
            _id: obj.userID
        };

        let newvalues = {
            $set: {
                member_ship: obj.mType
            }
        };
        SerM.updateOne(myquery, newvalues, function (err, res) {
            if (err) return reject(new Error('UpdatemembershipProvider: ' + obj));
            resolve(res);
        });
    });
}

let UpdateWallet = (obj,balance) => {
    return new Promise((resolve, reject) => {
        let myquery = {
            user_id: obj.userID
        };

        let newvalues = {
            $set: {
                balance: balance
            }
        };
        MW.updateOne(myquery, newvalues, function (err, res) {
            if (err) return reject(new Error('UpdateWallet: ' + balance));
            console.log(res);
            resolve(res);
        });
    });
}

let UpdateMembership = (socket,obj) => {
    GetOneUserWallet(obj.userID).then(
        res=>{
            if(res && res.balance >= obj.price){
                let temp = res.balance - obj.price;
                UpdateWallet(obj,temp).then(
                    wallet=>{
                        console.log(wallet);
                        if(wallet){
                            UpdatemembershipProvider(obj).then(
                                provider=>{
                                    console.log(provider);
                                    if(provider){
                                        console.log("true");
                                        socket.emit("update-membership", {
                                            "balance":wallet.balance,
                                            "update": true,
                                            "mType": obj.mType
                                        });
                                    }else{
                                        socket.emit("update-membership", {
                                            "update": false
                                        });
                                        console.log("false");
                                    }
                                }
                            );
                        }else{
                            socket.emit("update-membership", {
                                "update": false
                            });
                        }
                    }
                );

            }else{
                socket.emit("update-membership", {
                    "update": false
                });
            }
        }
    );
}


//upload file
var Storage = multer.diskStorage({

    destination:config.APath + '/asset/chat/',
    filename:function (req, file, cb) {
        cb(null,file.fieldname +'-'+Date.now()+
            path.extname(file.originalname));
    }


});

var upload = multer({
    storage: Storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    },
    limits:{
        fileSize: 1024 * 1024
    }
}).single('imgUploader'); //Field name and max count


router.post("/upload-image", function(req, res) {
    upload(req, res, function(err) {
        if (err){
            res.json({
                "response": false,
                "message": err
            });
        }  else{
            res.json({
                "response": true,
                "message": '/chat/'+req.file.filename
            });

        }
    });
});



module.exports = router;