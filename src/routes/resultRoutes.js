import express from 'express';
import ResultController from '../controllers/resultController.js';

const router = express.Router();

// Route to get election results
router.get('/:userId/:electionId/generate', ResultController.getElectionResult);

// Route to fetch election result
router.get('/:electionId', ResultController.showResult);

export default router;