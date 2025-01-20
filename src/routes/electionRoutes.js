import express from 'express';
import ElectionController from '../controllers/electionController.js';

const router = express.Router();

// Get all elections for a specific user
router.get('/:userId/election', ElectionController.getAllElections);

// Get a specific election by ID
router.get('/:userId/:electionId', ElectionController.getElectionById);

// Check if an election code is unique
router.get('/check-code/:election_code', ElectionController.checkElectionCode);

// Create a new election
router.post('/:userId/election', ElectionController.createElection);

// Update an election
router.put('/:userId/:electionId', ElectionController.updateElection);

// Delete an election
router.delete('/:userId/:electionId', ElectionController.deleteElection);

export default router;