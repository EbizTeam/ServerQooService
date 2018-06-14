const mongoose = require('mongoose');
//AUCTION FUNCTION
const AdminSchema = new mongoose.Schema({
    level: Number,
    password: String,
    username: String,
    email: String,
    fullname: String,
    avatar: String,
    latitude: Number,
    longitude:Number,
    mailSend: String,
    displayCurentcy: String,
    rateMoney: Number,
    curentcy: {
        type:String,
        default:"VND"
    },
    updated_at : {
        type: Date,
    },
    created_at : {
        type: Date,
        default:Date.now
    },
});
module.exports = mongoose.model('Admin',AdminSchema);
