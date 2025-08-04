# Development Guide

## Smart Contract Development

### Building Contracts
```bash
anchor build
```

### Testing Contracts
```bash
anchor test
```

### Deploying to Devnet
```bash
anchor deploy --provider.cluster devnet
```

## Frontend Development

### Starting Development Server
```bash
cd app
yarn start
```

### Building for Production
```bash
cd app
yarn build
```

## Key Components

### AMM Program Structure
- `lib.rs` - Main program entry point
- `instructions/` - Transaction instruction handlers
- `state/` - Account state definitions
- `errors.rs` - Custom error definitions
- `utils.rs` - Helper functions

### Frontend Structure
- `src/pages/` - Main application pages
- `src/components/` - Reusable UI components
- `src/utils/` - Utility functions and Solana helpers

## Testing Workflow

1. Start local validator: `solana-test-validator`
2. Deploy contracts: `anchor deploy`
3. Run tests: `anchor test`
4. Start frontend: `yarn start:frontend`

## Debugging Tips

- Use `msg!()` macro in Rust for logging
- Check program logs: `solana logs`
- Verify account states in Solana Explorer
- Use browser devtools for frontend debugging
