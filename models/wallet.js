const Mongoose = require('mongoose');

var MyWallet = new Mongoose.Schema({
    user_id: String,
    balance: Number,
    updated_at : {
        type: Date,
        default:Date.now
    },
    created_at : {
        type: Date,
        default:Date.now
    }
});


module.exports = Mongoose.model("my_wallet", MyWallet);
