const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const aiService = require("../services/ai.service");
const { messageModel } = require("../models/message.model");
const { v4: uuidv4 } = require("uuid");

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173", // Adjust this to your frontend's origin
      credentials: true,
    },
  });
  io.use((socket, next) => {
    const cookies = socket.handshake.headers.cookie;
    const { token } = cookies ? cookie.parse(cookies) : {};

    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      console.log(decoded);

      next();
    } catch (err) {
      return next(new Error("Invalid token"));
    }
  });
  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("ai-message", async (payload) => {
      const messageId = uuidv4();
      await messageModel.create({
        chat: payload.chat,
        user: socket.user.id,
        role: "user",
        text: payload.message,
      });
      const history = (
        await messageModel.find({
          chat: payload.chat,
        })
      ).map((message) => {
        return {
          role: message.role,
          parts: [
            {
              text: message.text,
            },
          ],
        };
      });
      const response = await aiService.generateStreamResponse(
        history,
        (text) => {
          socket.emit("ai-response", {
            _id: messageId,
            chat: payload.chat,
            text,
          });
        }
      );
      await messageModel.create({
        chat: payload.chat,
        user: socket.user.id,
        role: "model",
        text: response,
      });
    });
    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
}

module.exports = initSocket;
