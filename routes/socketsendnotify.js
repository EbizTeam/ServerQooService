const sortBy = require('array-sort');
const express = require('express');
const routes = express.Router();
const spscategory = require('../models/spscategory');
const ChatUsers = require('../models/userchat');
const SerM = require('../models/serviceproviderdata');

var Async = require("async");
var apn = require('apn');



//tim nguoi dung provider
let GetSerM = (userID) => {
    return new Promise((resolve, reject) => {
        SerM.findOne({
            "_id": userID
        }, function (err, provider_account) {
            if (err)
                return reject(err);
            resolve(provider_account);
        });
    });
}

let GetDeviceToken = (userID) => {
    return new Promise((resolve, reject) => {
        GetSerM(userID)
            .then(SerM => {
                if (SerM === null) return reject(new Error('GetDeviceToken:khong tim thay token ' + userID));
                resolve(SerM.device_token);
            }, err => {
                console.log(err);
            });
    });
}


let SentAuctionProvider = (io, to_id) => {
    GetOneUsers(to_id).then(user => {
        if (user) {
            if (user.userID === to_id) {
                io.to(user._id).emit("server-notify-auction-provider", {"value":"You had reveiced a book auction from cuonsumer"});
            }
        } else {
            // sent Appointment iOS
            GetDeviceToken(to_id)
                .then(token => {
                        sendNotifyIOS(token, "You had reveiced a book auction from cuonsumer ", 1);

                }, err => console.log("android" + err));
        }
    }, err => console.log('GetOneUsers' + err));

}

// get all nguoi dung tu mongodb
let GetOneUsers = (userID) => {
    return new Promise((resolve, reject) => {
        ChatUsers.findOne({
            "userID": userID
        }, function (err, user) {
            if (err)
                return reject(err);
            resolve(user);
        });
    });
}

let FindIDserviceProvider = (category) => {
    let providerID = [];
    return new Promise((resolve, reject) => {
        spscategory.find({}, function (err, listsps) {
            if (err) {
                reject(err);
            }
            else {
                Async.forEachOf(listsps, function (item, key, callback) {
                    if (item.category_id.indexOf(category) > -1) {
                        providerID.push(item.provider_id);
                    }
                    callback();
                }, function (err) {
                    if (err) reject(err);
                    // configs is now a map of JSON data
                    resolve(providerID);
                });
            }
        });
    });
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


exports.initialize = function (server, io) {

    //let io = require('socket.io')(server);

    io.of('/send_notify')
        .on('connection', function (socket) {
            console.log("connect " + socket.id);

            socket.on("consumer-send-auction-category", function (category) {

                FindIDserviceProvider(category)
                    .then(
                        res => {
                            if (res.lenght > 0) {
                                for (let key in res){
                                    SentAuctionProvider(io, res[key]);
                                }
                            }
                        }
                        ,err => {
                            console.log(err);
                        }
                    );

            });
        });
};