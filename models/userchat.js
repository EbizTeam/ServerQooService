const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsersSchema = new Schema({
  _id:String,
  userID:String
});

const ChatUsers = mongoose.model('ChatUsers',UsersSchema);

module.exports = ChatUsers;
