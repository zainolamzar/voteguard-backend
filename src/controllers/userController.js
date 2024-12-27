import User from '../models/User.js';
import bcrypt from 'bcrypt';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

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

  // Update OTP secret for a user
  setupOtp: async (req, res) => {
    const { userId, otpSecret } = req.body;

    if (!userId || !otpSecret) {
      return res.status(400).json({ message: 'User ID and OTP Secret are required' });
    }

    try {
      const updated = await User.updateOtpSecret(userId, otpSecret);
      if (updated) {
        res.status(200).json({ message: 'OTP secret updated successfully' });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      console.error('Error updating OTP secret:', error);
      res.status(500).json({ message: 'Internal server error', error });
    }
  },

  // Generate QR code and save OTP secret for a user
  generateQRCode: async (req, res) => {
    const { userId } = req.params;

    try {
      // Check if user exists
      const user = await User.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate a new secret for the user
      const secret = speakeasy.generateSecret({ length: 20 });
      const otpauthUrl = secret.otpauth_url;

      // Save the secret in the database
      await User.updateOtpSecret(userId, secret.base32);

      // Generate the QR code
      const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);

      res.status(200).json({ qrCodeUrl });
    } catch (error) {
      console.error("Error generating QR code:", error);
      res.status(500).json({ message: "Failed to generate QR code", error });
    }
  },

  verifyOtp: async (req, res) => {
    const { userId, otp } = req.body;

    try {
      // Fetch the user's OTP secret from the database
      const user = await User.getUserById(userId);
      if (!user || !user.otp_secret) {
        return res.status(400).json({ message: "User not found or OTP secret not set." });
      }

      // Verify the OTP using speakeasy
      const verified = speakeasy.totp.verify({
        secret: user.otp_secret,
        encoding: "base32",
        token: otp,
      });

      if (!verified) {
        return res.status(400).json({ message: "Invalid OTP. Please try again." });
      }

      res.status(200).json({ message: "OTP verified successfully!" });
    } catch (error) {
      console.error("Error during OTP verification:", error);
      res.status(500).json({ message: "Internal server error", error });
    }
  },
};

export default UserController;