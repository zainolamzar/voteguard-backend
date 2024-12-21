const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const userRoutes = require('./src/routes/userRoutes');
const electionRoutes = require('./src/routes/electionRoutes');
const voterRoutes = require('./src/routes/voterRoutes');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/voters', voterRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.send('Voteguard Backend is running...');
});

// Start the server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});