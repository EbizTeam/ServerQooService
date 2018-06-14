const mongoose = require('mongoose');

// Create Category Schema
const ServiceProviderBuyBannerData = new mongoose.Schema({
    provider_id: String,
    link_banner: String,
    dateApprove: Date,
    dateEnd: Date,
    isActived:{
        type:Boolean,
        default:false
    },
    create_at:{
        type:Date,
        default:Date.now
    },
    updated_at: {
        type:Date,
        default:Date.now
    },
});
// Create Category Model
module.exports = mongoose.model('ServiceProviderBuyBanner',ServiceProviderBuyBannerData);
