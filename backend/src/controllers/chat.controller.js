const chatModel = require('../models/chat.model');
const messageModel = require("../models/message.model")

async function createChat(req, res) {
    const { title } = req.body;

    const chat = await chatModel.create({
        title,
        user: req.user.id
    })

    res.status(201).json({
        message: "Chat created successfully",
        chat
    })


}

const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await messageModel.find({ chat: chatId }); // Assuming your Message model has a 'chat' field referencing the chat ID
    res.status(200).json({ messages });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).json({ message: "Failed to fetch chat messages" });
  }
};

async function getUserChats(req, res) {
    const chats = await chatModel.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({
        chats
    })
}

module.exports = {
    createChat,
    getUserChats,
    getChatMessages
}