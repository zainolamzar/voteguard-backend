import express from 'express';
import BallotController from '../controllers/ballotController.js';

const router = express.Router();

// Get the options for a specific election
router.get('/:voterId/:electionId/options', BallotController.getOptions);

// Route to create a new ballot
router.post('/submit/:voterId/:electionId', BallotController.createBallot);

export default router;