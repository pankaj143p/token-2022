use anchor_lang::prelude::*;
use anchor_spl::token_2022::{Token2022, TokenAccount};
use crate::errors::*;

/// Calculate output amount for AMM swap using constant product formula
/// Includes fee calculation
pub fn calculate_output_amount(
    amount_in: u64,
    reserve_in: u64,
    reserve_out: u64,
    fee_rate: u64,
) -> Result<u64> {
    require!(amount_in > 0, AmmError::InvalidCalculation);
    require!(reserve_in > 0 && reserve_out > 0, AmmError::InsufficientLiquidity);
    
    // Apply fee: amount_in_with_fee = amount_in * (10000 - fee_rate) / 10000
    let amount_in_with_fee = (amount_in as u128)
        .checked_mul((10000 - fee_rate) as u128)
        .ok_or(AmmError::InvalidCalculation)?
        .checked_div(10000)
        .ok_or(AmmError::InvalidCalculation)? as u64;
    
    // Constant product formula: (x + dx) * (y - dy) = x * y
    // dy = y * dx / (x + dx)
    let numerator = (reserve_out as u128)
        .checked_mul(amount_in_with_fee as u128)
        .ok_or(AmmError::InvalidCalculation)?;
    
    let denominator = (reserve_in as u128)
        .checked_add(amount_in_with_fee as u128)
        .ok_or(AmmError::InvalidCalculation)?;
    
    let amount_out = numerator
        .checked_div(denominator)
        .ok_or(AmmError::InvalidCalculation)? as u64;
    
    require!(amount_out > 0, AmmError::InvalidCalculation);
    require!(amount_out < reserve_out, AmmError::InsufficientLiquidity);
    
    Ok(amount_out)
}

/// Calculate liquidity tokens to mint
pub fn calculate_lp_tokens(
    amount_a: u64,
    amount_b: u64,
    reserve_a: u64,
    reserve_b: u64,
    total_supply: u64,
) -> Result<u64> {
    if total_supply == 0 {
        // Initial liquidity: geometric mean
        let lp_tokens = ((amount_a as u128)
            .checked_mul(amount_b as u128)
            .ok_or(AmmError::InvalidCalculation)?)
            .integer_sqrt() as u64;
        
        require!(lp_tokens > 1000, AmmError::InvalidCalculation); // Minimum liquidity
        Ok(lp_tokens - 1000) // Burn first 1000 LP tokens
    } else {
        // Proportional liquidity
        let lp_from_a = (amount_a as u128)
            .checked_mul(total_supply as u128)
            .ok_or(AmmError::InvalidCalculation)?
            .checked_div(reserve_a as u128)
            .ok_or(AmmError::InvalidCalculation)? as u64;
        
        let lp_from_b = (amount_b as u128)
            .checked_mul(total_supply as u128)
            .ok_or(AmmError::InvalidCalculation)?
            .checked_div(reserve_b as u128)
            .ok_or(AmmError::InvalidCalculation)? as u64;
        
        Ok(lp_from_a.min(lp_from_b))
    }
}

/// Validate Token-2022 transfer hooks
pub fn validate_token_2022_transfer(
    from_account: &Account<TokenAccount>,
    to_account: &Account<TokenAccount>,
    amount: u64,
    hook_whitelist: &[Pubkey],
    remaining_accounts: &[AccountInfo],
) -> Result<()> {
    // Check if the token has transfer hooks
    let mint_info = from_account.mint;
    
    // For now, we'll implement basic validation
    // In a full implementation, you would:
    // 1. Check if the mint has transfer hook extensions
    // 2. Validate the hook program is in the whitelist
    // 3. Execute pre-transfer validation
    // 4. Simulate the transfer to ensure it would succeed
    
    msg!("Validating transfer hooks for amount: {}", amount);
    msg!("From: {}, To: {}", from_account.key(), to_account.key());
    
    // Basic validation - check if we have any hook programs in remaining accounts
    for account in remaining_accounts {
        if hook_whitelist.contains(account.key) {
            msg!("Found whitelisted hook program: {}", account.key);
            // Here you would execute hook validation logic
        }
    }
    
    Ok(())
}

/// Helper trait for integer square root
trait IntegerSquareRoot {
    fn integer_sqrt(self) -> Self;
}

impl IntegerSquareRoot for u128 {
    fn integer_sqrt(self) -> Self {
        if self < 2 {
            return self;
        }
        
        let mut x = self;
        let mut y = (self + 1) / 2;
        
        while y < x {
            x = y;
            y = (x + self / x) / 2;
        }
        
        x
    }
}
