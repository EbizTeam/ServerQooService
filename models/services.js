const mongoose = require('mongoose');
//create service data
var ServiceData = new mongoose.Schema({
    services_id: String,
    name: String,
    detail: String,
    image: [],
    provider_id: String,
    sell_price: String,
    old_price: String,
    flash_sale: Number,
    top_service: Number,
    for_your_family: Number,
    best_for_lady: Number,
    category_id: String,
    sub_category_id: String,
    created_at: Number,
    isAuction: Number,
    updated_at: Number,
    active: {
        type: Boolean,
        default:false
    },
    countView: {
        type:Number,
        default:0,
    },
    rate_friendliness_s : {
        type:Number,
        default:0,
    },
    rate_price_s : {
        type:Number,
        default:0,
    },
    rate_attitude_s : {
        type:Number,
        default:0,
    },
    rate_services_s : {
        type:Number,
        default:0,
    },
    rate_friendliness_d : {
        type:Number,
        default:0,
    },
    rate_price_d : {
        type:Number,
        default:0,
    },
    rate_attitude_d : {
        type:Number,
        default:0,
    },
    rate_services_d : {
        type:Number,
        default:0,
    }
});
module.exports = mongoose.model('services',ServiceData);
