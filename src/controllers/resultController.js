import * as paillier from "paillier-bigint";
import Election from "../models/Election.js";
import Ballot from "../models/Ballot.js";
import Result from "../models/Result.js";
import db from "../config/db.js";

// Helper function to fetch keys for the election
const getKeyFromDb = async (keyType, electionId) => {
  const keyColumn = keyType === "public" ? "key_one" : "key_two";
  const query = `SELECT ${keyColumn} FROM hmkeys WHERE election_id = ? LIMIT 1`;

  try {
    const [rows] = await db.query(query, [electionId]);
    if (rows.length === 0) {
      throw new Error(`${keyType} key not found for election ID ${electionId}`);
    }

    const keyData = rows[0][keyColumn];
    if (!keyData) {
      throw new Error(`Invalid or missing ${keyType} key for election ID ${electionId}`);
    }

    // Check if the keyData is already an object
    if (typeof keyData === "string") {
      return JSON.parse(keyData); // Parse the JSON string if it's not an object
    } else {
      return keyData; // Return the object as is
    }
  } catch (error) {
    console.error(`Error fetching ${keyType} key:`, error.message);
    throw error;
  }
};

const ResultController = {
  getElectionResult: async (req, res) => {
    try {
      const { electionId } = req.params;
  
      // Step 1: Fetch election details and validate existence
      const election = await Election.getOptionsByElection(electionId);
      if (!election) {
        return res.status(404).json({ message: "Election not found" });
      }
  
      const options = election.options;
      if (!options || options.length === 0) {
        return res.status(400).json({ message: "No options found for this election" });
      }
  
      // Step 2: Fetch keys
      const publicKeyString = await getKeyFromDb("public", electionId);
      const privateKeyString = await getKeyFromDb("private", electionId);
  
      const publicKey = {
        g: BigInt(publicKeyString.g),
        n: BigInt(publicKeyString.n),
      };
      const privateKey = {
        mu: BigInt(privateKeyString.mu),
        lambda: BigInt(privateKeyString.lambda),
      };
  
      const publicKeyInstance = new paillier.PublicKey(publicKey.n, publicKey.g);
      const privateKeyInstance = new paillier.PrivateKey(privateKey.lambda, privateKey.mu, publicKeyInstance);
  
      // Step 3: Fetch ballots
      const ballots = await Ballot.getAllBallotByElection(electionId);
      if (!ballots || ballots.length === 0) {
        return res.status(400).json({ message: "No ballots found for this election" });
      }
  
      // Step 4: Process ballots
      let optionsMap = {};
      let encryptedVoteArray = [];
  
      for (const ballot of ballots) {
        try {
          if (!ballot || !ballot.encrypted_vote) {
            continue;
          }
  
          encryptedVoteArray = ballot.encrypted_vote.map((v) => BigInt(v));
  
          encryptedVoteArray.forEach((encryptedVote, index) => {
            const optionKey = `option${index + 1}`;
            if (!optionsMap[optionKey]) {
              optionsMap[optionKey] = encryptedVote;
            } else {
              optionsMap[optionKey] = publicKeyInstance.addition(optionsMap[optionKey], encryptedVote);
            }
          });
        } catch (error) {
          console.error(`Error parsing encrypted_vote for ballot:`, ballot);
          throw new Error("Invalid encrypted_vote data.");
        }
      }
  
      // Decrypt the sums to get final vote counts
      const decryptedSums = {};
      Object.entries(optionsMap).forEach(([optionKey, encryptedSum]) => {
        try {
          decryptedSums[optionKey] = privateKeyInstance.decrypt(encryptedSum);
        } catch (error) {
          decryptedSums[optionKey] = BigInt(0);
        }
      });
  
      const totalVotes = Object.values(decryptedSums).reduce((sum, count) => sum + count, BigInt(0));
  
      if (totalVotes === BigInt(0)) {
        return res.status(400).json({ message: "No votes submitted for this election" });
      }
  
      const results = options.map((option, index) => {
        const optionKey = `option${index + 1}`;
        const votes = decryptedSums[optionKey] || BigInt(0);
  
        return {
          id: option.id,
          name: option.name,
          description: option.description,
          votes,
          percentage: totalVotes > BigInt(0) ? Number((votes * BigInt(100)) / totalVotes) : 0,
        };
      });
  
      // Check for a draw
      const firstOptionPercentage = results[0].percentage.toFixed(2);
      const isDraw = results.every((option) => option.percentage.toFixed(2) === firstOptionPercentage);
  
      if (isDraw) {
        const drawPercentage = Number(firstOptionPercentage);
  
        // Save the draw result in the database
        const resultId = await Result.createResult(
          electionId,
          {
            id: 0,
            name: "None",
            description: "The result is draw",
          },
          0, // Total votes for the winner
          drawPercentage.toFixed(2), // Winning percentage
          ballots.length // Total participation
        );
  
        return res.status(200).json({
          message: "The election result is a draw.",
          results: results.map((result) => ({
            ...result,
            votes: result.votes.toString(),
            percentage: result.percentage.toFixed(2),
          })),
          totalVotes: "0",
          participation: ballots.length,
          winner: {
            id: 0,
            name: "None",
            description: "The result is draw",
            votes: "0",
            percentage: drawPercentage.toFixed(2),
          },
          resultId,
        });
      }
  
      // Determine the winner based on the highest number of votes
      const winner = results.reduce((max, option) => (option.votes > max.votes ? option : max), results[0]);
  
      // Step 5: Insert results into the database
      const resultId = await Result.createResult(
        electionId,
        {
          id: winner.id,
          name: winner.name,
          description: winner.description,
        },
        winner.votes, // Total votes for the winner
        winner.percentage.toFixed(2), // Winning percentage
        ballots.length // Total participation
      );
  
      // Respond with the results
      res.status(200).json({
        message: "Election results calculated successfully.",
        results: results.map((result) => ({
          ...result,
          votes: result.votes.toString(),
          percentage: result.percentage.toFixed(2),
        })),
        totalVotes: totalVotes.toString(),
        participation: ballots.length,
        winner: {
          ...winner,
          votes: winner.votes.toString(),
          percentage: winner.percentage.toFixed(2),
        },
        resultId,
      });
    } catch (error) {
      console.error("Error calculating election results:", error.message);
      res.status(500).json({ message: "Error calculating election results", error: error.message });
    }
  },

  showResult: async (req, res) => {
    try {
      const { electionId } = req.params;

      const result = await Result.getResultByElection(electionId);

      if (!result) {
        return res.status(404).json({ message: "Result not found for the provided election ID." });
      }

      res.status(200).json({
        message: "Election result fetched successfully.",
        result,
      });
    } catch (error) {
      console.error("Error fetching election result:", error.message);
      res.status(500).json({ message: "Error fetching election result", error: error.message });
    }
  },
};

export default ResultController;