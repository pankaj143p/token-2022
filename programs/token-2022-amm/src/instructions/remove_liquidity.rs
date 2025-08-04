use anchor_lang::prelude::*;
use anchor_spl::token_2022::{Token2022, TokenAccount, Transfer as Transfer2022, transfer as transfer_2022};
use anchor_spl::token::{Token, Transfer, transfer, Mint, Burn, burn};
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct RemoveLiquidity<'info> {
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

pub fn remove_liquidity(
    ctx: Context<RemoveLiquidity>,
    lp_token_amount: u64,
    min_token_a: u64,
    min_token_b: u64,
) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    
    require!(lp_token_amount > 0, AmmError::InvalidCalculation);
    require!(lp_token_amount <= pool.lp_token_supply, AmmError::InsufficientBalance);
    
    let reserve_a = ctx.accounts.token_a_vault.amount;
    let reserve_b = ctx.accounts.token_b_vault.amount;
    
    // Calculate tokens to return proportionally
    let token_a_amount = (reserve_a as u128)
        .checked_mul(lp_token_amount as u128)
        .ok_or(AmmError::InvalidCalculation)?
        .checked_div(pool.lp_token_supply as u128)
        .ok_or(AmmError::InvalidCalculation)? as u64;
    
    let token_b_amount = (reserve_b as u128)
        .checked_mul(lp_token_amount as u128)
        .ok_or(AmmError::InvalidCalculation)?
        .checked_div(pool.lp_token_supply as u128)
        .ok_or(AmmError::InvalidCalculation)? as u64;
    
    require!(token_a_amount >= min_token_a, AmmError::SlippageExceeded);
    require!(token_b_amount >= min_token_b, AmmError::SlippageExceeded);
    
    // Burn LP tokens from user
    let burn_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Burn {
            mint: ctx.accounts.lp_token_mint.to_account_info(),
            from: ctx.accounts.user_lp_token.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        },
    );
    burn(burn_ctx, lp_token_amount)?;
    
    // Transfer tokens from pool to user
    let pool_seeds = &[
        b"pool",
        pool.token_a_mint.as_ref(),
        pool.token_b_mint.as_ref(),
        &[*ctx.bumps.get("pool").unwrap()],
    ];
    let signer_seeds = &[&pool_seeds[..]];
    
    let transfer_a_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_2022_program.to_account_info(),
        Transfer2022 {
            from: ctx.accounts.token_a_vault.to_account_info(),
            to: ctx.accounts.user_token_a.to_account_info(),
            authority: ctx.accounts.pool.to_account_info(),
        },
        signer_seeds,
    );
    transfer_2022(transfer_a_ctx, token_a_amount)?;
    
    let transfer_b_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.token_b_vault.to_account_info(),
            to: ctx.accounts.user_token_b.to_account_info(),
            authority: ctx.accounts.pool.to_account_info(),
        },
        signer_seeds,
    );
    transfer(transfer_b_ctx, token_b_amount)?;
    
    // Update pool state
    pool.lp_token_supply = pool.lp_token_supply.checked_sub(lp_token_amount).unwrap();
    
    msg!("Removed liquidity: {} LP tokens -> {} A, {} B", lp_token_amount, token_a_amount, token_b_amount);
    
    Ok(())
}
