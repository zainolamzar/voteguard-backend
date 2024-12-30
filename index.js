import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';

import userRoutes from './src/routes/userRoutes.js';
import electionRoutes from './src/routes/electionRoutes.js';
import voterRoutes from './src/routes/voterRoutes.js';
import ballotRoutes from './src/routes/ballotRoutes.js';
import keyRoutes from './src/routes/keyRoutes.js';
import resultRoutes from './src/routes/resultRoutes.js'

const app = express();
const port = process.env.PORT;

// Load environment variables
dotenv.config();

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));
app.use(express.json());
app.use(bodyParser.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/voters', voterRoutes);
app.use("/api/ballots", ballotRoutes);
app.use("/api/keys", keyRoutes);
app.use("/api/results", resultRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.send('Voteguard Backend is running...');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});