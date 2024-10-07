use anchor_lang::prelude::*;

declare_id!("EfdvNWsnXtmHdW95Xju1EspxowpTUCZuakQdVUCN8XTs");

#[account]
pub struct PlatformState {
    pub total_lenders: u64,
    pub total_borrowers: u64,
}

#[account]
pub struct Lender {
    pub tokens_lent: u64,
}

#[account]
pub struct Borrower {
    pub tokens_borrowed: u64,
    pub reputation_score: u8,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + 16)]
    pub platform_state: Account<'info, PlatformState>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Lend<'info> {
    #[account(mut)]
    pub lender: Account<'info, Lender>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Borrow<'info> {
    #[account(mut)]
    pub borrower: Account<'info, Borrower>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Repay<'info> {
    #[account(mut)]
    pub borrower: Account<'info, Borrower>,
    pub system_program: Program<'info, System>,
}


#[program]
pub mod quanta_lending {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let platform_state = &mut ctx.accounts.platform_state;
        platform_state.total_lenders = 0;
        platform_state.total_borrowers = 0;
        Ok(())
    }

    // Lend tokens
    pub fn lend(ctx: Context<Lend>, amount: u64) -> Result<()> {
        let lender = &mut ctx.accounts.lender;
        lender.tokens_lent += amount;
        Ok(())
    }

    // Borrow tokens
    pub fn borrow(ctx: Context<Borrow>, amount: u64) -> Result<()> {
        let borrower = &mut ctx.accounts.borrower;
        borrower.tokens_borrowed += amount;
        Ok(())
    }

    // Repay tokens
    pub fn repay(ctx: Context<Repay>, amount: u64) -> Result<()> {
        let borrower = &mut ctx.accounts.borrower;
        borrower.tokens_borrowed -= amount;
        Ok(())
    }

}
    

