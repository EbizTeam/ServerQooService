const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//create Customer Comment
const CustomerComment = new mongoose.Schema({
    customer_comment_id: String,
    name: String,
    title_comment: String,
    services_id: String,
    comment: String,
    /*RATE
        0   :   Dissatisfied
        1   :   Saticfied
        */
    rate_services: String,
    rate_attitude: String,
    rate_price: String,
    rate_friendliness: String,
    /*RECOMMENDED
        1   :   High
        2  :   Recommended
        3  :   Neutral
        4  :   Not Recommended
        */
    recommenrded_this_provider: String
});

module.exports = mongoose.model('customercomment',CustomerComment);
