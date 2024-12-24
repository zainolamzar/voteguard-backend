const db = require('../config/db');

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
      SELECT v.voter_id, e.election_id, e.title, e.description
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

  // Check if a voter request already exists
  checkRequestExists: async (user_id, election_id) => {
    const query = `
      SELECT COUNT(*) AS count FROM voter
      WHERE user_id = ? AND election_id = ?
    `;
    return db.query(query, [user_id, election_id]).then(([rows]) => rows[0].count > 0);
  },

  // Update the status of a voter request
  updateVoterStatus: async (voter_id, status) => {
    const query = `
      UPDATE voter
      SET status = ?
      WHERE voter_id = ?
    `;
    return db.query(query, [status, voter_id]).then(([result]) => result.affectedRows > 0);
  },
};

module.exports = Voter;