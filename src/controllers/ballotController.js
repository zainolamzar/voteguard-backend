import Ballot from '../models/Ballot.js';
import Voter from '../models/Voter.js';
import { PublicKey } from 'paillier-bigint';
import db from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const ballotController = {
  // Handle the creation of a new ballot
  createBallot: async (req, res) => {
    const { voterId, electionId } = req.params;
    const { vote } = req.body;

    if (!vote) {
      return res.status(400).json({ message: "Vote option is required." });
    }

    try {
      // Fetch the election options
      const [optionsRows] = await db.query(
        "SELECT options FROM election WHERE election_id = ? LIMIT 1",
        [electionId]
      );

      if (optionsRows.length === 0) {
        return res.status(404).json({ message: "Election not found." });
      }

      let options = optionsRows[0].options;

      // Ensure options are parsed as JSON
      try {
        options = typeof options === "string" ? JSON.parse(options) : options;
      } catch (err) {
        console.error("Invalid options JSON format:", options);
        return res
          .status(500)
          .json({ message: "Invalid options format in election data." });
      }

      // Fetch the public key
      const [keyRows] = await db.query(
        "SELECT key_one FROM hmkeys WHERE election_id = ? LIMIT 1",
        [electionId]
      );

      if (keyRows.length === 0) {
        return res
          .status(404)
          .json({ message: "Public key for the election not found." });
      }

      const publicKeyJson = keyRows[0].key_one;

      // Parse the JSON to retrieve `n` and `g`
      let publicKeyParsed;
      try {
        publicKeyParsed =
          typeof publicKeyJson === "string"
            ? JSON.parse(publicKeyJson)
            : publicKeyJson;
      } catch (parseError) {
        console.error("Invalid public key JSON format:", publicKeyJson);
        return res
          .status(500)
          .json({ message: "Invalid public key format in database." });
      }

      const { n, g } = publicKeyParsed;

      // Reconstruct the public key
      const publicKey = new PublicKey(BigInt(n), BigInt(g));

      // Create the encrypted vote array
      const encryptedVote = options.map((option) => {
        const value = option.id === vote ? 1 : 0;
        return publicKey.encrypt(value).toString(); // Encrypt and stringify the value
      });

      // Validate the encryptedVote array
      if (!Array.isArray(encryptedVote) || encryptedVote.some((v) => typeof v !== "string")) {
        console.error("Invalid encryptedVote array:", encryptedVote);
        return res
          .status(500)
          .json({ message: "Failed to create valid encrypted vote array." });
      }

      // Store the encryptedVote as JSON in the database
      const ballotId = await Ballot.create(electionId, JSON.stringify(encryptedVote));

      // Update the voter's has_voted status
      const updated = await Voter.updateVoterHasVoted(voterId, 1);

      if (!updated) {
        return res
          .status(400)
          .json({ message: "Failed to update voter status to 'has voted'." });
      }

      res.status(201).json({
        message: "Ballot submitted successfully.",
        ballotId,
      });
    } catch (error) {
      console.error("Error creating ballot:", error);
      res
        .status(500)
        .json({ message: "Failed to submit ballot.", error: error.message });
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