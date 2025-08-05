import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as dotenv from 'dotenv';

dotenv.config();

async function deploy() {
  const network = process.argv[2] || 'devnet';
  
  let rpcUrl: string;
  let clusterName: string;
  
  switch (network) {
    case 'mainnet':
      rpcUrl = process.env.MAINNET_RPC_URL || 'https://api.mainnet-beta.solana.com';
      clusterName = 'mainnet';
      break;
    case 'devnet':
      rpcUrl = process.env.DEVNET_RPC_URL || 'https://api.devnet.solana.com';
      clusterName = 'devnet';
      break;
    case 'localnet':
      rpcUrl = process.env.LOCALNET_RPC_URL || 'http://127.0.0.1:8899';
      clusterName = 'localnet';
      break;
    default:
      throw new Error(`Unknown network: ${network}`);
  }

  console.log(`Deploying to ${network} (${rpcUrl})`);
  
  // Update Anchor.toml dynamically
  const anchorConfig = `[features]
seeds = false
skip-lint = false

[programs.localnet]
token_amm = "${process.env.PROGRAM_ID || '2516vhAXsYH9co7EPrW1k2oMnHUq7yS6eHerftbVaqms'}"

[programs.devnet]
token_amm = "${process.env.PROGRAM_ID || '2516vhAXsYH9co7EPrW1k2oMnHUq7yS6eHerftbVaqms'}"

[programs.mainnet]
token_amm = "${process.env.PROGRAM_ID || '2516vhAXsYH9co7EPrW1k2oMnHUq7yS6eHerftbVaqms'}"

[registry]
url = "https://api.apr.dev"

[provider]
cluster = "${clusterName}"
wallet = "${process.env.SOLANA_WALLET_PATH || '~/.config/solana/id.json'}"

[workspace]
members = ["programs/token-2022-amm"]

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"`;

  // Write the updated config
  fs.writeFileSync('Anchor.toml', anchorConfig);
  
  const connection = new Connection(rpcUrl);
  
  // Load wallet from environment or file
  const walletPath = process.env.SOLANA_WALLET_PATH || process.env.HOME + '/.config/solana/id.json';
  
  if (!fs.existsSync(walletPath)) {
    throw new Error(`Wallet file not found: ${walletPath}`);
  }
  
  const walletKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(walletPath, 'utf8')))
  );
  
  const wallet = new anchor.Wallet(walletKeypair);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
    preflightCommitment: 'confirmed',
  });
  
  // Set the provider as the default
  anchor.setProvider(provider);
  
  console.log(`Deploying with wallet: ${wallet.publicKey.toString()}`);
  console.log(`Wallet balance: ${await connection.getBalance(wallet.publicKey) / 1e9} SOL`);
  
  try {
    // Execute anchor deploy
    const { execSync } = require('child_process');
    const result = execSync('anchor deploy', { 
      encoding: 'utf8',
      stdio: 'inherit'
    });
    
    console.log('✅ Deployment completed successfully!');
    console.log(`Program ID: ${process.env.PROGRAM_ID || '2516vhAXsYH9co7EPrW1k2oMnHUq7yS6eHerftbVaqms'}`);
    
  } catch (error) {
    console.error(' Deployment failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  deploy().catch(console.error);
}