import { generateRandomKeys } from "paillier-bigint";

const generateKeys = async () => {
  const { publicKey, privateKey } = await generateRandomKeys(2048);
  return { publicKey, privateKey };
}

export default generateKeys;