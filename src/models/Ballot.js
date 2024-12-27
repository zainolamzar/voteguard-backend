import db from '../config/db.js';

const Ballot = {
  create: async (electionId, vote) => {
    const query = `
      INSERT INTO ballot (election_id, encrypted_vote)
      VALUES (?, ?)
    `;
    const [result] = await db.query(query, [electionId, vote]);
    return result.insertId;
  },

  getElectionDetailsForVoter: async (voterId, electionId) => {
    const query = `
      SELECT 
        v.voter_id, 
        v.user_id, 
        v.election_id, 
        v.status, 
        e.title, 
        e.description, 
        e.start_datetime, 
        e.end_datetime,
        e.options
      FROM 
        voter v
      INNER JOIN 
        election e ON v.election_id = e.election_id
      WHERE 
        v.voter_id = ? 
        AND v.election_id = ? 
        AND v.status = 'Accepted'
    `;
    const [rows] = await db.query(query, [voterId, electionId]);

    if (rows.length > 0) {
      // Ensure options is parsed if stored as a string
      if (typeof rows[0].options === 'string') {
        rows[0].options = JSON.parse(rows[0].options);  // Parse if it's a string
      }
    }

    return rows; // Return election details along with options
  },
};

export default Ballot;