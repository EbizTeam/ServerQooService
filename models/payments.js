const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create SPsPayment
var SPsPayment = new mongoose.Schema({
    provider_id: String,
    payment_type: String,
});

// Create Category Model
module.exports = mongoose.model('spspayment', SPsPayment);

