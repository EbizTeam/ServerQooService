const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const MessagesSchema = new Schema({
  _id: String,
    messageContent: String,  
    fromID: String,
    toID: String,
    mTime: String,
    Type: String,
    mFistName: String,
    mLastName: String,
    linkAvatar: String,
});

const Messages = mongoose.model('Messages',MessagesSchema);

module.exports = Messages;

