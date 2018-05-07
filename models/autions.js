const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//AUCTION FUNCTION
var Auction = new Schema({
    customer_id: String,
    category_id: String,
    sub_category_id: String,
    status: String,
    time_auction: String,
    num_of_order_list: Number,
    link_file: String,
    user_deleted: String,
    create_at: String,
});

module.exports = mongoose.model('auction',Auction);
