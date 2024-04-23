require('dotenv').config()
const session = require("express-session");
const MongoDBSessionStore = require("connect-mongodb-session")(session);

store = new MongoDBSessionStore({
    uri: process.env.MONGO_URL,
    collection: 'sessions' 
  });

  module.exports = store