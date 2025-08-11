#!/bin/bash

# Token-2022 AMM Demo Setup
# This creates a working demonstration using existing Token-2022 programs

set -e

echo "🚀 Setting up Token-2022 AMM Demo..."

# Configure Solana for devnet
echo "📡 Configuring Solana for devnet..."
solana config set --url devnet
solana config set --keypair ~/.config/solana/id.json

# Check balance and airdrop if needed
echo "💰 Checking SOL balance..."
BALANCE=$(solana balance --lamports)
if [ "$BALANCE" -lt 100000000 ]; then
    echo "🪂 Requesting airdrop..."
    solana airdrop 2
    sleep 5
fi

# Generate a new program keypair if it doesn't exist
if [ ! -f "program-keypair.json" ]; then
    echo "🔑 Generating program keypair..."
    solana-keygen new --no-bip39-passphrase --outfile program-keypair.json
fi

# Create token mints using Token-2022 program
echo "🏪 Creating Token-2022 mints..."

# Create first token (with transfer hook)
echo "Creating Token A with Transfer Hook..."
spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --enable-metadata --enable-transfer-hook

# Create second token (standard)
echo "Creating Token B..."
spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

echo "✅ Token-2022 AMM Demo setup completed!"
echo "🌐 Frontend will be available at: http://localhost:3000"
echo "📊 Tokens created and ready for trading!"
echo ""
echo "Next steps:"
echo "1. cd app && npm install && npm run dev"
echo "2. Open http://localhost:3000 in your browser"
echo "3. Connect your wallet and start trading!"
