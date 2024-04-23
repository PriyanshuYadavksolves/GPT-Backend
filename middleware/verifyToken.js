const jwt = require('jsonwebtoken');

// Middleware to check session
const sessionChecker = (req, res, next) => {
  // console.log(req.cookies)
  const sessionId = req.cookies && req.cookies.sCookie && req.cookies.sCookie.split(':')[1].split('.')[0]
  if(!sessionId){
    return res.status(401).json({ message: "Session doesn't exist" });
  }
  
  if ((req.sessionID === sessionId) && req.session.userId) {
    console.log(`Found User Session`);
    next();
  } else {
    console.log(`No User Session Found`);
    return res.status(401).json({message:"Sesssion Expires"})
  }
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 
  if (!token) {
    console.log("fail ho gya")
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    const { id, username } = decoded
    req.user = { id, username }
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = {verifyToken,sessionChecker};
