const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//AUCTION FUNCTION
var CountUser = new Schema({
    type:{
        type:Number,
        default:0,
    },
    provider:{
        type:Boolean,
        default:true,
    },
    count:{
        type:Number,
        default:1,
    },
    updated_at : {
        type: Number,
    },
    created_at : {
        type: Number,
        default:Date.now
    },
});

module.exports = mongoose.model('countusers',CountUser);
