const AccountBuyChat = require('../models/accountbuychat');


// file config use to config all port,
const config = require('../config');
const urlapi = config.urlapi;


let FindCustomerbuyChat = (userID, service_id) => {
    return new Promise((resolve, reject) => {
        AccountBuyChat.findOne({
            'user_id': userID,
            'service_id': service_id
        }, function (err, buychat) {
            if (err) return reject(new Error('loi tim id: ' + userID));
            resolve(buychat);
        });
    });
}


let CheckBuyChat = (userID, service_id) => {
    return new Promise((resolve, reject) => {
        FindCustomerbuyChat(userID, service_id)
            .then(
                buychat => {
                    if (buychat) {
                        if (buychat.create_end > Date.now()) {
                            resolve(true);
                        }else{
                            resolve(false);
                        }
                    }
                    else {
                        resolve(false);
                    }
                },
                err => {
                    if (err) return reject(err);
                }
            );
    });
}

module.exports = CheckBuyChat;