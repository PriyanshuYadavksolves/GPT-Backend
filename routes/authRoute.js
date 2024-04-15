const express = require('express');
const router = express.Router();
const {register,verifyEmail,forgotPassword, resetPassword} = require('../controllers/authController')
const checkUserExist = require('../middleware/checkUserExists')

router.post('/register',checkUserExist,register)
router.post('/verify-email',verifyEmail)
router.post('/reset-password',resetPassword)
router.post('/forgot-password',forgotPassword)



module.exports = router