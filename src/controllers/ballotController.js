const Ballot = require("../models/Ballot");

const ballotController = {
  // Handle the creation of a new ballot
  createBallot: async (req, res) => {
    const { electionId, encryptedVote } = req.body;

    if (!electionId || !encryptedVote) {
      return res.status(400).json({ message: "Election ID and encrypted vote are required." });
    }

    try {
      const ballotId = await Ballot.create(electionId, encryptedVote);
      res.status(201).json({ message: "Ballot submitted successfully.", ballotId });
    } catch (error) {
      console.error("Error creating ballot:", error);
      res.status(500).json({ message: "Failed to submit ballot.", error });
    }
  },

  // Fetch election details and options for a specific voter
  getOptions: async (req, res) => {
    const { voterId, electionId } = req.params;
  
    try {
      const electionDetails = await Ballot.getElectionDetailsForVoter(voterId, electionId);

      if (electionDetails.length === 0) {
        return res.status(404).json({ message: "No election found for this user or user is not approved to participate." });
      }
  
      const { voter_id, user_id, election_id, title, description, start_datetime, end_datetime, options } = electionDetails[0];
  
      res.status(200).json({
        election: {
          voter_id,
          user_id,
          election_id,
          title,
          description,
          start_datetime,
          end_datetime,
        },
        options, // Return parsed options
      });
    } catch (error) {
      console.error("Error fetching election options:", error);
      res.status(500).json({ message: "Failed to fetch election options.", error });
    }
  },
};

module.exports = ballotController;