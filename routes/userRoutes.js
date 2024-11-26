const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// Routes for user registration and login
router.post('/register', userController.registerUser); // POST to register a new user
router.post('/login', userController.loginUser); // POST to login a user

module.exports = router;