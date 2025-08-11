#!/bin/bash

# Manual build script for Token-2022 AMM
# This bypasses anchor build and uses cargo directly

set -e

echo "Building Token-2022 AMM manually..."

# Navigate to program directory
cd programs/token-2022-amm

# Build using standard cargo for Solana BPF target
echo "Building with cargo..."
cargo build-bpf --features anchor-lang/default

# Copy the compiled program to the expected location
mkdir -p ../../target/deploy
if [ -f target/deploy/token_2022_amm.so ]; then
    cp target/deploy/token_2022_amm.so ../../target/deploy/
    echo "Build successful! Program binary at target/deploy/token_2022_amm.so"
else
    echo "Build failed - no output binary found"
    exit 1
fi

echo "Manual build completed successfully!"
