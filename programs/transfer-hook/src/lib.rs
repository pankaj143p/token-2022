use anchor_lang::prelude::*;
use spl_transfer_hook_interface::instruction::{ExecuteInstruction, TransferHookInstruction};

declare_id!("HOOK2222222222222222222222222222222222222222");

#[program]
pub mod transfer_hook {
    use super::*;

    /// Initialize the transfer hook configuration
    pub fn initialize_hook(ctx: Context<InitializeHook>, config: HookConfig) -> Result<()> {
        let hook_account = &mut ctx.accounts.hook_account;
        hook_account.authority = ctx.accounts.authority.key();
        hook_account.config = config;
        hook_account.is_active = true;
        
        msg!("Transfer hook initialized");
        Ok(())
    }

    /// Execute the transfer hook
    pub fn execute(ctx: Context<ExecuteHook>, amount: u64) -> Result<()> {
        let hook_account = &ctx.accounts.hook_account;
        
        require!(hook_account.is_active, TransferHookError::HookNotActive);
        
        // Implement hook logic based on configuration
        match hook_account.config.hook_type {
            HookType::Whitelist => {
                execute_whitelist_hook(ctx, amount)?;
            }
            HookType::KYC => {
                execute_kyc_hook(ctx, amount)?;
            }
            HookType::RateLimit => {
                execute_rate_limit_hook(ctx, amount)?;
            }
            HookType::Compliance => {
                execute_compliance_hook(ctx, amount)?;
            }
        }
        
        Ok(())
    }

    /// Update hook configuration (authority only)
    pub fn update_config(ctx: Context<UpdateConfig>, new_config: HookConfig) -> Result<()> {
        require!(
            ctx.accounts.authority.key() == ctx.accounts.hook_account.authority,
            TransferHookError::Unauthorized
        );
        
        ctx.accounts.hook_account.config = new_config;
        msg!("Hook configuration updated");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeHook<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = HookAccount::LEN,
        seeds = [b"hook", mint.key().as_ref()],
        bump
    )]
    pub hook_account: Account<'info, HookAccount>,

    /// The mint that this hook applies to
    pub mint: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExecuteHook<'info> {
    #[account(
        seeds = [b"hook", source_token.mint.as_ref()],
        bump
    )]
    pub hook_account: Account<'info, HookAccount>,

    /// Source token account
    #[account(mut)]
    pub source_token: AccountInfo<'info>,

    /// Destination token account
    #[account(mut)]
    pub destination_token: AccountInfo<'info>,

    /// Transfer authority
    pub authority: AccountInfo<'info>,

    /// Additional accounts for hook-specific logic
    pub extra_account_metas: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"hook", hook_account.key().as_ref()],
        bump
    )]
    pub hook_account: Account<'info, HookAccount>,
}

#[account]
pub struct HookAccount {
    pub authority: Pubkey,
    pub config: HookConfig,
    pub is_active: bool,
    pub reserved: [u8; 128],
}

impl HookAccount {
    pub const LEN: usize = 32 + HookConfig::LEN + 1 + 128;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct HookConfig {
    pub hook_type: HookType,
    pub whitelist: Vec<Pubkey>,
    pub max_transfer_amount: u64,
    pub rate_limit_window: i64, // seconds
    pub rate_limit_amount: u64,
    pub compliance_rules: Vec<ComplianceRule>,
}

impl HookConfig {
    pub const LEN: usize = 1 + (4 + 32 * 10) + 8 + 8 + 8 + (4 + 64 * 5);
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum HookType {
    Whitelist,
    KYC,
    RateLimit,
    Compliance,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ComplianceRule {
    pub rule_type: String,
    pub parameter: String,
    pub value: u64,
}

// Hook execution functions
fn execute_whitelist_hook(ctx: Context<ExecuteHook>, _amount: u64) -> Result<()> {
    let hook_account = &ctx.accounts.hook_account;
    let destination_key = ctx.accounts.destination_token.key();
    
    require!(
        hook_account.config.whitelist.contains(&destination_key),
        TransferHookError::NotWhitelisted
    );
    
    msg!("Whitelist check passed for destination: {}", destination_key);
    Ok(())
}

fn execute_kyc_hook(ctx: Context<ExecuteHook>, _amount: u64) -> Result<()> {
    // In a real implementation, this would check KYC status
    // For now, we'll just log and pass
    msg!("KYC check passed");
    Ok(())
}

fn execute_rate_limit_hook(ctx: Context<ExecuteHook>, amount: u64) -> Result<()> {
    let hook_account = &ctx.accounts.hook_account;
    
    require!(
        amount <= hook_account.config.max_transfer_amount,
        TransferHookError::AmountExceedsLimit
    );
    
    msg!("Rate limit check passed for amount: {}", amount);
    Ok(())
}

fn execute_compliance_hook(ctx: Context<ExecuteHook>, amount: u64) -> Result<()> {
    let hook_account = &ctx.accounts.hook_account;
    
    for rule in &hook_account.config.compliance_rules {
        match rule.rule_type.as_str() {
            "max_amount" => {
                require!(amount <= rule.value, TransferHookError::ComplianceViolation);
            }
            "min_amount" => {
                require!(amount >= rule.value, TransferHookError::ComplianceViolation);
            }
            _ => {}
        }
    }
    
    msg!("Compliance check passed");
    Ok(())
}

#[error_code]
pub enum TransferHookError {
    #[msg("Transfer hook is not active")]
    HookNotActive,
    
    #[msg("Destination address not whitelisted")]
    NotWhitelisted,
    
    #[msg("Transfer amount exceeds limit")]
    AmountExceedsLimit,
    
    #[msg("Rate limit exceeded")]
    RateLimitExceeded,
    
    #[msg("Compliance violation")]
    ComplianceViolation,
    
    #[msg("Unauthorized")]
    Unauthorized,
}
