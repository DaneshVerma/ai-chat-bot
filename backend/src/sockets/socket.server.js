const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const aiService = require("../services/ai.service");
const messageModel = require("../models/message.model");
const { v4: uuidv4 } = require("uuid");
const { HumanMessage, AIMessage } = require("@langchain/core/messages");

function initSocket(httpServer) {
  const io = new Server(httpServer);

  io.use((socket, next) => {
    const cookies = socket.handshake.headers.cookie;

    const { token } = cookies ? cookie.parse(cookies) : {};

    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.user = decoded;

      next();
    } catch (err) {
      return next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("A user connected");

    console.log(socket.user);

    socket.on("ai-message", async (message) => {
      try {
        const messageId = uuidv4();

     

        // Validate message input
        if (!message || !message.text || !message.chat) {
          console.error("Invalid message format received:", {
            message: !!message,
            text: message?.text,
            chat: message?.chat,
          });
          return;
        }

        await messageModel.create({
          chat: message.chat,
          user: socket.user.id,
          role: "user",
          text: message.text,
        });

        const history = (
          await messageModel.find({
            chat: message.chat,
          })
        ).map((message) =>
          message.role === "user"
            ? new HumanMessage(message.text)
            : new AIMessage(message.text)
        );

        const result = await aiService.generateStream(
          { messages: history },
          (text) => {
            socket.emit("ai-response", {
              _id: messageId,
              chat: message.chat,
              text,
            });
          }
        );

        // Only save the message if result has content
        if (result && result.trim().length > 0) {
          await messageModel.create({
            chat: message.chat,
            user: socket.user.id,
            role: "model",
            text: result,
          });
        } else {
          console.error(
            "AI service returned empty result, not saving to database"
          );
        }
      } catch (error) {
        console.error("Error processing AI message:", error);
        socket.emit("error", { message: "Failed to process AI message" });
      }
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
}

module.exports = initSocket;
