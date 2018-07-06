const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//AUCTION FUNCTION
var CountUser = new Schema({
    accountID:String,
    provider:{
        type:Boolean,
        default:true,
    },
    amount:{
        type:Number,
        default:0,
    },
    updated_at : {
        type: Date,
    },
    created_at : {
        type: Date,
        default:Date.now
    },
});

module.exports = mongoose.model('amountofmoneys',CountUser);
