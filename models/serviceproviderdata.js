const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

var ServiceProviderData = new Mongoose.Schema({
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
    company_name: String,
    retail_outlets: String,
    any_operation_overseas: String,
    status: String,
    businesstitle_position: String,
    job_responsibilities: String,
    office_number: String,
    main_office_address1: String,
    main_office_address2: String,
    device_token_old: String,
    device_token: String,
    isActived: Boolean,
    /*PROVIDER - MEMBERSHIP
        1   :   FREE
        2  :   SILVER
        3  :   GOLD
        4  :   PLATINUM
        */
    member_ship: Number,
    member_ship_time: Number,
    confirm_status: Number,
    /*Recommended
        */
    no_of_hight_recommended: Number,
    no_of_recommended: Number,
    no_of_neutral: Number,
    no_of_not_recommended: Number,
    isPlatform: Number,
});

module.exports = Mongoose.model("service_provider", ServiceProviderData);
