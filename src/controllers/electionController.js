import Election from '../models/Election.js';

const ElectionController = {
  // Get all elections for a specific user
  getAllElections: async (req, res) => {
    const { userId } = req.params;

    try {
      const elections = await Election.getAllElectionsByUser(userId);
      res.status(200).json(elections);
    } catch (error) {
      console.error('Error fetching elections:', error);
      res.status(500).json({ message: 'Failed to fetch elections', error });
    }
  },

  // Get an election by ID (with ownership check)
  getElectionById: async (req, res) => {
    const { userId, electionId } = req.params;
  
    try {
      const election = await Election.getElectionById(electionId);
      
      if (!election || election.user_id !== parseInt(userId)) {
        return res.status(403).json({ message: 'Access denied or election not found' });
      }

      const { user_id, created_at, election_id, ...electionDetails } = election;
  
      const options = await Election.getElectionById(electionId);
  
      res.status(200).json({
        election: {
          ...electionDetails,
        },
        options,
      });
    } catch (error) {
      console.error('Error fetching election:', error);
      res.status(500).json({ message: 'Failed to fetch election', error });
    }
  },

  // Create a new election
  createElection: async (req, res) => {
    const { userId } = req.params;
    const { election_code, title, description, start_datetime, end_datetime, options } = req.body;
  
    if (!election_code || !title || !start_datetime || !end_datetime) {
      return res.status(400).json({ message: 'All fields except description and options are required' });
    }
  
    try {
      const electionId = await Election.createElection({
        election_code,
        title,
        description,
        start_datetime,
        end_datetime,
        options,
        user_id: parseInt(userId),
      });
  
      res.status(201).json({ message: 'Election created successfully', electionId });
    } catch (error) {
      console.error('Error creating election:', error);
      res.status(500).json({ message: 'Failed to create election', error });
    }
  },

  // Check if an election code is unique
  checkElectionCode: async (req, res) => {
    const { election_code } = req.params;
  
    try {
      const exists = await Election.checkElectionCodeExists(election_code);
      res.status(200).json({ exists });
    } catch (error) {
      console.error('Error checking election code:', error);
      res.status(500).json({ message: 'Failed to check election code', error });
    }
  },

  // Update an election (with ownership check)
  updateElection: async (req, res) => {
    const { userId, electionId } = req.params;
    const updates = req.body;

    try {
      const election = await Election.getElectionById(electionId);

      if (!election || election.user_id !== parseInt(userId)) {
        return res.status(403).json({ message: 'Access denied or election not found' });
      }

      const updated = await Election.updateElection(electionId, updates);
      if (!updated) {
        return res.status(404).json({ message: 'Election not found' });
      }

      res.status(200).json({ message: 'Election updated successfully' });
    } catch (error) {
      console.error('Error updating election:', error);
      res.status(500).json({ message: 'Failed to update election', error });
    }
  },

  // Delete an election (with ownership check)
  deleteElection: async (req, res) => {
    const { userId, electionId } = req.params;

    try {
      const election = await Election.getElectionById(electionId);

      if (!election || election.user_id !== parseInt(userId)) {
        return res.status(403).json({ message: 'Access denied or election not found' });
      }

      const deleted = await Election.deleteElection(electionId);
      if (!deleted) {
        return res.status(404).json({ message: 'Election not found' });
      }

      res.status(200).json({ message: 'Election deleted successfully' });
    } catch (error) {
      console.error('Error deleting election:', error);
      res.status(500).json({ message: 'Failed to delete election', error });
    }
  },
};

export default ElectionController;