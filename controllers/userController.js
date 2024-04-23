const openai = require("../openAi/openAIProvider");
const Chat = require("../models/Chat");

async function main(data) {
  const completion1 = await openai.chat.completions.create({
    messages: data,
    model: "gpt-3.5-turbo",
  });
  return completion1.choices[0].message;
}

const getAllChats = async(req,res)=>{
    const {username} = req.body
    console.log(req.body)
    try {
        const chat =await Chat.find({sender:username})
        // console.log(chat)
        res.status(200).json(chat)

    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

const getOneChat = async(req,res)=>{
    const {chatId} = req.params
    console.log(req.params)
    try {
        const chat = await Chat.findById(chatId)
        res.status(200).json(chat)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

const createChat = async (req, res) => {
  let {username, msg, data } = req.body;
  data.push({
    role: "user",
    content: msg,
  });
  const chat = await Chat.create({
    sender: username,
    title:msg,
    data: data,
  });

  console.log("data = ", data);
  try {
    const response = await main(data);
    console.log("res = ", response);
    chat.data.push(response);
    await chat.save();
    res.status(200).json({ response,chat });
  } catch (error) {
    console.log(error);
  }
};

const updateChat = async(req,res)=>{
    const {chatId,msg} = req.body
    try {
        const chat =await Chat.findById(chatId)
        // console.log(chat)
        chat.data.push({
            role:"user",
            content:msg,
        })
        const response = await main(chat.data)
        chat.data.push(response)
        await chat.save()
        res.status(200).json({response})
    } catch (error) {
        console.log(error)
    }
}

const deleteChat = async(req,res)=>{
  const {chatId} = req.params
  try {
    const chat = await Chat.findByIdAndDelete(chatId)
    res.status(200).json("deleted")
  } catch (error) {
    res.status(500).json(error)
  }
}



module.exports = { createChat,updateChat,getAllChats,getOneChat,deleteChat };
