const mongoose = require('mongoose');
const Schema = mongoose.Schema;



// Create SpsCategory
const SPsCategory = new Schema({
    provider_id: String,
    category_id: String,
});


module.exports = mongoose.model("spscategory", SPsCategory);
