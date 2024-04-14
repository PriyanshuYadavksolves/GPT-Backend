const User = require('../models/User')

const checkUserExist = async(req,res,next) =>{
    const {email,password,username} = req.body
    console.log(req.body)
      // Check we have all input feilds
  if (!email || !password || !username) {
    return res.status(422).json({ message: "Missing input field's " });
  }
    try {
        const {email,username} = req.body

        const user = await User.findOne({$or : [{email},{username}]})
        if(user){
            return res.status(501).json({message:"Email/Username Already Exists"})
        }
        next()
    } catch (error) {
        return res.status(502).json({message:error})
    }
}

module.exports = checkUserExist