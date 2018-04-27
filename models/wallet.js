const Mongoose = require('mongoose');

var MyWallet = new Mongoose.Schema({
    user_id: String,
    balance: Number,
});


module.exports = Mongoose.model("my_wallet", MyWallet);
