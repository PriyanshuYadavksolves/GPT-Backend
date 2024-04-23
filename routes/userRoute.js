const express = require('express');
const { sessionChecker, verifyToken } = require('../middleware/verifyToken');
const {createChat, getAllChats, getOneChat, updateChat,deleteChat} = require('../controllers/userController');
const router = express.Router();

router.post('/query',sessionChecker,verifyToken,createChat)
router.post('/updateChat',sessionChecker,verifyToken,updateChat)
router.post('/getAllChat',sessionChecker,verifyToken,getAllChats)
router.get('/getOneChat/:chatId',sessionChecker,verifyToken,getOneChat)
router.delete('/deleteChat/:chatId',sessionChecker,verifyToken,deleteChat)

  
module.exports = router