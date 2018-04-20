const mongoose = require('mongoose');

const Schema = mongoose.Schema;

//create geolocation NinijasSchema
const GeoSchema = new Schema({
  type:{
    type:String,
    default:"Point"
  },
  coordinates:{
    type:[Number],
    index:"2dsphere"
  }
});

const NinijasSchema = new Schema({
  name:{
    type:String,
    required:[true,'Name field is required']
  },
  rank:{
    type:String
  },
  available:{
    type:Boolean,
    default:false
  },
  geometry:GeoSchema

});

const Ninja = mongoose.model('ninja',NinijasSchema);

module.exports = Ninja;
