# Demo Script for Token-2022 AMM

## Video Walkthrough Outline (10-15 minutes)

### Introduction (2 minutes)
- Welcome and project overview
- Problem statement: Token-2022 not supported by major AMMs
- Our solution: Custom AMM with transfer hook support

### Architecture Overview (3 minutes)
- Show project structure
- Explain smart contract components
- Demonstrate frontend interface
- Highlight security features

### Live Demo (8 minutes)

#### 1. Token Creation (2 minutes)
```
Navigate to: http://localhost:3000/create-token

Steps:
1. Connect wallet (Phantom/Solflare)
2. Fill token details:
   - Name: "Real Estate Token"
   - Symbol: "RET"
   - Decimals: 6
   - Supply: 100000
   - Hook Type: "Whitelist"
3. Submit transaction
4. Show successful token creation
5. Copy mint address for next step
```

#### 2. Pool Creation (2 minutes)
```
Navigate to: http://localhost:3000/create-pool

Steps:
1. Enter Token A: [RET token mint address]
2. Enter Token B: So11111111111111111111111111111111111111112 (SOL)
3. Set fee rate: 30 (0.3%)
4. Add initial liquidity: 1000 RET, 10 SOL
5. Create pool
6. Show pool created successfully
```

#### 3. Trading Demo (2 minutes)
```
Navigate to: http://localhost:3000/trade

Steps:
1. Select tokens: RET -> SOL
2. Enter amount: 100 RET
3. Show transfer hook validation
4. Review transaction details
5. Execute swap
6. Show successful trade with hook compliance
```

#### 4. Liquidity Management (2 minutes)
```
Navigate to: http://localhost:3000/liquidity

Steps:
1. Add more liquidity: 500 RET, 5 SOL
2. Show LP tokens received
3. Demonstrate remove liquidity
4. Show proportional token return
```

### Technical Deep Dive (2 minutes)
- Show hook validation in smart contract code
- Explain whitelisting mechanism
- Demonstrate security features
- Show program logs and validation

### Conclusion (1 minute)
- Recap benefits for Token-2022 ecosystem
- Future enhancements
- Call to action for community

## Key Talking Points

### Problem Statement
"Currently, no major AMMs like Raydium, Orca, or Meteora support Token-2022 tokens with active transfer hooks. This limits the adoption of Token-2022 as a DeFi primitive and prevents tokenized real-world assets from being traded efficiently."

### Solution Highlights
- **Whitelisted Hook Validation**: Only approved hook programs can execute
- **Pre-transaction Simulation**: Validates transfers before execution
- **Compliance Ready**: Built for enterprise and RWA use cases
- **Seamless UX**: Easy-to-use interface for all operations

### Technical Innovation
- **Custom AMM Design**: Purpose-built for Token-2022 compatibility
- **Hook Validation Layer**: Intercepts and validates all transfers
- **Security First**: Multiple layers of protection and validation
- **Extensible Architecture**: Support for future hook types

## Demo Environment Setup

### Prerequisites
```bash
# Ensure these are running
solana-test-validator --reset
# or use devnet with sufficient SOL
```

### Demo Wallet Setup
```bash
# Create demo wallet with sufficient SOL
solana-keygen new --outfile demo-wallet.json
solana airdrop 10 --keypair demo-wallet.json
```

### Browser Setup
- Open browser in incognito mode
- Have wallet extension ready
- Clear any cached data
- Prepare screen recording software

## Contingency Plans

### If Live Demo Fails
- Have pre-recorded backup segments
- Show screenshots of successful transactions
- Walk through code instead of live execution
- Demonstrate on localhost if network issues

### Common Issues
- **Network congestion**: Switch to localhost
- **Wallet connection**: Refresh and reconnect
- **Transaction failures**: Show in logs and retry
- **UI not loading**: Have static screenshots ready

## Post-Demo Resources

### GitHub Repository
- Link to complete source code
- Detailed README with setup instructions
- API documentation
- Security considerations

### Deployment Information
- Devnet program addresses
- Frontend deployment URL
- Test token mint addresses
- Sample transaction signatures

### Future Roadmap
- Mainnet deployment timeline
- Additional hook type support
- Integration with existing AMMs
- Community governance implementation

## Questions & Answers

### Expected Questions
1. **Q**: How does this compare to existing AMMs?
   **A**: Purpose-built for Token-2022, with native hook support and compliance features.

2. **Q**: What hooks are currently supported?
   **A**: Whitelist, KYC, rate limiting, and compliance hooks with extensible architecture.

3. **Q**: Is this secure for mainnet?
   **A**: Built with security-first approach, includes whitelisting and simulation validation.

4. **Q**: Can this integrate with existing AMMs?
   **A**: Architecture designed for potential integration with protocols like Raydium and Orca.

5. **Q**: What's the gas cost impact?
   **A**: Minimal overhead thanks to efficient validation and whitelisting approach.
