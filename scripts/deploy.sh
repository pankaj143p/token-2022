#!/bin/bash

# Token-2022 AMM Deployment Script
set -e

echo "🚀 Starting Token-2022 AMM Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Checking prerequisites...${NC}"

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo -e "${RED}Solana CLI not found. Please install it first.${NC}"
    echo "Visit: https://docs.solana.com/cli/install-solana-cli-tools"
    exit 1
fi

# Check if Anchor CLI is installed
if ! command -v anchor &> /dev/null; then
    echo -e "${RED}Anchor CLI not found. Please install it first.${NC}"
    echo "Visit: https://www.anchor-lang.com/docs/installation"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js not found. Please install it first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Set Solana config to devnet
echo -e "${YELLOW}Setting Solana config to devnet...${NC}"
solana config set --url devnet

# Check wallet balance
echo -e "${YELLOW}Checking wallet balance...${NC}"
BALANCE=$(solana balance --output json | grep -o '"value": [0-9.]*' | cut -d' ' -f2)
MIN_BALANCE=2

if (( $(echo "$BALANCE < $MIN_BALANCE" | bc -l) )); then
    echo -e "${YELLOW}Insufficient SOL balance. Requesting airdrop...${NC}"
    solana airdrop 2
    sleep 5
fi

echo -e "${GREEN}✅ Wallet balance sufficient${NC}"

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install
cd app && npm install && cd ..

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Build the program
echo -e "${YELLOW}Building Anchor program...${NC}"
anchor build

echo -e "${GREEN}✅ Program built successfully${NC}"

# Deploy the program
echo -e "${YELLOW}Deploying to devnet...${NC}"
anchor deploy

# Get the program ID
PROGRAM_ID=$(solana-keygen pubkey target/deploy/token_2022_amm-keypair.json)
echo -e "${GREEN}✅ Program deployed successfully!${NC}"
echo -e "${BLUE}Program ID: $PROGRAM_ID${NC}"

# Update the program ID in Anchor.toml and frontend
echo -e "${YELLOW}Updating program ID in configuration files...${NC}"

# Update Anchor.toml
sed -i "s/token_2022_amm = \".*\"/token_2022_amm = \"$PROGRAM_ID\"/" Anchor.toml

# Update frontend constant
sed -i "s/const PROGRAM_ID = new PublicKey('.*')/const PROGRAM_ID = new PublicKey('$PROGRAM_ID')/" app/src/pages/index.tsx

echo -e "${GREEN}✅ Configuration files updated${NC}"

# Initialize the AMM (optional)
read -p "Do you want to initialize the AMM now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Initializing AMM...${NC}"
    anchor run initialize-amm
fi

# Build the frontend
echo -e "${YELLOW}Building frontend...${NC}"
cd app
npm run build
cd ..

echo -e "${GREEN}✅ Frontend built successfully${NC}"

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}Program ID: $PROGRAM_ID${NC}"
echo -e "${BLUE}Network: Devnet${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Start the frontend: cd app && npm run dev"
echo "2. Visit http://localhost:3000"
echo "3. Connect your wallet and start trading!"
echo ""
echo -e "${YELLOW}Important:${NC}"
echo "- Make sure your wallet is set to devnet"
echo "- Get devnet SOL from the faucet if needed"
echo "- Test all features before mainnet deployment"
