const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const validation = require("../middlewares/validation.middleware");
const chatController = require("../controllers/chat.controller");

const router = express.Router();

/* POST /api/chat/ */
router.post(
  "/",
  authMiddleware.authUser,
  validation.createChatValidation,
  chatController.createChat
);

module.exports = router;
