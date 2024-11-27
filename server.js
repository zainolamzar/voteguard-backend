require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173', // Allow only your frontend's origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific HTTP methods
    credentials: true, // Allow cookies if needed
  }));

// Middleware
app.use(express.json()); // Parse JSON requests

// Routes
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to Voteguard backend!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});