use anchor_lang::prelude::*;

declare_id!("AcVqvDTmYKLpHM1o1WnkUAHPT6vxRomaSfFji9wRY1m7");

#[program]
pub mod token_amm {
    use super::*;

    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        fee_rate: u64,
        _hook_whitelist: Vec<Pubkey>, // Prefix with underscore to suppress warning
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
    
    /// Token A mint (Token-2022)
    pub token_a_mint: InterfaceAccount<'info, anchor_spl::token_interface::Mint>,
    /// Token B mint  
    pub token_b_mint: InterfaceAccount<'info, anchor_spl::token_interface::Mint>,
    
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
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