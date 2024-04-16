const User = require("../models/User");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcrypt')

const verificationEmail = require("../emailServices/sendVerificationEmail");
const resetPasswordEmail = require('../emailServices/sendResetPasswordEmail.js')
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const google =  async (req, res) => {
  const client = new OAuth2Client(process.env.CLIENT_ID);
  const { token } = req.body;
  // console.log(req.body)
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,
    });
    const { name, email, picture } = ticket.getPayload();
    let user = await User.findOne({ email },{username:1,email:1,profilePic:1,password:1,_id:1});    
    if(!user){
      user = await User.create({
        username:name,
        email,
        isVerified : true,
        profilePic:picture
      })
    }else{
      user.isVerified = true
      await user.save();
    }
    
    const loginToken = jwt.sign({ userId: user._id }, process.env.SECRET, { expiresIn: '1h' });
    const { password, ...others } = user._doc;

    res.status(200).json({loginToken,others});

  } catch (error) {
    console.log(error)
    res.status(500).json({messgae:"service Unavailable"})
  }
};

const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const verificationToken = crypto.randomBytes(40).toString("hex");

    const user = await User.create({
      username,
      email,
      password,
      verificationToken,
    });

    const url = `http://localhost:5173/user/verify-email?token=${verificationToken}&email=${email}`;
    const verificationEmailContent = verificationEmail({ username, url });

    transporter.sendMail(
      {
        from: process.env.TEMP_EMAIL,
        to: email,
        subject: "KGPT's Account Verification",
        html: verificationEmailContent,
      },
      (err, res) => {
        if (err) {
          console.log(err);
          return res.json({ message: "Service unavailable" });
        } else {
          console.log("msg sent");
        }
      }
    );
    res
      .status(201)
      .json({ user, message: `Sent a verification email to ${email}` });
  } catch (error) {
    console.log(error);
    res.status(503).json(error);
  }
};

const verifyEmail = async (req, res) => {
  const { verificationToken, email } = req.body;

  // Check we have an token or email
  if (!verificationToken || !email) {
    return res.status(401).json({ message: "Missing Token/Email" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    if (user.isVerified) {
      return res.status(200).json({ message: "user already verified" });
    }
    if (user.verificationToken !== verificationToken) {
      return res.status(500).json({ message: "Token is Not Correct" });
    }

    user.isVerified = true;
    user.verificationToken = "";
    await user.save();

    res.status(200).json({ message: "Email Verified" });
  } catch (error) {
    res.status(503).json(error);
  }
};

const login = async (req, res) => {
  const { email ,password} = req.body;
  console.log(req.body)

  if (!email || !password) {
    return res.status(422).json({
      message: "Missing email/password.",
    });
  }

  try {
    const user = await User.findOne({ email },{username:1,email:1,profilePic:1,password:1,isVerified:1,_id:1});
    if (!user) {
      return res.status(404).json({
        message: "Email does not exists",
      });
    }

    const validated = await bcrypt.compare(req.body.password, user.password);
    if (!validated) {
      return res.status(400).json({message:"wrong credentials!"});
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET, {
      expiresIn: "3d",
    });

    const { password,isVerified ,...others } = user._doc;
    res.status(200).json({ others, token });
  } catch (error) {
    console.log(error)
    return res.status(503).json({ error, message: "Service unavailable" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Check we have email
  if (!email) {
    return res.status(422).json({
      message: "Missing email.",
    });
  }

  // find the user, if present in the database
  const user = await User.findOne({ email });
  
  if (!user) {
    return res
    .status(401)
    .json({ message: "This Email Not Exist, Enter Correct Email" });
  }
  
  try {
    const username = user.username
    const resetToken = user.createPasswordResetToken();
    // Generate OTP
    const otp = user.generateOTP();
    // console.log(OTP)
    await user.save();

    
    const url = `http://localhost:5173/user/reset-password?token=${resetToken}&email=${email}`;
    const resetPasswordEmailContent = resetPasswordEmail({ username,otp, url });

    transporter.sendMail(
      {
        from: process.env.TEMP_EMAIL,
        to: email,
        subject: "KGPT's Reset Password",
        html: resetPasswordEmailContent,
      },
      (err, res) => {
        if (err) {
          console.log(err);
          return res.json({ message: "Service unavailable" });
        } else {
          console.log("msg sent");
        }
      }
    );

    res.status(200).json({
      message: "Please check your email for reset password link",
    });
  } catch (error) {
    console.log(error)
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpirationDate = undefined;
    await user.save();
    res.status(503)({ error, message: "service unavailable" });
  }
};

const resetPassword = async (req, res) => {
  const { verificationToken:token, email, otp, password } = req.body;

  if (!token || !email) {
    return res.status(422).json({ message: "Missing Token/Email" });
  }
  if (!otp || !password) {
    return res.status(422).json({ message: "Missing OTP/Password" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "Email does not exists",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // validate user based on the token and otp
    const currentDate = new Date();

    if (
      user.passwordResetToken !== hashedToken ||
      user.passwordResetTokenExpirationDate <= currentDate ||
      user.otp !== otp ||
      user.otpExpires <= currentDate
    ) {
      return res
        .status(410)
        .json({ message: "Token/OTP is invalid or has expired" });
    }

    // // Check if Last password is same as Current One
    // if (await bcrypt.compare(password, user.password)) {
    //   return res
    //     .status(400)
    //     .json({ message: "This Password is same as last password" });
    // }

    //reset password
    user.password = password;

    //Remove passwordResetToken
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error, message: "Service unavilable" });
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  google
};
