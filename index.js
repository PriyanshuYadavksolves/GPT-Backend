const express = require('express')
require('dotenv').config()
const cors = require('cors')

const connectDB = require('./connectDB/connectDB')
const authRoute = require('./routes/authRoute')
const app = express()

app.use(express.json())

app.use(cors({
  origin : "*"
}))


app.get('/hello',(req,res)=>{
    res.send("hello")
})

app.use('/api/auth',authRoute)


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