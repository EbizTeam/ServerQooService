const mongoose = require('mongoose');
//create service data
var ServiceBuyTopData = new mongoose.Schema({
    service_id: String,
    provider_id: String,
    create_at:Number,
    create_end:Number,
    provider_id:String,
});

module.exports = mongoose.model('servicesbuytop',ServiceBuyTopData);
