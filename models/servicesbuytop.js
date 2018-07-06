const mongoose = require('mongoose');
//create service data
var ServiceBuyTopData = new mongoose.Schema({
    service_id: String,
    provider_id: String,
    ads_id: String,
    created_at:{
        type: Number,
        default: Date.now,
    },
    create_end:{
        type: Number,
        default: Date.now,
    },
});

module.exports = mongoose.model('servicesbuytop',ServiceBuyTopData);
