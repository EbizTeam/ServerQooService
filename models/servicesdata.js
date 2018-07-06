const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
});


module.exports = mongoose.model('services',ServiceData);
