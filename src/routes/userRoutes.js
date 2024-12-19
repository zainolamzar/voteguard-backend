const express = require('express');
const UserController = require('../controllers/userController');
const router = express.Router();
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

// Route for login
router.post('/login', UserController.login);

// Route for register
router.post('/register', UserController.register);

// Route for setting up OTP secret
router.post('/setup-otp', UserController.setupOtp);

// Route to generate QR code for a specific user
router.get("/:userId/generate-qr", UserController.generateQRCode);

// Route for OTP verification
router.post("/:userId/verify-otp", UserController.verifyOtp);

module.exports = router;