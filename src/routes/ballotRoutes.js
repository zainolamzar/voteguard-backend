const express = require("express");
const BallotController = require("../controllers/ballotController");

const router = express.Router();

// Get the options for a specific election
router.get('/:voterId/:electionId/options', BallotController.getOptions);

// Route to create a new ballot
router.post("/submit", BallotController.createBallot);

module.exports = router;