import db from '../config/db.js';

const Result = {
  // Function to create a result for an election
  createResult: async (electionId, winner, totalVotes, winningPercent, participation) => {
    const query = `
      INSERT INTO result (election_id, winner, total_votes, winning_percent, participation)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [electionId, JSON.stringify(winner), totalVotes, winningPercent, participation]);
    return result.insertId;
  },

  // Function to get the result of an election by electionId
  getResultByElection: async (electionId) => {
    const query = `
      SELECT * FROM result WHERE election_id = ?
    `;
    const [rows] = await db.query(query, [electionId]);
    return rows.length > 0 ? rows[0] : null; // Return the result if found, otherwise null
  },
};

export default Result;