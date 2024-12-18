const User = require('../models/User');
const bcrypt = require('bcrypt');

const UserController = {
  // Login logic
  login: async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
      const user = await User.getAllUsers();
      const matchedUser = user.find((u) => u.username === username);

      if (!matchedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isPasswordMatch = await bcrypt.compare(password, matchedUser.password);
      if (!isPasswordMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      res.status(200).json({ message: 'Login successful', user: matchedUser });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Internal server error', error });
    }
  },

  // Register logic
  register: async (req, res) => {
    const { username, first_name, last_name, email, password, otp_secret } = req.body;

    if (!username || !first_name || !last_name || !email || !password) {
      return res.status(400).json({ message: 'All fields except OTP secret are required' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = await User.createUser({
        username,
        first_name,
        last_name,
        email,
        password: hashedPassword,
        otp_secret,
      });

      res.status(201).json({ message: 'User registered successfully', userId });
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({ message: 'Internal server error', error });
    }
  },
};

module.exports = UserController;