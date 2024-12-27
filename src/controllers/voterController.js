import Voter from '../models/Voter.js';
import Election from '../models/Election.js';

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

  // Fetch voting limitation details for a specific voter
  getLimitation: async (req, res) => {
    const { voterId } = req.params;
  
    if (!voterId) {
      return res.status(400).json({ message: "Voter ID is required." });
    }
  
    try {
      const limitation = await Voter.getVotingLimitation(voterId);
  
      if (limitation) {
        const currentTime = new Date();
        const startTime = new Date(limitation.start_datetime);
        const endTime = new Date(limitation.end_datetime);
  
        // Check voting conditions
        const isEligibleToVote = 
          limitation.has_voted === 0 && 
          currentTime >= startTime && 
          currentTime <= endTime;
  
        return res.status(200).json({
          message: "Voting limitation fetched successfully.",
          data: {
            has_voted: limitation.has_voted,
            start_datetime: limitation.start_datetime,
            end_datetime: limitation.end_datetime,
            isEligibleToVote, // Include eligibility in response
          },
        });
      } else {
        return res.status(404).json({
          message: "Voter not found or voter is not associated with any election.",
        });
      }
    } catch (error) {
      console.error("Error fetching voting limitation:", error);
      return res.status(500).json({
        message: "Failed to fetch voting limitation. Please try again later.",
        error: error.message,
      });
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

  getJoinedElections: async (req, res) => {
    const { userId } = req.params;
  
    try {
      const joinedElections = await Voter.getJoinedElectionsByUser(userId);
      res.status(200).json({ joinedElections });
    } catch (error) {
      console.error('Error fetching joined elections:', error);
      res.status(500).json({ message: 'Failed to fetch joined elections', error });
    }
  },

  // Get details of a specific joined election
  getJoinedElectionDetail: async (req, res) => {
    const { userId, electionId } = req.params;

    try {
      const election = await Voter.getJoinedElectionDetail(userId, electionId);

      if (election) {
        res.status(200).json(election);
      } else {
        res.status(404).json({ message: "Election not found or you are not a participant." });
      }
    } catch (error) {
      console.error("Error fetching joined election details:", error);
      res.status(500).json({ message: "Failed to fetch election details.", error });
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

export default VoterController;