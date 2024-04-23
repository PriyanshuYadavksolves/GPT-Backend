require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser')
const session = require("express-session");

const store = require('./connectDB/sessionStore')
const connectDB = require("./connectDB/connectDB");
const authRoute = require("./routes/authRoute");
const userRoute = require('./routes/userRoute')

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    name: `sCookie`,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store, 
  })
);


app.get('/hello',(req,res)=>{
  res.send('hello')
})
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);

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
