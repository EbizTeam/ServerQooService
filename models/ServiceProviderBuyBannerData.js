const mongoose = require('mongoose');

// Create Category Schema
const ServiceProviderBuyBannerData = new mongoose.Schema({
    provider_id: String,
    link_banner: String,
    create_at: Number,
    create_end: Number,
});
// Create Category Model
module.exports = mongoose.model('ServiceProviderBuyBanner',ServiceProviderBuyBannerData);