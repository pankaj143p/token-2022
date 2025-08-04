use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;
pub mod errors;
pub mod utils;

use instructions::*;

declare_id!("AMM22222222222222222222222222222222222222222");

#[program]
pub mod token_2022_amm {
    use super::*;

    /// Initialize the AMM pool for Token-2022 pairs
    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        fee_rate: u64,
        hook_whitelist: Vec<Pubkey>,
    ) -> Result<()> {
        instructions::initialize_pool(ctx, fee_rate, hook_whitelist)
    }

    /// Add liquidity to the pool
    pub fn add_liquidity(
        ctx: Context<AddLiquidity>,
        token_a_amount: u64,
        token_b_amount: u64,
        min_lp_tokens: u64,
    ) -> Result<()> {
        instructions::add_liquidity(ctx, token_a_amount, token_b_amount, min_lp_tokens)
    }

    /// Remove liquidity from the pool
    pub fn remove_liquidity(
        ctx: Context<RemoveLiquidity>,
        lp_token_amount: u64,
        min_token_a: u64,
        min_token_b: u64,
    ) -> Result<()> {
        instructions::remove_liquidity(ctx, lp_token_amount, min_token_a, min_token_b)
    }

    /// Swap tokens with transfer hook validation
    pub fn swap(
        ctx: Context<Swap>,
        amount_in: u64,
        minimum_amount_out: u64,
        a_to_b: bool,
    ) -> Result<()> {
        instructions::swap(ctx, amount_in, minimum_amount_out, a_to_b)
    }

    /// Update hook whitelist (admin only)
    pub fn update_hook_whitelist(
        ctx: Context<UpdateHookWhitelist>,
        new_whitelist: Vec<Pubkey>,
    ) -> Result<()> {
        instructions::update_hook_whitelist(ctx, new_whitelist)
    }

    /// Simulate transfer to validate hooks before actual swap
    pub fn simulate_transfer(
        ctx: Context<SimulateTransfer>,
        amount: u64,
        source: Pubkey,
        destination: Pubkey,
    ) -> Result<bool> {
        instructions::simulate_transfer(ctx, amount, source, destination)
    }
}
