const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//PROVIDER SENT AUCTION
var ProviderSentAuction = new Schema({
    provider_id: String,
    auction_id: String,
    status: String,
    from_price: String,
    to_price: String,
    create_at: Number,
});

module.exports = mongoose.model('providersentauctions',ProviderSentAuction);
