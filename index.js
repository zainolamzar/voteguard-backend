const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const userRoutes = require('./src/routes/userRoutes');
const db = require('./src/config/db');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json());

// Routes
app.use('/api/users', userRoutes); // Mount user routes at /api/users

// Root endpoint
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});