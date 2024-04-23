require('dotenv').config()
const  OpenAI =  require("openai");

const openai = new OpenAI({
    organization: process.env.ORGANIZATION,
    project: process.env.PROJECT,
    apiKey:process.env.APIKEY
  });


module.exports = openai

