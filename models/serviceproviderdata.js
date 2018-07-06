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
    imagesIntroduce: [],
    device_token: String,
    /*PROVIDER - MEMBERSHIP
        1   :   FREE
        2  :   SILVER
        3  :   GOLD
        4  :   PLATINUM
        */
    member_ship: {
        type:Number,
        default:1,
    },
    member_ship_time: {
        type:Number,
        default:Date.now,
    },
    confirm_status: Number,
    no_of_hight_recommended: {
        type:Number,
        default:0,
    },
    no_of_recommended: {
        type:Number,
        default:0,
    },
    no_of_neutral: {
        type:Number,
        default:0,
    },
    no_of_not_recommended: {
        type:Number,
        default:0,
    },
    positive_review:{
     type:Number,
     default:0,
    },
    neutral_review : {
        type:Number,
        default:0,
    },
    negative_review : {
        type:Number,
        default:0,
    },
    rating_star:{
        type:Number,
        default:3,
    },
    year_in_bussiness:{
        type:Number,
        default:1,
    },
    case_trust:{
        type:Boolean,
        default:false,
    },
    isPlatform: {
        type: Number,
        default: 0, //1 là android else ios
    },
    info_provider: String,
    logo_provider: String,
    linkweb: String,
    maps_latitude: String,
    maps_longitude: String,
    link_youtube: String,
    provider_id: {
        type: String,
        default: ""
    },
    isActived: {
        type: Boolean,
        default: false
    },
    isProvider: {
        type: Boolean,
        default: true
    },
    free_lancer: {
        type: Boolean,
        default: false
    },
    sendMail: {
        type: Number,
        default: 0,
    },
    created_at: {
        type:Number,
        default:Date.now,
    },
    updated_at: Number,
    date_change_membership: {
        type:Number,
        default:Date.now,
    },
});

module.exports = Mongoose.model("service_provider", ServiceProviderData);
