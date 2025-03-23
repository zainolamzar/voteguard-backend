import express from 'express';
import UserController from '../controllers/userController.js';

const router = express.Router();

// Route for login
router.post('/login', UserController.login);

// Route for register
router.post('/register', UserController.register);

// Route to fetch user data
router.get('/:userId', UserController.fetchUserData);

// Route for setting up OTP secret
router.post('/setup-otp', UserController.setupOtp);

// Route to generate QR code for a specific user
router.get("/:userId/generate-qr", UserController.generateQRCode);

// Route for OTP verification
router.post("/:userId/verify-otp", UserController.verifyOtp);

export default router;