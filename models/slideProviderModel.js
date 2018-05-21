const mongoose = require('mongoose');
//create service data
var SlideProvider = new mongoose.Schema({
    name_slide: String,
    desc_slide: String,
    link_slide: String,
    images: String,
    provider_id: String,
    created_at:Date,
    updated_at:Date,
});

module.exports = mongoose.model('slide_providers',SlideProvider);
