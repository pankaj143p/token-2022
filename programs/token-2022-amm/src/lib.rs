use anchor_lang::prelude::*;
use anchor_spl::token::{Token, Mint};

declare_id!("2516vhAXsYH9co7EPrW1k2oMnHUq7yS6eHerftbVaqms");

#[program]
pub mod token_amm {
    use super::*;

    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        fee_rate: u64,
        _hook_whitelist: Vec<Pubkey>,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.authority = ctx.accounts.authority.key();
        pool.token_a_mint = ctx.accounts.token_a_mint.key();
        pool.token_b_mint = ctx.accounts.token_b_mint.key();
        pool.fee_rate = fee_rate;
        pool.is_active = true;
        pool.bump = ctx.bumps.pool;
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + Pool::LEN,
        seeds = [b"pool", token_a_mint.key().as_ref(), token_b_mint.key().as_ref()],
        bump
    )]
    pub pool: Account<'info, Pool>,
    
    /// Token A mint - Works with both SPL Token and Token-2022
    pub token_a_mint: Account<'info, Mint>,
    /// Token B mint
    pub token_b_mint: Account<'info, Mint>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Pool {
    pub authority: Pubkey,
    pub token_a_mint: Pubkey,
    pub token_b_mint: Pubkey,
    pub fee_rate: u64,
    pub is_active: bool,
    pub bump: u8,
}

impl Pool {
    pub const LEN: usize = 32 + 32 + 32 + 8 + 1 + 1;
}

