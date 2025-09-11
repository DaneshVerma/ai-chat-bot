const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");

function initSocket(httpServer) {
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("A user connected");
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

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
}

module.exports = initSocket;
