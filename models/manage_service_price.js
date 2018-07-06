const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//AUCTION FUNCTION
var ManageServicePrice = new Schema({
    Name : {
        type: String,
        lowercase: true,
    },
    Price : Number,
    Description : String,
    message : Number,
    date : Number,
    updated_at : {
        type: Date,
        default:Date.now
    },
    created_at : {
        type: Date,
        default:Date.now
    },
});

module.exports = mongoose.model('manage_service_price',ManageServicePrice);
