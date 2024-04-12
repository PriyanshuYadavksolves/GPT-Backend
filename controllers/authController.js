const User = require("../models/User");

const verificationEmail = require("../emailServices/sendVerificationEmail");
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

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

    const url = `http://localhost:3000/verify?token=${verificationToken}&email=${email}`;
    const verificationEmailContent = verificationEmail({ username, url });

    transporter.sendMail(
      {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: "Tridium's Blog Account Verification",
        html: verificationEmailContent,
      },
      (err, res) => {
        if (err) {
          console.log(err);
          // return res.json({message:"Service unavailable"})
        } else {
          console.log("msg sent");
        }
      }
    );
    res.status(201).json({
      message: `Sent a verification email to ${email}`,
    });
  } catch (error) {
    res.status(500).json(err);
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
    if (user.verificationToken !== verificationToken) {
      return res.status(404).json({ message: "Token is Not Correct" });
    }

    if (user.verified) {
      return res.status(200).json({ message: "user already verified" });
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
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).json({
      message: "Missing email/password.",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "Email does not exists",
      });
    }

    const validated = await bcrypt.compare(password, user.password);
    if (!validated) {
      return res.status(400).json("wrong credentials!");
    }

    if (!user.isVerified) {
        return res.status(403).json({
          message: "Please verify your email",
        });
      }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET, {
      expiresIn: "3d",
    });

    const { password, createdAt, updatedAt, __v, ...others } = user._doc;
    res.status(200).json({ others, token });
  } catch (error) {
    return res.status(503).json({ err, message: "Service unavailable" });
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
      // Generate the reset token
      const resetToken = user.createPasswordResetToken();
      // Generate OTP
      const OTP = user.generateOTP();
      // console.log(OTP)
      await user.save();
  
      const subject = "Tridium Reset Password";
      const resetURL = `http://localhost:5173/user/reset-password?token=${resetToken}&email=${email}`;
      const message = `<p>Please reset password by clicking on the following link : 
    <a href="${resetURL}">Verify Email</a> </p>\n Please enter OTP to reset password :
    <h1 style="font-size: 40px; letter-spacing: 2px; text-align:center;">${OTP}</h1>`;
  
      await sendEmail({
        name: user.name,
        email: user.email,
        subject,
        message,
      });
  
      res.status(200).json({
        message: "Please check your email for reset password link",
      });
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpirationDate = undefined;
      await user.save();
      res.status(503)({ error, message: "service unavailable" });
    }
  };

  const resetPassword = async (req, res) => {
    const { token, email, otp, password } = req.body;
  
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
        otpExpires <= currentDate
      ){
        return res
        .status(410)
        .json({ message: "Token/OTP is invalid or has expired" });
      }
  
      // Check if Last password is same as Current One
      if (await bcrypt.compare(password,user.password)) {
        return res
          .status(400)
          .json({ message: "This Password is same as last password" });
      }
  
      //reset password
      user.password = password
  
      //Remove passwordResetToken
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      user.otp = null;
      user.otpExpires = null;
      await user.save();

      res.status(205).json({
        message:"Password reset successfully"
      });
    } catch (error) {
      res.status(500).json({error,message:"Service unavilable"});
    }
  };


module.exports = { 
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
