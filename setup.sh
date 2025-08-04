#!/bin/bash

# Token-2022 AMM Setup Script
echo "🚀 Setting up Token-2022 AMM with Transfer Hooks..."

# Check if required tools are installed
check_tool() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is not installed. Please install it first."
        exit 1
    fi
}

echo "📋 Checking prerequisites..."
check_tool "node"
check_tool "yarn"
check_tool "anchor"
check_tool "solana"

# Set Solana to devnet
echo "🔧 Configuring Solana CLI for devnet..."
solana config set --url devnet

# Install dependencies
echo "📦 Installing dependencies..."
yarn install

# Build smart contracts
echo "🔨 Building smart contracts..."
anchor build

# Generate program keypairs if they don't exist
echo "🔑 Generating program keypairs..."
if [ ! -f "target/deploy/token_2022_amm-keypair.json" ]; then
    solana-keygen new --outfile target/deploy/token_2022_amm-keypair.json --no-bip39-passphrase
fi

if [ ! -f "target/deploy/transfer_hook-keypair.json" ]; then
    solana-keygen new --outfile target/deploy/transfer_hook-keypair.json --no-bip39-passphrase
fi

# Install frontend dependencies
echo "🎨 Setting up frontend..."
cd app
yarn install
cd ..

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Deploy to devnet: anchor deploy --provider.cluster devnet"
echo "2. Start frontend: yarn start:frontend"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "💡 Make sure you have SOL in your devnet wallet for testing!"
echo "   Get devnet SOL: solana airdrop 2"
