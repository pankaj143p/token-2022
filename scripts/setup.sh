#!/bin/bash

# Quick setup script for development
set -e

echo "🔧 Setting up Token-2022 AMM development environment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Create directory structure if it doesn't exist
mkdir -p programs/token-2022-amm/src
mkdir -p app/src/{components,utils,styles,pages}
mkdir -p tests
mkdir -p scripts
mkdir -p sdk

echo -e "${YELLOW}Installing global dependencies...${NC}"

# Install global tools if not present
if ! command -v anchor &> /dev/null; then
    echo "Installing Anchor CLI..."
    cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked
fi

if ! command -v solana &> /dev/null; then
    echo "Please install Solana CLI from https://docs.solana.com/cli/install-solana-cli-tools"
    exit 1
fi

echo -e "${YELLOW}Configuring Solana for devnet...${NC}"
solana config set --url devnet

# Generate a new keypair if none exists
if [ ! -f ~/.config/solana/id.json ]; then
    echo "Generating new Solana keypair..."
    solana-keygen new --no-bip39-passphrase
fi

echo -e "${YELLOW}Requesting devnet SOL...${NC}"
solana airdrop 2

echo -e "${YELLOW}Installing project dependencies...${NC}"
npm install

# Install frontend dependencies
if [ -d "app" ]; then
    cd app
    npm install
    cd ..
fi

echo -e "${GREEN}✅ Setup completed!${NC}"
echo ""
echo "Next steps:"
echo "1. Run 'anchor build' to build the program"
echo "2. Run 'anchor deploy' to deploy to devnet"
echo "3. Run 'cd app && npm run dev' to start the frontend"
