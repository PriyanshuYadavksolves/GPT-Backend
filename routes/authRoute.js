const express = require('express');
const router = express.Router();
const { sessionChecker, verifyToken } = require('../middleware/verifyToken');

const {register,verifyEmail,forgotPassword, resetPassword, google, login, logout, isValidUser} = require('../controllers/authController')
const checkUserExist = require('../middleware/checkUserExists');

router.post('/register',checkUserExist,register)
router.post('/verify-email',verifyEmail)
router.post('/reset-password',resetPassword)
router.post('/forgot-password',forgotPassword)
router.post('/google',google)
router.post('/login',login)
router.get("/logout", logout);
router.get("/isValidUser", sessionChecker,verifyToken,isValidUser);
  
module.exports = router