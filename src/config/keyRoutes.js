import express from 'express';
import generateKeys from './keyController.js';

const router = express.Router();

// Route to generate the keypair
router.get('/generate', async (req, res) => {
  try {
    // Generate keys using the generateKeys function
    const { publicKey, privateKey } = await generateKeys();

    // Return the public and private keys as a response
    res.status(200).json({
      success: true,
      message: 'Keypair generated successfully.',
      keys: {
        publicKey: publicKey.toString(), // Ensure keys are properly serialized
        privateKey: privateKey.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating keypair:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate keypair.',
      error: error.message,
    });
  }
});

export default router;