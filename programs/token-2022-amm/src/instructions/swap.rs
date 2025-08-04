use anchor_lang::prelude::*;
use anchor_spl::token_2022::{Token2022, TokenAccount, Transfer as Transfer2022, transfer as transfer_2022};
use anchor_spl::token::{Token, Transfer, transfer, Mint, MintTo, mint_to};
use crate::state::*;
use crate::errors::*;
use crate::utils::*;

#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"pool", pool.token_a_mint.as_ref(), pool.token_b_mint.as_ref()],
        bump,
        constraint = pool.is_active @ AmmError::InvalidCalculation
    )]
    pub pool: Account<'info, Pool>,

    /// User's source token account
    #[account(mut)]
    pub user_source_token: Account<'info, TokenAccount>,

    /// User's destination token account
    #[account(mut)]
    pub user_dest_token: Account<'info, TokenAccount>,

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

    /// Token programs
    pub token_program: Program<'info, Token>,
    pub token_2022_program: Program<'info, Token2022>,

    /// Remaining accounts for transfer hooks
    /// CHECK: These will be validated during hook execution
    #[account(mut)]
    pub hook_program: Option<AccountInfo<'info>>,
}

pub fn swap(
    ctx: Context<Swap>,
    amount_in: u64,
    minimum_amount_out: u64,
    a_to_b: bool,
) -> Result<()> {
    let pool = &ctx.accounts.pool;
    
    // Get current balances
    let balance_a = ctx.accounts.token_a_vault.amount;
    let balance_b = ctx.accounts.token_b_vault.amount;
    
    require!(balance_a > 0 && balance_b > 0, AmmError::InsufficientLiquidity);
    
    // Calculate output amount using constant product formula with fees
    let amount_out = if a_to_b {
        calculate_output_amount(amount_in, balance_a, balance_b, pool.fee_rate)?
    } else {
        calculate_output_amount(amount_in, balance_b, balance_a, pool.fee_rate)?
    };
    
    require!(amount_out >= minimum_amount_out, AmmError::SlippageExceeded);
    
    // Validate transfer hooks before executing swap
    if a_to_b {
        validate_token_2022_transfer(
            &ctx.accounts.user_source_token,
            &ctx.accounts.token_a_vault,
            amount_in,
            &pool.hook_whitelist,
            ctx.remaining_accounts,
        )?;
    } else {
        validate_token_2022_transfer(
            &ctx.accounts.user_source_token,
            &ctx.accounts.token_b_vault,
            amount_in,
            &pool.hook_whitelist,
            ctx.remaining_accounts,
        )?;
    }
    
    let pool_seeds = &[
        b"pool",
        pool.token_a_mint.as_ref(),
        pool.token_b_mint.as_ref(),
        &[*ctx.bumps.get("pool").unwrap()],
    ];
    let signer_seeds = &[&pool_seeds[..]];
    
    if a_to_b {
        // Transfer token A from user to vault
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_2022_program.to_account_info(),
            Transfer2022 {
                from: ctx.accounts.user_source_token.to_account_info(),
                to: ctx.accounts.token_a_vault.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        transfer_2022(transfer_ctx, amount_in)?;
        
        // Transfer token B from vault to user
        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.token_b_vault.to_account_info(),
                to: ctx.accounts.user_dest_token.to_account_info(),
                authority: ctx.accounts.pool.to_account_info(),
            },
            signer_seeds,
        );
        transfer(transfer_ctx, amount_out)?;
    } else {
        // Transfer token B from user to vault
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_source_token.to_account_info(),
                to: ctx.accounts.token_b_vault.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        transfer(transfer_ctx, amount_in)?;
        
        // Transfer token A from vault to user
        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_2022_program.to_account_info(),
            Transfer2022 {
                from: ctx.accounts.token_a_vault.to_account_info(),
                to: ctx.accounts.user_dest_token.to_account_info(),
                authority: ctx.accounts.pool.to_account_info(),
            },
            signer_seeds,
        );
        transfer_2022(transfer_ctx, amount_out)?;
    }
    
    msg!("Swap completed: {} -> {}", amount_in, amount_out);
    
    Ok(())
}
