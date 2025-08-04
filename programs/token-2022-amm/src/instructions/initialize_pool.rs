use anchor_lang::prelude::*;
use anchor_spl::token_2022::{Token2022, Mint, TokenAccount};
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = Pool::LEN,
        seeds = [b"pool", token_a_mint.key().as_ref(), token_b_mint.key().as_ref()],
        bump
    )]
    pub pool: Account<'info, Pool>,

    /// Token A mint (Token-2022 with potential hooks)
    #[account(
        constraint = token_a_mint.to_account_info().owner == &Token2022::id()
    )]
    pub token_a_mint: Account<'info, Mint>,

    /// Token B mint (SOL wrapper or another token)
    pub token_b_mint: Account<'info, Mint>,

    /// Token A vault
    #[account(
        init,
        payer = authority,
        seeds = [b"vault_a", pool.key().as_ref()],
        bump,
        token::mint = token_a_mint,
        token::authority = pool,
        token::token_program = token_2022_program
    )]
    pub token_a_vault: Account<'info, TokenAccount>,

    /// Token B vault
    #[account(
        init,
        payer = authority,
        seeds = [b"vault_b", pool.key().as_ref()],
        bump,
        token::mint = token_b_mint,
        token::authority = pool,
        token::token_program = token_program
    )]
    pub token_b_vault: Account<'info, TokenAccount>,

    /// LP token mint
    #[account(
        init,
        payer = authority,
        seeds = [b"lp_mint", pool.key().as_ref()],
        bump,
        mint::decimals = 9,
        mint::authority = pool,
        mint::token_program = token_program
    )]
    pub lp_token_mint: Account<'info, Mint>,

    pub token_program: Program<'info, anchor_spl::token::Token>,
    pub token_2022_program: Program<'info, Token2022>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn initialize_pool(
    ctx: Context<InitializePool>,
    fee_rate: u64,
    hook_whitelist: Vec<Pubkey>,
) -> Result<()> {
    require!(fee_rate <= 10000, AmmError::InvalidFeeRate); // Max 100%
    require!(hook_whitelist.len() <= 10, AmmError::InvalidCalculation);

    let pool = &mut ctx.accounts.pool;
    
    pool.authority = ctx.accounts.authority.key();
    pool.token_a_mint = ctx.accounts.token_a_mint.key();
    pool.token_b_mint = ctx.accounts.token_b_mint.key();
    pool.token_a_vault = ctx.accounts.token_a_vault.key();
    pool.token_b_vault = ctx.accounts.token_b_vault.key();
    pool.lp_token_mint = ctx.accounts.lp_token_mint.key();
    pool.fee_rate = fee_rate;
    pool.lp_token_supply = 0;
    pool.hook_whitelist = hook_whitelist;
    pool.is_active = true;

    msg!("Pool initialized with fee rate: {} bps", fee_rate);
    msg!("Whitelisted hooks: {:?}", pool.hook_whitelist);

    Ok(())
}
