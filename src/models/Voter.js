import db from '../config/db.js';

// Define a Voter model with functions to interact with the database
const Voter = {
  // Create a new voter request
  createVoterRequest: async ({ user_id, election_id }) => {
    const query = `
      INSERT INTO voter (user_id, election_id, status, has_voted)
      VALUES (?, ?, 'Pending', 0)
    `;
    return db.query(query, [user_id, election_id]).then(([result]) => result.insertId);
  },

  // Get all accepted voters for a specific election
  getAcceptedVotersByElection: async (election_id) => {
    const query = `
      SELECT v.*, u.first_name, u.last_name, u.username, u.email
      FROM voter v
      INNER JOIN user u ON v.user_id = u.user_id
      WHERE v.election_id = ? AND v.status = 'Accepted'
    `;
    return db.query(query, [election_id]).then(([rows]) => rows);
  },

  // Get all elections the user has successfully joined
  getJoinedElectionsByUser: async (user_id) => {
    const query = `
      SELECT v.voter_id, e.election_id, e.title, e.description, 
      e.start_datetime, e.end_datetime
      FROM voter v
      INNER JOIN election e ON v.election_id = e.election_id
      WHERE v.user_id = ? AND v.status = 'Accepted'
    `;
    return db.query(query, [user_id]).then(([rows]) => rows);
  },

  getJoinedElectionDetail: async (userId, electionId) => {
    const query = `
      SELECT 
        e.election_id, 
        e.title, 
        e.description, 
        e.start_datetime, 
        e.end_datetime, 
        v.status, 
        CONCAT(u.first_name, ' ', u.last_name) AS organizer_name
      FROM voter v
      INNER JOIN election e ON v.election_id = e.election_id
      INNER JOIN user u ON e.user_id = u.user_id
      WHERE v.user_id = ? AND v.election_id = ? AND v.status = 'Accepted'
    `;
    const [results] = await db.query(query, [userId, electionId]);
    return results[0]; // Return the first result (or undefined if none)
  },

  // Get all pending voters for a specific election
  getVoterRequestsByElection: async (election_id) => {
    const query = `
      SELECT v.*, u.first_name, u.last_name, u.username, u.email
      FROM voter v
      INNER JOIN user u ON v.user_id = u.user_id
      WHERE v.election_id = ? AND v.status = 'Pending'
    `;
    return db.query(query, [election_id]).then(([rows]) => rows);
  },

  // Get the voting limitation for a specific voter
  getVotingLimitation: async (voter_id) => {
    const query = `
      SELECT e.start_datetime, e.end_datetime, v.has_voted
      FROM voter v
      INNER JOIN election e ON v.election_id = e.election_id
      WHERE v.voter_id = ?
    `;
    const [rows] = await db.query(query, [voter_id]);
    return rows[0];
  },

  // Update the status of a voter (Accept/Reject)
  updateVoterStatus: async (voter_id, status) => {
    const query = `
      UPDATE voter 
      SET status = ? 
      WHERE voter_id = ?
    `;
    return db.query(query, [status, voter_id]).then(([result]) => result.affectedRows > 0);
  },

  updateVoterHasVoted: async (voterId, hasVoted) => {
    const query = `
      UPDATE voter
      SET has_voted = ?
      WHERE voter_id = ?
    `;

    try {
      const [result] = await db.query(query, [hasVoted, voterId]);
      
      if (result.affectedRows > 0) {
        return true; // Successfully updated
      }
      
      return false; // No rows were updated
    } catch (error) {
      console.error('Error updating has_voted:', error);
      throw error;
    }
  },
};

export default Voter;