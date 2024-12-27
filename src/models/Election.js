import db from '../config/db.js';

const Election = {
  // Get all elections created by a specific user
  getAllElectionsByUser: async (userId) => {
    const query = 'SELECT * FROM election WHERE user_id = ?';
    return db.query(query, [userId]).then(([rows]) => rows);
  },

  // Get an election by ID
  getElectionById: async (electionId) => {
    const query = 'SELECT * FROM election WHERE election_id = ?';
    return db.query(query, [electionId]).then(([rows]) => rows[0]);
  },

  // Get election by code
  getElectionByCode: async (electionCode) => {
    const query = "SELECT * FROM election WHERE election_code = ?";
    return db.query(query, [electionCode]).then(([rows]) => rows[0]);
  },

  // Create a new election
  createElection: async ({ election_code, title, description, start_datetime, end_datetime, options, user_id }) => {
    const query = `
      INSERT INTO election (election_code, title, description, start_datetime, end_datetime, options, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [election_code, title, description, start_datetime, end_datetime, JSON.stringify(options), user_id];
    return db.query(query, values).then(([result]) => result.insertId);
  },

  // Check if an election code already exists
  checkElectionCodeExists: async (election_code) => {
    const query = 'SELECT COUNT(*) AS count FROM election WHERE election_code = ?';
    return db.query(query, [election_code]).then(([rows]) => rows[0].count > 0);
  },

  // Update an election by ID (partial updates allowed)
  updateElection: async (electionId, updates) => {
    const setClauses = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      setClauses.push(`${key} = ?`);
      values.push(key === 'options' ? JSON.stringify(value) : value);
    }

    values.push(electionId);

    const query = `
      UPDATE election
      SET ${setClauses.join(', ')}
      WHERE election_id = ?
    `;

    return db.query(query, values).then(([result]) => result.affectedRows > 0);
  },

  // Delete an election by ID
  deleteElection: async (electionId) => {
    const query = 'DELETE FROM election WHERE election_id = ?';
    return db.query(query, [electionId]).then(([result]) => result.affectedRows > 0);
  },
};

export default Election;