const db = require('../config/db');

// Define a User model with functions to interact with the database
const User = {
  // Get all users
  getAllUsers: async () => {
    const query = 'SELECT * FROM user';
    return db.query(query).then(([rows]) => rows);
  },

  // Get a user by ID
  getUserById: async (userId) => {
    const query = 'SELECT * FROM user WHERE user_id = ?';
    return db.query(query, [userId]).then(([rows]) => rows[0]);
  },

  // Create a new user
  createUser: async ({ username, first_name, last_name, email, password, otp_secret }) => {
    const query = `
      INSERT INTO user (username, first_name, last_name, email, password, otp_secret)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [username, first_name, last_name, email, password, otp_secret || null];
    return db.query(query, values).then(([result]) => result.insertId);
  },

  // Update a user by ID
  updateUser: async (userId, updates) => {
    const query = `
      UPDATE user
      SET username = ?, first_name = ?, last_name = ?, email = ?, password = ?, otp_secret = ?
      WHERE user_id = ?
    `;
    const values = [
      updates.username,
      updates.first_name,
      updates.last_name,
      updates.email,
      updates.password,
      updates.otp_secret || null,
      userId,
    ];
    return db.query(query, values).then(([result]) => result.affectedRows > 0);
  },

  // Delete a user by ID
  deleteUser: async (userId) => {
    const query = 'DELETE FROM user WHERE user_id = ?';
    return db.query(query, [userId]).then(([result]) => result.affectedRows > 0);
  },

  // Update the OTP secret for a user
  updateOtpSecret: async (userId, otpSecret) => {
    const query = "UPDATE user SET otp_secret = ? WHERE user_id = ?";
    return db.query(query, [otpSecret, userId]).then(([result]) => result.affectedRows > 0);
  },
};

module.exports = User;