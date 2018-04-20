const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const  MyWalletSchema = new mongoose.Schema({
    user_id: String,
    balance: Number,
});

module.exports = mongoose.model('Wallet',MyWalletSchema);
