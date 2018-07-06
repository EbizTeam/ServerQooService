const mongoose = require('mongoose');
//create service data
const AccountBuyToChatData = new mongoose.Schema({
    user_id: String,
    service_id: String,
    create_end:Number,
    updated_at : {
        type: Number,
        default:Date.now
    },
    created_at : {
        type: Number,
        default:Date.now
    },
});

module.exports = mongoose.model('AccountBuyToChat',AccountBuyToChatData);
