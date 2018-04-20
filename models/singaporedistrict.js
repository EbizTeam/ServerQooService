const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Singapore's City or District
const SingaporeDistrict = new mongoose.Schema({
    /*COUNCIL DISTRICT
        1   :   South West
        2  :   North West
        3  :   Central Singapore
        4  :   North East
        5  :   South East
        */
    council_district: Number,
    city_name: String,
});

module.exports = mongoose.model('singaporedistrict',SingaporeDistrict);
