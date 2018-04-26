const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ServiceProviderComment = new Schema({
    provider_id:String,
    user_name:String,
    comment_title:String,
    comment_content:String,
    rating_star:Number,
    active:Boolean,
    create_at:Number,
});

module.exports = mongoose.model('ServiceProviderComment',ServiceProviderComment);