const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//PROVIDER SENT AUCTION
var ProviderSentAuction = new Schema({
    provider_id: String,
    auction_id: String,
    status: {
        type: String,
        default: "Sent Auction",
    },
    from_price: {
        type: Number,
        default: 0
    },
    to_price: {
        type: Number,
        default: 0
    },
    updated_at : {
        type: Number,
    },
    created_at : {
        type: Number,
        default:Date.now
    },
});

module.exports = mongoose.model('providersentauctions',ProviderSentAuction);
