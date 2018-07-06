const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//AUCTION FUNCTION
var TrendsSchema = new Schema({
    key_name:String,
    count: {
        type:Number,
        default:1
    },
    updated_at : {
        type: Number,
    },
    created_at : {
        type: Number,
        default:Date.now
    },
});

module.exports = mongoose.model('keyservices',TrendsSchema);
