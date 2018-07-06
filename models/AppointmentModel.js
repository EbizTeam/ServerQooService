const mongoose = require('mongoose');
//create service data
var BookAppointment = new mongoose.Schema({
    services_name: String,
    services_id: String,
    time_for_appointment: String,
    status_from_provider: {
        type: String,
        default: "In Review"
    },
    from_id: String,
    description: String,
    to_id: String,
    link_file: String,
    user_deleted: {
        type: String,
        default:""
    },
    time_insert:  {
        type: Number,
        default:Date.now
    },
    updated_at : {
        type: Number,
    },
    created_at : {
        type: Number,
        default:Date.now
    },
});

module.exports = mongoose.model('bookappointment',BookAppointment);

