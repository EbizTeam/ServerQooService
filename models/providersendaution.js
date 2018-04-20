const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//PROVIDER SENT AUCTION
var ProviderSentAuction = new mongoose.Schema({
    provider_id: String,
    auction_id: String,
    status: String,
    from_price: String,
    to_price: String,
});

module.exports = mongoose.model('providersentauction',ProviderSentAuction);
