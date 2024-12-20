const express = require('express');
const ElectionController = require('../controllers/electionController');
const router = express.Router();

// Get all elections for a specific user
router.get('/:userId/election', ElectionController.getAllElections);

// Get a specific election by ID
router.get('/:userId/:electionId', ElectionController.getElectionById);

// Create a new election
router.post('/:userId/election', ElectionController.createElection);

// Check if an election code is unique
router.get('/check-code/:election_code', ElectionController.checkElectionCode);

// Update an election
router.put('/:userId/:electionId', ElectionController.updateElection);

// Delete an election
router.delete('/:userId/:electionId', ElectionController.deleteElection);

module.exports = router;