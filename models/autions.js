const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//AUCTION FUNCTION
var Auction = new Schema({
    customer_id: String,
    category_id: String,
    sub_category_id: String,
    status: {
        type: String,
        default: "New Auction"
    },
    time_auction: {
        type: Number,
        default:Date.now
    },
    num_of_order_list: {
        type: Number,
        default:0
    },
    link_file: String,
    user_deleted: {
        type: String,
        default:""
    },
    updated_at : {
        type: Number,
    },
    created_at : {
        type: Number,
        default:Date.now
    },
});

module.exports = mongoose.model('auctions',Auction);
