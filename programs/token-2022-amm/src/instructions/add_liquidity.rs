use anchor_lang::prelude::*;
use anchor_spl::token_2022::{Token2022, TokenAccount, Transfer as Transfer2022, transfer as transfer_2022};
use anchor_spl::token::{Token, Transfer, transfer, Mint, MintTo, mint_to};
use crate::state::*;
use crate::errors::*;
use crate::utils::*;

#[derive(Accounts)]
pub struct AddLiquidity<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"pool", pool.token_a_mint.as_ref(), pool.token_b_mint.as_ref()],
        bump
    )]
    pub pool: Account<'info, Pool>,

    /// User's token A account
    #[account(mut)]
    pub user_token_a: Account<'info, TokenAccount>,

    /// User's token B account
    #[account(mut)]
    pub user_token_b: Account<'info, TokenAccount>,

    /// User's LP token account
    #[account(mut)]
    pub user_lp_token: Account<'info, TokenAccount>,

    /// Pool's token A vault
    #[account(
        mut,
        seeds = [b"vault_a", pool.key().as_ref()],
        bump
    )]
    pub token_a_vault: Account<'info, TokenAccount>,

    /// Pool's token B vault
    #[account(
        mut,
        seeds = [b"vault_b", pool.key().as_ref()],
        bump
    )]
    pub token_b_vault: Account<'info, TokenAccount>,

    /// LP token mint
    #[account(
        mut,
        seeds = [b"lp_mint", pool.key().as_ref()],
        bump
    )]
    pub lp_token_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
    pub token_2022_program: Program<'info, Token2022>,
}

pub fn add_liquidity(
    ctx: Context<AddLiquidity>,
    token_a_amount: u64,
    token_b_amount: u64,
    min_lp_tokens: u64,
) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    
    require!(token_a_amount > 0 && token_b_amount > 0, AmmError::InvalidCalculation);
    
    let reserve_a = ctx.accounts.token_a_vault.amount;
    let reserve_b = ctx.accounts.token_b_vault.amount;
    
    // Calculate LP tokens to mint
    let lp_tokens = calculate_lp_tokens(
        token_a_amount,
        token_b_amount,
        reserve_a,
        reserve_b,
        pool.lp_token_supply,
    )?;
    
    require!(lp_tokens >= min_lp_tokens, AmmError::SlippageExceeded);
    
    // Transfer tokens from user to pool
    let transfer_a_ctx = CpiContext::new(
        ctx.accounts.token_2022_program.to_account_info(),
        Transfer2022 {
            from: ctx.accounts.user_token_a.to_account_info(),
            to: ctx.accounts.token_a_vault.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        },
    );
    transfer_2022(transfer_a_ctx, token_a_amount)?;
    
    let transfer_b_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.user_token_b.to_account_info(),
            to: ctx.accounts.token_b_vault.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        },
    );
    transfer(transfer_b_ctx, token_b_amount)?;
    
    // Mint LP tokens to user
    let pool_seeds = &[
        b"pool",
        pool.token_a_mint.as_ref(),
        pool.token_b_mint.as_ref(),
        &[*ctx.bumps.get("pool").unwrap()],
    ];
    let signer_seeds = &[&pool_seeds[..]];
    
    let mint_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        MintTo {
            mint: ctx.accounts.lp_token_mint.to_account_info(),
            to: ctx.accounts.user_lp_token.to_account_info(),
            authority: ctx.accounts.pool.to_account_info(),
        },
        signer_seeds,
    );
    mint_to(mint_ctx, lp_tokens)?;
    
    // Update pool state
    pool.lp_token_supply = pool.lp_token_supply.checked_add(lp_tokens).unwrap();
    
    msg!("Added liquidity: {} A, {} B -> {} LP tokens", token_a_amount, token_b_amount, lp_tokens);
    
    Ok(())
}
