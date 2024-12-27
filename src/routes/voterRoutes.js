import express from 'express';
import VoterController from '../controllers/voterController.js';

const router = express.Router();

// Request participation in an election
router.post("/:userId/request-participation", VoterController.requestParticipation);

// Get all voter requests for a specific election (admin view)
router.get('/:userId/requests/:electionId', VoterController.getRequestsByElection);

// Get all accepted voters for a specific election
router.get('/:userId/accepted-voters/:electionId', VoterController.getAcceptedVoters);

// Get all elections the user has joined
router.get('/:userId/joined-elections', VoterController.getJoinedElections);

// Get details of a specific election the user has joined
router.get('/:userId/joined-elections/:electionId', VoterController.getJoinedElectionDetail);

// Route to get voting limitation for a specific voter
router.get("/:voterId/limitation", VoterController.getLimitation);

// Update the status of a voter request to Accepted
router.put("/:userId/requests/:electionId/approve/:voterId", VoterController.approveRequest);

// Update the status of a voter request to Rejected
router.put("/:userId/requests/:electionId/reject/:voterId", VoterController.rejectRequest);

export default router;