const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "user",
  },
  chat: {
    type: mongoose.Types.ObjectId,
    ref: "chat",
  },
  text: {
    type: String,
    required: true,
  },
  role: {
    enum: ["user", "model"],
    default: "user",
  },
  timestamps: true,
});

const messageModel = mongoose.model("message", messageSchema);

module.export = {
  messageModel,
};
