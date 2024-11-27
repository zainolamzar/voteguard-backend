const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Get all users
const getAllUsers = async (req, res) => {
    try {
      const users = await userModel.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};

// Register user
const registerUser = async (req, res) => {
  try {
    const { username, email, password, first_name, last_name } = req.body;

    if (!username || !email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newUser = {
      username,
      email,
      password,
      first_name,
      last_name,
    };

    const createdUser = await userModel.createUser(newUser);
    res.status(201).json(createdUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login user
const loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
  
      const user = await userModel.validateUser(email, password);
  
      // If user found and password matches, generate JWT token
      const token = jwt.sign(
        { userId: user.user_id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      res.status(200).json({ user, token });
    } catch (error) {
      console.error("Login error:", error); // Log the error on the server for debugging
      res.status(401).json({ error: error.message });
    }
};

module.exports = {
  getAllUsers,
  registerUser,
  loginUser,
};