const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//AUCTION FUNCTION
var TrendsSchema = new Schema({
    service_name:String,
    views: {
        type:Number,
        default:0
    },
    updated_at : {
        type: Number,
    },
    created_at : {
        type: Number,
        default:Date.now
    },
});

module.exports = mongoose.model('trends',TrendsSchema);
