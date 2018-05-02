const AccountBuyChat = require('../models/accountbuychat');
const Wallet = require('../models/wallet');

// file config use to config all port,
const config = require('../config');
const urlapi = config.urlapi;


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