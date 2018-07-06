const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ServiceProviderComment = new Schema({
    provider_id: String,
    user_name: String,
    comment_title: String,
    comment_content: String,
    rating_star: {
        type: Number,
        default:3,
        min: 1,
        max: 5,
    },
    active: {
        type: Boolean,
        default: false,
    },
    created_at: {
        type: Number,
        default: Date.now,
    },
    updated_at: {
        type: Number,
        default: Date.now,
    },
});

module.exports = mongoose.model('ServiceProviderComment', ServiceProviderComment);
