import db from "../config/db.js";
import * as paillierBigint from "paillier-bigint";
import dotenv from "dotenv";

dotenv.config();

const KeyController = {
  generateKeysForElection: async (req, res) => {
    const { electionId } = req.params;

    let publicKey, privateKey;

    try {
      // Generate the Paillier key pair asynchronously
      const { publicKey: generatedPublicKey, privateKey: generatedPrivateKey } = await paillierBigint.generateRandomKeys(3072); // 3072-bit key size

      publicKey = generatedPublicKey;
      privateKey = generatedPrivateKey;
    } catch (keyGenError) {
      console.error("Error generating encryption keys:", keyGenError);
      return res.status(500).json({
        message: "Failed to generate encryption keys for the election",
        error: keyGenError.message,
      });
    }

    // Ensure keys were generated properly
    if (!publicKey || !privateKey) {
      console.error("Key generation failed: Keys are null or undefined");
      return res.status(500).json({
        message: "Key generation failed. Please try again later.",
      });
    }

    // Convert the keys to JSON representation
    const publicKeyString = JSON.stringify({
      n: publicKey.n.toString(),
      g: publicKey.g.toString(),
    });
    const privateKeyString = JSON.stringify({
      lambda: privateKey.lambda.toString(),
      mu: privateKey.mu.toString(),
    });

    // Insert into the Keys table in the database
    const insertKeysQuery = `
      INSERT INTO hmkeys (key_one, key_two, election_id)
      VALUES (?, ?, ?)
    `;

    try {
      await db.query(insertKeysQuery, [
        publicKeyString, // Store public key as JSON string
        privateKeyString, // Store private key as JSON string
        electionId,
      ]);

      console.log("Keys stored successfully in the database.");

      res.status(201).json({
        message: "Keys generated and stored successfully.",
        electionId,
      });
    } catch (dbError) {
      console.error("Error inserting keys into database:", dbError);
      res.status(500).json({
        message: "Failed to store keys in the database.",
        error: dbError.message,
      });
    }
  },
};

export default KeyController;