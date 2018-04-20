const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//create geolocation NinijasSchema
const subCatSchema = new Schema({
  subtitle:{
    type:String,
    required:[true,'Iduser field is required']
  },
  subicon:{
    type:String
  }
});

module.exports = mongoose.model('SubCat', subCatSchema);
