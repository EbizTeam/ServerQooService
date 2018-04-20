const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const ChatHistorySchema = new Schema({
    messageContent: String,
    fromID: String,
    toID: String,
    mTime: String,
    Type: String,
    mFistName: String,
    mLastName: String,
    mImage:String
});

const Chathistory = mongoose.model('Chathistory', ChatHistorySchema);

module.exports = Chathistory;