const mongoose = require('mongoose');

let ObjSchema = new mongoose.Schema({
    name : String,
    price : Number,
    description : String,
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

module.exports = mongoose.model('banner_ads_displays',ObjSchema);
