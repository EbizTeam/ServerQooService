var mongoose = require('mongoose');
var Schema = mongoose.Schema;


const subCatSchema = new Schema({
  _id:{
    type:String,
    required:[true,'Iduser field is required']
  },
  subtitle:{
    type:String,
    required:[true,'Iduser field is required']
  },
  subicon:{
    type:String
  }
});

// const SubCat = mongoose.model('SubCat',subCatSchema);
//
// module.exports = SubCat;


const CategorySchema = new Schema({
  _id:{
    type:String,
    required:[true,'Iduser field is required']
  },title:{
    type:String,
    required:[true,'Iduser field is required']
  },
  icon:{
    type:String
  },
  subCat:
    {type: [subCatSchema] }
});

const Category = mongoose.model('Category',CategorySchema);

module.exports = Category;
