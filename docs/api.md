# API Documentation

## Smart Contract Instructions

### initialize_pool
Initialize a new AMM pool for Token-2022 trading.

**Parameters:**
- `fee_rate: u64` - Fee rate in basis points (e.g., 30 = 0.3%)
- `hook_whitelist: Vec<Pubkey>` - List of approved hook programs

**Accounts:**
- `authority` - Pool creator and admin
- `pool` - Pool state account (PDA)
- `token_a_mint` - Token-2022 mint
- `token_b_mint` - Second token mint
- `token_a_vault` - Pool's Token A vault
- `token_b_vault` - Pool's Token B vault
- `lp_token_mint` - LP token mint

### add_liquidity
Add liquidity to an existing pool.

**Parameters:**
- `token_a_amount: u64` - Amount of Token A to add
- `token_b_amount: u64` - Amount of Token B to add
- `min_lp_tokens: u64` - Minimum LP tokens to receive

### swap
Execute a token swap with hook validation.

**Parameters:**
- `amount_in: u64` - Input token amount
- `minimum_amount_out: u64` - Minimum output amount (slippage protection)
- `a_to_b: bool` - Swap direction

## Transfer Hook Instructions

### initialize_hook
Initialize transfer hook configuration.

**Parameters:**
- `config: HookConfig` - Hook configuration settings

### execute
Execute transfer hook validation.

**Parameters:**
- `amount: u64` - Transfer amount to validate

## Frontend API

### Token Creation
```typescript
interface CreateTokenParams {
  name: string;
  symbol: string;
  decimals: number;
  supply: number;
  hookType: 'whitelist' | 'kyc' | 'ratelimit' | 'compliance';
}
```

### Pool Creation
```typescript
interface CreatePoolParams {
  tokenA: string; // Mint address
  tokenB: string; // Mint address
  feeRate: number; // Basis points
  hookWhitelist: string[]; // Hook program addresses
}
```

### Swap Execution
```typescript
interface SwapParams {
  inputMint: string;
  outputMint: string;
  amount: number;
  slippage: number; // Percentage
}
```
