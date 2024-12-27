import Ballot from '../models/Ballot.js';
import Voter from '../models/Voter.js';

const ballotController = {
  // Handle the creation of a new ballot
  createBallot: async (req, res) => {
    const { electionId } = req.params;
    const { vote } = req.body;

    if (!vote) {
      return res.status(400).json({ message: "Vote option is required." });
    }

    try {
      // Try to create the ballot
      const ballotId = await Ballot.create(electionId, vote);

      // Update the voter's has_voted status
      const updated = await Voter.updateVoterHasVoted(req.params.voterId, 1);

      if (!updated) {
        return res.status(400).json({ message: "Failed to update voter status to 'has voted'." });
      }

      res.status(201).json({ message: "Ballot submitted successfully.", ballotId });
    } catch (error) {
      console.error("Error creating ballot:", error); // Log the error in backend
      res.status(500).json({ message: "Failed to submit ballot.", error: error.message });
    }
  },

  // Fetch election details and options for a specific voter
  getOptions: async (req, res) => {
    const { voterId, electionId } = req.params;

    try {
      const electionDetails = await Ballot.getElectionDetailsForVoter(voterId, electionId);

      if (electionDetails.length === 0) {
        return res.status(404).json({ message: 'No election found for this user or user is not approved to participate.' });
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
      console.error('Error fetching election options:', error);
      res.status(500).json({ message: 'Failed to fetch election options.', error });
    }
  },
};

export default ballotController;