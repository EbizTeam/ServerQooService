const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserchatOffSchema = new Schema({
    userID: String,
    deviceToken: String
});

const Userchatoff = mongoose.model('Userchatoff', UserchatOffSchema);

module.exports = Userchatoff;
