const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// Create Category Schema
const CCategory = new mongoose.Schema({
    icon: String,
    title: String,
    is_auction: Number,
    subCat: [],

});
// Create Category Model
module.exports = mongoose.model('Categorymenu',CCategory);

