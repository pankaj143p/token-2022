use anchor_lang::prelude::*;

#[account]
pub struct Pool {
    /// Authority that can update pool parameters
    pub authority: Pubkey,
    
    /// Token A mint (Token-2022)
    pub token_a_mint: Pubkey,
    
    /// Token B mint (can be SOL wrapper or another Token-2022)
    pub token_b_mint: Pubkey,
    
    /// Token A vault
    pub token_a_vault: Pubkey,
    
    /// Token B vault  
    pub token_b_vault: Pubkey,
    
    /// LP token mint
    pub lp_token_mint: Pubkey,
    
    /// Fee rate in basis points (e.g., 30 = 0.3%)
    pub fee_rate: u64,
    
    /// Total supply of LP tokens
    pub lp_token_supply: u64,
    
    /// Whitelisted transfer hook programs
    pub hook_whitelist: Vec<Pubkey>,
    
    /// Pool state
    pub is_active: bool,
    
    /// Reserved space for future upgrades
    pub reserved: [u8; 128],
}

impl Pool {
    pub const LEN: usize = 32 + 32 + 32 + 32 + 32 + 32 + 8 + 8 + (4 + 32 * 10) + 1 + 128;
}

#[account]
pub struct UserLiquidity {
    /// User who provided liquidity
    pub user: Pubkey,
    
    /// Pool this liquidity belongs to
    pub pool: Pubkey,
    
    /// Amount of LP tokens owned
    pub lp_token_amount: u64,
    
    /// Timestamp of last action
    pub last_action_time: i64,
    
    /// Reserved space
    pub reserved: [u8; 64],
}

impl UserLiquidity {
    pub const LEN: usize = 32 + 32 + 8 + 8 + 64;
}

#[account]
pub struct HookRegistry {
    /// Authority that can update the registry
    pub authority: Pubkey,
    
    /// List of approved hook programs
    pub approved_hooks: Vec<Pubkey>,
    
    /// Hook metadata (name, description, etc.)
    pub hook_metadata: Vec<HookMetadata>,
    
    /// Registry version
    pub version: u64,
    
    /// Reserved space
    pub reserved: [u8; 128],
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct HookMetadata {
    pub program_id: Pubkey,
    pub name: String,
    pub description: String,
    pub is_active: bool,
    pub risk_level: u8, // 1 = low, 2 = medium, 3 = high
}

impl HookRegistry {
    pub const LEN: usize = 32 + (4 + 32 * 50) + (4 + 200 * 50) + 8 + 128;
}
