const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//BOOK APPOINTMENT
const BookAppointment = new mongoose.Schema({
    services_name: String,
    services_id: String,
    time_for_appointment: String,
    status_from_provider: String,
    from_id: String,
    to_id: String,
    link_file: String,
    user_deleted: String,
    time_insert: String,
});

module.exports = mongoose.model('bookappointment',BookAppointment);
