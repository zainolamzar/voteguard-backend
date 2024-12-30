import db from '../config/db.js';
import Election from '../models/Election.js';

// Get election options
export const getElectionOptions = async (electionId) => {
  const election = await Election.findOne({ where: { election_id: electionId } });
  return election ? election.options : [];
};

// Get encrypted votes for a specific option
export const getVotesForOption = async (electionId, optionIndex) => {
  const ballots = await Ballot.findAll({ where: { election_id: electionId } });

  // Extract the encrypted votes for the option
  const encryptedVotes = ballots.map((ballot) => ballot.encryptedVotes[optionIndex]);
  return encryptedVotes;
};

// Get the public key for a specific election from the hmkey table
export const getPublicKeyForElection = async (electionId) => {
  const query = `
    SELECT key_one FROM hmkey WHERE election_id = ?
  `;
  const [rows] = await db.query(query, [electionId]);

  if (rows.length === 0) {
    throw new Error('Public key not found for election');
  }

  return rows[0].public_key;  // Assuming public_key is the column holding the public key
};

// Get the private key for a specific election from the hmkey table
export const getPrivateKeyForElection = async (electionId) => {
  const query = `
    SELECT key_two FROM hmkey WHERE election_id = ?
  `;
  const [rows] = await db.query(query, [electionId]);

  if (rows.length === 0) {
    throw new Error('Private key not found for election');
  }

  return rows[0].private_key;  // Assuming private_key is the column holding the private key
};