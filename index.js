const express = require('express')
require('dotenv').config()

const connectDB = require('./connectDB/connectDB')
const app = express()

app.get('/',(req,res)=>{
    res.send("hello")
})


const port = process.env.PORT || 5000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();