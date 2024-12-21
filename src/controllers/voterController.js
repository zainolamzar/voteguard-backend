const Voter = require('../models/Voter');
const Election = require('../models/Election');

const VoterController = {
  // Create a new voter participation request
  requestParticipation: async (req, res) => {
    const { userId } = req.params;
    const { election_code } = req.body;

    try {
      // Find the election by election code
      const election = await Election.getElectionByCode(election_code);

      if (!election) {
        return res.status(404).json({ message: "Election not found. Please check the code and try again." });
      }

      const electionId = election.election_id;

      // Check if the user is the admin of the election
      if (election.user_id === parseInt(userId)) {
        return res.status(403).json({ message: "You cannot request participation in your own election." });
      }

      // Insert the voter request into the database
      const voterRequest = await Voter.createVoterRequest({
        user_id: parseInt(userId),
        election_id: electionId,
      });

      res.status(201).json({ message: "Participation request sent successfully.", voterRequest });
    } catch (error) {
      console.error("Error requesting participation:", error);
      res.status(500).json({ message: "Failed to request participation.", error });
    }
  },

  // Get all voter requests for an election (admin view)
  getRequestsByElection: async (req, res) => {
    const { electionId } = req.params; // Ensure `electionId` matches frontend parameters
  
    try {
      const requests = await Voter.getVoterRequestsByElection(electionId);
      res.status(200).json({ requests });
    } catch (error) {
      console.error('Error fetching voter requests:', error);
      res.status(500).json({ message: 'Failed to fetch requests', error });
    }
  },

  // Get all accepted voters for an election
  getAcceptedVoters: async (req, res) => {
    const { electionId } = req.params;

    try {
      const acceptedVoters = await Voter.getAcceptedVotersByElection(electionId);
      res.status(200).json({ acceptedVoters });
    } catch (error) {
      console.error('Error fetching accepted voters:', error);
      res.status(500).json({ message: 'Failed to fetch accepted voters', error });
    }
  },

  // Approve a voter request
  approveRequest: async (req, res) => {
    const { userId, electionId, voterId } = req.params;
  
    try {
      // Assuming Voter model has a method to approve a request
      const updated = await Voter.updateVoterStatus(voterId, 'Accepted'); // Update the status to 'Accepted'
  
      if (!updated) {
        return res.status(404).json({ message: 'Voter request not found' });
      }
  
      res.status(200).json({ message: 'Voter request approved successfully' });
    } catch (error) {
      console.error('Error approving request:', error);
      res.status(500).json({ message: 'Failed to approve request', error });
    }
  },
    
  // Reject a voter request
  rejectRequest: async (req, res) => {
    const { userId, electionId, voterId } = req.params;
  
    try {
      // Assuming Voter model has a method to reject a request
      const updated = await Voter.updateVoterStatus(voterId, 'Rejected'); // Update the status to 'Rejected'
  
      if (!updated) {
        return res.status(404).json({ message: 'Voter request not found' });
      }
  
      res.status(200).json({ message: 'Voter request rejected successfully' });
    } catch (error) {
      console.error('Error rejecting request:', error);
      res.status(500).json({ message: 'Failed to reject request', error });
    }
  },
};

module.exports = VoterController;