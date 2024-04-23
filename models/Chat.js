const mongoose = require('mongoose');

// Define schema
const chatSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
  },
  title:{
    type:String
  },
  data: {
    type: Array,
  },

},{timeStamps : true});

// Define model
const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
