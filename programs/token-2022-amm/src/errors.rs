use anchor_lang::prelude::*;

#[error_code]
pub enum AmmError {
    #[msg("Invalid fee rate")]
    InvalidFeeRate,
    
    #[msg("Insufficient liquidity")]
    InsufficientLiquidity,
    
    #[msg("Slippage tolerance exceeded")]
    SlippageExceeded,
    
    #[msg("Transfer hook not whitelisted")]
    HookNotWhitelisted,
    
    #[msg("Transfer hook validation failed")]
    HookValidationFailed,
    
    #[msg("Invalid token mint")]
    InvalidTokenMint,
    
    #[msg("Insufficient balance")]
    InsufficientBalance,
    
    #[msg("Invalid calculation")]
    InvalidCalculation,
    
    #[msg("Pool already initialized")]
    PoolAlreadyInitialized,
    
    #[msg("Unauthorized")]
    Unauthorized,
    
    #[msg("Token-2022 extension not supported")]
    UnsupportedExtension,
    
    #[msg("Hook execution failed")]
    HookExecutionFailed,
}
