const mongoose = require('mongoose');
//create service data
var HistoryPaymentData = new mongoose.Schema({
    payment: Number,
    user_id: String,
    service:Number,
    content_service:String,
    updated_at : {
        type: Number,
        default:Date.now
    },
    created_at : {
        type: Number,
        default:Date.now
    },
});

module.exports = mongoose.model('HistoryPaymentDatas',HistoryPaymentData);

