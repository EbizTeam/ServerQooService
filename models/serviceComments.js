const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//create Customer Comment
const ServiceComment = new mongoose.Schema({
    consumer_id: String,
    name: String,
    title_comment: String,
    services_id: String,
    provider_id: String,
    comment: String,
    /*RATE
        0   :   Dissatisfied
        1   :   Saticfied
        */
    rate_services: {
        type:Number,
        default:1,
    },
    rate_attitude:  {
        type:Number,
        default:1,
    },
    rate_price:  {
        type:Number,
        default:1,
    },
    rate_friendliness:{
        type:Number,
        default:1,
    },
    /*RECOMMENDED
        1   :   High
        2  :   Recommended
        3  :   Neutral
        4  :   Not Recommended
        */
    recommenrded: {
        type:Number,
        default:4,
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
    },
});

module.exports = mongoose.model('service_comments',ServiceComment);
