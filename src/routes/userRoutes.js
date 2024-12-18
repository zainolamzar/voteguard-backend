const express = require('express');
const UserController = require('../controllers/userController');

const router = express.Router();

// Route for login
router.post('/login', UserController.login);

// Route for register
router.post('/register', UserController.register);

module.exports = router;