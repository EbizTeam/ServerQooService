const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//AUCTION FUNCTION
var ManageMembershipSchema = new Schema({
    Name : String,
    Id_Membership : Number,
    Abillity_Instant : Number,
    Access_full_consumer : Number,
    Customized_Website : Number,
    Image_storage_size : Number,
    Monthly_Fee : Number,
    My_Report : Number,
    Personalized_Customer : Number,
    Search_Priority :  Number,
    Service_Industry : Number,
    Services_Performance : Number,
    Services_Posting :Number,
    Sub_Accounts : Number,
    updated_at : {
        type: Date,
    },
    created_at : {
        type: Date,
        default:Date.now
    },
});

module.exports = mongoose.model('manage_membership',ManageMembershipSchema);
