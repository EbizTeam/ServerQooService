const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TopServicesData = new mongoose.Schema({
    name: String,
    images: [],
    provider_id: String,
    sell_price: String,
    old_price: String
});

module.exports = mongoose.model('topservices',TopServicesData);
