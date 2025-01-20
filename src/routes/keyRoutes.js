import express from 'express';
import KeyController from '../controllers/keyController.js';

const router = express.Router();

// Create a new election
router.post('/:electionId/generate', KeyController.generateKeysForElection);

export default router;