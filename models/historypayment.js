const mongoose = require('mongoose');
//create service data
var HistoryPaymentData = new mongoose.Schema({
    payment: Number,
    user_id: String,
    create_at:Number,
    service:Number,
});

module.exports = mongoose.model('HistoryPaymentDatas',HistoryPaymentData);

