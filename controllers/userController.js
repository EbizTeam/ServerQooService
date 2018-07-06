'use strict';
const ChatUsers = require('../models/userchat');

// get all nguoi dung tu mongodb
let GetOneUsers = (userID) => {
    return new Promise((resolve, reject) => {
        ChatUsers.findOne({
            "userID": userID
        }, function (err, user) {
            if (err) return reject(err);
            resolve(user);
        });
    });
};
exports.GetOneUsers = GetOneUsers;
