const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// Route to get all users
router.get('/', userController.getAllUsers);
// Routes for user registration and login
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

module.exports = router;