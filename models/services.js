const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create service data
var ServiceData = new mongoose.Schema({
    services_id: String,
    name: String,
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
    isAuction: Number
});


module.exports = mongoose.model('services',ServiceData);
