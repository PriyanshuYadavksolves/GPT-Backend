const mongoose = require("mongoose");
const validator = require("validator");
const otpGenerator = require("otp-generator");
const bcrypt = require('bcrypt')
const crypto = require('crypto')

const UserSchema = mongoose.Schema(
    {
        username: {
            type: String,
            unique: true,
            required: [true, "Please provide username"],
            minlnegth: [5, "Username must contain at least 5 characters"],
            maxlength: [30, "Username must not contain more than 30 characters"],
        },
        email: {
            type: String,
            unique: true,
            required: [true, "Please provide email"],
            validate: {
                validator: validator.isEmail,
                message: "Please provide valid email",
            },
        },
        password: {
            type: String,
            // required: [true, "Please provide password"],
            minlnegth: [6, "Password must contain at least 6 characters"],
        },
        profilePic:{
          type:String,
          default:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRD5iROb1TgJ_rcl-6r-68v1yjtID052zxSkw&usqp=CAU"
        },
        verificationToken: String,
        isVerified: {
            type: Boolean,
            default: false,
        },
        passwordResetToken: { type: String },
        passwordResetTokenExpirationDate: { type: Date },
        otp: { type: String },
        otpExpires: { type: Date },
    },
    { timeStamps: true }
);

UserSchema.pre('save',async function (){
    if(!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt)
  })

UserSchema.methods.createPasswordResetToken = function () {
    // generate random token
    const resetToken = crypto.randomBytes(32).toString("hex");
  
    // encrypt the token
    this.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // sets the time the reset password token expire (10 mins)
    this.passwordResetTokenExpirationDate = Date.now() + 10 * 60 * 1000;
    return resetToken;
  };

  UserSchema.methods.generateOTP = function () {
    const otp = otpGenerator.generate(6, {
      lowerCaseAlphabets:false,
      upperCaseAlphabets: false,
      specialChars: false,
      digits:true
    });
    this.otp = otp;
    this.otpExpires = Date.now() + 10 * 60 * 1000;
  
    return otp;
  };

module.exports = mongoose.model("Users", UserSchema);
