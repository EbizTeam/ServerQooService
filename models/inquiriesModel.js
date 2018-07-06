const mongoose = require('mongoose');
//create service data
var InquirySchema = new mongoose.Schema({
    serviceID: String,
    consumerID: String,
    providerID: String,
    content: String,
    agree: {
        type: Number,
        default:0, //0 là chưa đồng ý, 1 là đồng ý
    },
    updated_at : {
        type: Number,
    },
    created_at : {
        type: Number,
        default:Date.now
    },
});

module.exports = mongoose.model('inquiries',InquirySchema);

