# Token-2022 AMM 🪙🔄

A complete Automated Market Maker (AMM) implementation supporting Solana's Token-2022 standard with Transfer Hooks for enterprise-grade tokenized assets.

![Token-2022 AMM](https://img.shields.io/badge/Solana-Token--2022-9945FF?style=for-the-badge&logo=solana)
![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

## 🎯 Problem & Solution

### The Problem
Token-2022 enables critical features for real-world asset tokenization:
- ✅ Whitelisting & KYC gating
- ✅ Conditional transfers
- ✅ Programmable compliance via Transfer Hooks

**However**, no major AMMs support Token-2022 with active Transfer Hooks, limiting DeFi adoption.

### Our Solution
A complete AMM that makes Token-2022 with Transfer Hooks tradable through:
- 🔐 **Hook Whitelisting System**: Only approved transfer hook programs allowed
- 🏊‍♀️ **Full AMM Functionality**: Pool creation, liquidity provision, token swapping  
- 🎨 **Complete UI**: User-friendly interface for all operations
- 🛡️ **Security First**: Comprehensive validation and error handling

## 🏗️ Architecture

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Frontend (React)  │    │  Anchor Program     │    │   Token-2022        │
│                     │    │                     │    │                     │
│ • Token Creator     │◄──►│ • initialize_amm    │◄──►│ • Transfer Hooks    │
│ • Pool Creator      │    │ • create_pool       │    │ • Mint Extensions   │
│ • Swap Interface    │    │ • whitelist_hook    │    │ • Custom Logic      │
│ • Liquidity Provider│    │ • add_liquidity     │    │                     │
└─────────────────────┘    │ • swap              │    └─────────────────────┘
                           └─────────────────────┘
```

## ⚡ Quick Start

### Prerequisites
- **Rust** 1.70+
- **Node.js** 18+  
- **Solana CLI** 1.17+
- **Anchor CLI** 0.31+

### 1. Setup Environment
```bash
# Clone and setup
git clone <repo-url> token-2022-amm
cd token-2022-amm

# Run automated setup
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 2. Build & Deploy
```bash
# Build everything
npm run build-all

# Deploy to devnet
npm run deploy
```

### 3. Start Frontend
```bash
cd app
npm run dev
```

Visit `http://localhost:3000` to use the AMM interface!

## 🎮 Demo Walkthrough

### 1. **Connect Wallet**
- Support for all major Solana wallets (Phantom, Solflare, etc.)
- Automatic devnet configuration

### 2. **Create Token-2022**
```typescript
// Example: Create token with KYC hook
const token = await createToken2022({
  name: "Enterprise Token",
  symbol: "ENT",
  transferHook: kycHookProgram,
  supply: 1_000_000
});
```

### 3. **Create Trading Pool**
```typescript
// Create SOL-ENT pool
const pool = await createPool({
  tokenA: NATIVE_MINT, // SOL
  tokenB: enterpriseToken,
  initialPrice: 1.0
});
```

### 4. **Add Liquidity**
```typescript
// Become a liquidity provider
await addLiquidity({
  pool: poolAddress,
  amountA: 100, // 100 SOL
  amountB: 100, // 100 ENT
  slippage: 0.5
});
```

### 5. **Execute Swaps**
```typescript
// Swap with automatic hook validation
await swap({
  pool: poolAddress,
  tokenIn: NATIVE_MINT,
  amountIn: 10,
  minimumAmountOut: 9.5,
  slippage: 0.5
});
```

## 🔐 Transfer Hook Security

### Whitelisting System
The AMM implements a comprehensive security model:

```rust
pub struct HookWhitelist {
    pub amm: Pubkey,
    pub bump: u8,
    pub whitelisted_hooks: Vec<Pubkey>,
}
```

### Supported Hook Types
- **✅ KYC/AML Compliance**: Identity verification requirements
- **✅ Geographic Restrictions**: Location-based transfer rules  
- **✅ Time-based Locks**: Scheduled release mechanisms
- **✅ Custom Business Logic**: Enterprise-specific requirements

### Validation Process
1. Check if token has transfer hooks enabled
2. Verify all hooks are whitelisted  
3. Execute transfer with automatic hook validation
4. Handle hook failures gracefully

## 📊 Program Details

### Core Instructions
- **`initialize_amm`**: Setup AMM with fee configuration
- **`create_pool`**: Create new token pair trading pools
- **`whitelist_hook`**: Add approved transfer hook programs  
- **`add_liquidity`**: Provide liquidity to earn fees
- **`swap`**: Execute token trades with hook validation

### Account Structure
```rust
pub struct Pool {
    pub amm: Pubkey,           // Parent AMM
    pub token_a_mint: Pubkey,  // First token
    pub token_b_mint: Pubkey,  // Second token  
    pub reserve_a: u64,        // Token A reserves
    pub reserve_b: u64,        // Token B reserves
    pub lp_supply: u64,        // LP token supply
    pub is_active: bool,       // Trading status
}
```

### Economics
- **AMM Model**: Constant Product (x * y = k)
- **Default Fee**: 0.3% per swap
- **LP Rewards**: Proportional fee distribution
- **Slippage Protection**: Configurable tolerance levels

## 🧪 Testing

### Run Full Test Suite
```bash
# Unit tests
anchor test

# Integration tests  
npm run test

# Frontend tests
cd app && npm test
```

### Test Coverage
- ✅ AMM initialization
- ✅ Pool creation with Token-2022
- ✅ Hook whitelisting validation
- ✅ Liquidity operations
- ✅ Swap execution with hooks
- ✅ Error handling edge cases

## 🚀 Deployment

### Devnet Deployment
```bash
# Deploy program
anchor deploy --provider.cluster devnet

# Initialize AMM
npm run deploy-program
```

### Mainnet Deployment
```bash
# Switch to mainnet
solana config set --url mainnet-beta

# Deploy with production settings
anchor deploy --provider.cluster mainnet
```

### Production Configuration
```toml
[programs.mainnet]
token_2022_amm = "Your-Program-ID-Here"

[provider]
cluster = "mainnet-beta"
```

## 📁 Project Structure

```
token-2022-amm/
├── programs/
│   └── token-2022-amm/        # Rust Anchor program
│       ├── src/lib.rs         # Main program logic
│       └── Cargo.toml         # Rust dependencies
├── app/                       # React frontend
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── utils/            # Helper functions
│   │   └── pages/            # Application pages
│   └── package.json
├── tests/                     # Anchor tests
├── scripts/                   # Build & deployment scripts
├── sdk/                       # TypeScript SDK
└── target/                    # Compiled artifacts
```

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`  
3. Make changes and add tests
4. Run full test suite: `npm run test`
5. Submit pull request

## 📜 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Solana Labs** for Token-2022 standard
- **Coral/Anchor** for development framework
- **Community** for feedback and testing

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/solana-labs/token-2022-amm/issues)
- **Discord**: [Community Channel](https://discord.gg/solana)

---

**Built with ❤️ for the Solana ecosystem**

*Making Token-2022 with Transfer Hooks tradable in DeFi*
