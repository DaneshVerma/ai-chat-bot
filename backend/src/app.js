const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);

// Serve static files from public directory
app.use(express.static("public"));

module.exports = app;
