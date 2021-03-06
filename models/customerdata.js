const Mongoose = require('mongoose');

// Create Customer Schema
var CustomerData = new Mongoose.Schema({
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    mobile: String,
    building_name: String,
    postal_code: String,
    city: String,
    country: String,
    birth_date: String,
    sex: String,
    home_number: String,
    linkavatar: String,
    address1: String,
    address2: String,
    device_token_old: String,
    device_token: String,
    isActived: Boolean,
    occupation: String,
    member_ship: Number,
    member_ship_time: Number,
    confirm_status: Number,
    isPlatform:{
       type: Number,
        default:0,  //1 là android else ios
    },
    created_at: {
        type: Number,
        default:Date.now(),
    },
    updated_at: Number,

});


module.exports =  Mongoose.model("customer", CustomerData);

