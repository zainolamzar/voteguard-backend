const express = require('express');
const VoterController = require('../controllers/voterController');
const router = express.Router();

// Request participation in an election
router.post("/:userId/request-participation", VoterController.requestParticipation);

// Get all voter requests for a specific election (admin view)
router.get('/:userId/requests/:electionId', VoterController.getRequestsByElection);

// Get all accepted voters for a specific election
router.get('/:userId/accepted-voters/:electionId', VoterController.getAcceptedVoters);

// Update the status of a voter request to Accepted
router.put("/:userId/requests/:electionId/approve/:voterId", VoterController.approveRequest);

// Update the status of a voter request to Rejected
router.put("/:userId/requests/:electionId/reject/:voterId", VoterController.rejectRequest);

module.exports = router;