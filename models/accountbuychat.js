const mongoose = require('mongoose');
//create service data
var AccountBuyToChatData = new mongoose.Schema({
    user_id: String,
    service_id: String,
    create_at:Number,
    create_end:Number,
});

module.exports = mongoose.model('AccountBuyToChat',AccountBuyToChatData);
