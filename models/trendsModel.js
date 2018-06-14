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
        type: Date,
    },
    created_at : {
        type: Date,
        default:Date.now
    },
});

module.exports = mongoose.model('trends',TrendsSchema);
