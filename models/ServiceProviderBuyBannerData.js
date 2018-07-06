const mongoose = require('mongoose');

// Create Category Schema
const ServiceProviderBuyBannerData = new mongoose.Schema({
    provider_id: String,
    link_banner: String,
    ads_id:String,
    dateApprove: Number,
    dateEnd: Number,
    isActived:{
        type:Boolean,
        default:false
    },
    created_at:{
        type:Number,
        default:Date.now
    },
    updated_at: {
        type:Number,
        default:Date.now
    },
});
// Create Category Model
module.exports = mongoose.model('ServiceProviderBuyBanner',ServiceProviderBuyBannerData);
