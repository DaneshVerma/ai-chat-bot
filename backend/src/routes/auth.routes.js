const express = require('express');
const validation = require("../middlewares/validaton.middleware")
const authController = require("../controllers/auth.controller")
const { authUser } = require("../middlewares/auth.middleware")

const router = express.Router();


router.post("/register", validation.registerUserValidation, authController.registerUser)
router.post("/login", validation.loginUserValidation, authController.loginUser)
router.post("/logout", authController.logout)
router.get("/me", authUser, authController.me)


module.exports = router;