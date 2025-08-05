import * as dotenv from 'dotenv';
import { PublicKey } from '@solana/web3.js';

// Load environment variables
dotenv.config();

export const ENV = {
  // Solana Configuration
  SOLANA_RPC_URL: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  PROGRAM_ID: new PublicKey(process.env.PROGRAM_ID || '2516vhAXsYH9co7EPrW1k2oMnHUq7yS6eHerftbVaqms'),
  
  // Network endpoints
  MAINNET_RPC: process.env.MAINNET_RPC_URL || 'https://api.mainnet-beta.solana.com',
  DEVNET_RPC: process.env.DEVNET_RPC_URL || 'https://api.devnet.solana.com',
  LOCALNET_RPC: process.env.LOCALNET_RPC_URL || 'http://127.0.0.1:8899',
  
  // Wallet configuration
  WALLET_PATH: process.env.SOLANA_WALLET_PATH || '~/.config/solana/id.json',
  
  // Private keys (optional)
  DEPLOYER_PRIVATE_KEY: process.env.DEPLOYER_PRIVATE_KEY,
  ADMIN_PRIVATE_KEY: process.env.ADMIN_PRIVATE_KEY,
};

// Validation
export const validateEnv = () => {
  const required = ['PROGRAM_ID'];
  
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
};