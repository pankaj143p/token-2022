# Deployment Guide

## Prerequisites

1. **Solana CLI** installed and configured
2. **Anchor CLI** version 0.29.0 or later
3. **Node.js** and **Yarn** for frontend
4. **Wallet** with sufficient SOL for deployment

## Smart Contract Deployment

### 1. Prepare Environment

```bash
# Set cluster to devnet
solana config set --url devnet

# Check your wallet balance
solana balance

# If needed, airdrop SOL for devnet
solana airdrop 2
```

### 2. Build and Deploy Contracts

```bash
# Build the programs
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Verify deployment
anchor idl init <PROGRAM_ID> --filepath target/idl/token_2022_amm.json
```

### 3. Update Program IDs

After deployment, update the program IDs in:
- `Anchor.toml`
- `lib.rs` files
- Frontend configuration

## Frontend Deployment

### 1. Build Frontend

```bash
cd app
yarn install
yarn build
```

### 2. Deploy to Vercel/Netlify

#### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Netlify Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=build
```

### 3. Environment Configuration

Create `.env.production` with:
```
REACT_APP_CLUSTER=devnet
REACT_APP_PROGRAM_ID=<YOUR_PROGRAM_ID>
REACT_APP_HOOK_PROGRAM_ID=<YOUR_HOOK_PROGRAM_ID>
```

## Mainnet Deployment

### 1. Security Checklist

- [ ] Complete security audit
- [ ] Extensive testing on devnet
- [ ] Code freeze and review
- [ ] Emergency procedures documented
- [ ] Monitoring systems ready

### 2. Deployment Steps

```bash
# Switch to mainnet
solana config set --url mainnet-beta

# Deploy with sufficient SOL
anchor deploy --provider.cluster mainnet

# Verify deployment
solana program show <PROGRAM_ID>
```

### 3. Post-Deployment

- Initialize pools with careful parameters
- Set up monitoring and alerting
- Prepare user documentation
- Announce launch to community

## Monitoring and Maintenance

### Health Checks
- Monitor program account states
- Track transaction success rates
- Watch for unusual activity patterns
- Set up alerts for errors

### Upgrades
- Plan upgrade procedures
- Test upgrades on devnet first
- Coordinate with users for maintenance windows
- Maintain backward compatibility when possible

## Troubleshooting

### Common Issues
- **Insufficient SOL**: Ensure wallet has enough balance
- **Program size limits**: Optimize program size if needed
- **RPC limits**: Use reliable RPC providers
- **Network congestion**: Be patient during high traffic
