const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const AuctionSchema = new Schema({
    provider_id: String,
    auction_id: String,
    toID: String,
    status: String,
    from_price: String,
    to_price: String,
    updated_at : {
        type: Number,
    },
    created_at : {
        type: Number,
        default:Date.now
    },
});

const AuctionOffline = mongoose.model('AuctionOffline', AuctionSchema);

module.exports = AuctionOffline;
