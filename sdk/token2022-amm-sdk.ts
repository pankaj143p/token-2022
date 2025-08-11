import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, web3 } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { 
  TOKEN_2022_PROGRAM_ID,
  createInitializeMintInstruction,
  createMintToInstruction,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
  ExtensionType,
  getMintLen,
  createTransferHookInstruction,
  transferCheckedWithTransferHook,
} from "@solana/spl-token-2022";
import { TokenAmm } from "../target/types/token_2022_amm";

export class Token2022AmmSDK {
  private program: Program<TokenAmm>;
  private provider: AnchorProvider;

  constructor(provider: AnchorProvider, programId: PublicKey) {
    this.provider = provider;
    this.program = new Program(
      require("../target/idl/token_2022_amm.json"),
      programId,
      provider
    );
  }

  // Helper methods
  async getAmmPDA(): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("amm")],
      this.program.programId
    );
  }

  async getPoolPDA(
    ammPubkey: PublicKey,
    tokenAMint: PublicKey,
    tokenBMint: PublicKey
  ): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("pool"),
        ammPubkey.toBuffer(),
        tokenAMint.toBuffer(),
        tokenBMint.toBuffer(),
      ],
      this.program.programId
    );
  }

  async getHookWhitelistPDA(ammPubkey: PublicKey): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("hook_whitelist"), ammPubkey.toBuffer()],
      this.program.programId
    );
  }

  // Core AMM functions
  async initializeAmm(feeRate: number): Promise<string> {
    const [ammPubkey] = await this.getAmmPDA();
    
    const tx = await this.program.methods
      .initializeAmm(new anchor.BN(feeRate))
      .accounts({
        amm: ammPubkey,
        authority: this.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  async createToken2022WithHook(
    mintAuthority: PublicKey,
    decimals: number,
    hookProgramId?: PublicKey
  ): Promise<{ mint: PublicKey; tx: string }> {
    const mint = web3.Keypair.generate();
    
    const extensions = hookProgramId 
      ? [ExtensionType.TransferHook] 
      : [];
    
    const mintLen = getMintLen(extensions);
    const lamports = await this.provider.connection.getMinimumBalanceForRentExemption(mintLen);

    const transaction = new web3.Transaction();

    // Create mint account
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: this.provider.wallet.publicKey,
        newAccountPubkey: mint.publicKey,
        space: mintLen,
        lamports,
        programId: TOKEN_2022_PROGRAM_ID,
      })
    );

    // Add transfer hook extension if provided
    if (hookProgramId) {
      const [extraAccountMetaListPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("extra-account-metas"), mint.publicKey.toBuffer()],
        hookProgramId
      );
      
      transaction.add(
        createTransferHookInstruction(
          mint.publicKey,
          mintAuthority,
          hookProgramId,
          extraAccountMetaListPDA,
          TOKEN_2022_PROGRAM_ID
        )
      );
    }

    // Initialize mint
    transaction.add(
      createInitializeMintInstruction(
        mint.publicKey,
        decimals,
        mintAuthority,
        null,
        TOKEN_2022_PROGRAM_ID
      )
    );

    const tx = await this.provider.sendAndConfirm(transaction, [mint]);
    
    return { mint: mint.publicKey, tx };
  }

  async mintTokens(
    mint: PublicKey,
    destination: PublicKey,
    amount: number,
    mintAuthority: web3.Keypair
  ): Promise<string> {
    const transaction = new web3.Transaction().add(
      createMintToInstruction(
        mint,
        destination,
        mintAuthority.publicKey,
        amount,
        [],
        TOKEN_2022_PROGRAM_ID
      )
    );

    const tx = await this.provider.sendAndConfirm(transaction, [mintAuthority]);
    return tx;
  }

  async createPool(
    tokenAMint: PublicKey,
    tokenBMint: PublicKey,
    initialTokenAAmount: number,
    initialTokenBAmount: number
  ): Promise<string> {
    const [ammPubkey] = await this.getAmmPDA();
    const [poolPubkey] = await this.getPoolPDA(ammPubkey, tokenAMint, tokenBMint);
    
    // Create associated token accounts
    const userTokenA = getAssociatedTokenAddressSync(
      tokenAMint,
      this.provider.wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );
    
    const userTokenB = getAssociatedTokenAddressSync(
      tokenBMint,
      this.provider.wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    const tokenAVault = getAssociatedTokenAddressSync(
      tokenAMint,
      poolPubkey,
      true,
      TOKEN_2022_PROGRAM_ID
    );
    
    const tokenBVault = getAssociatedTokenAddressSync(
      tokenBMint,
      poolPubkey,
      true,
      TOKEN_2022_PROGRAM_ID
    );

    // LP mint will be generated
    const lpMint = web3.Keypair.generate();
    const userLpTokens = getAssociatedTokenAddressSync(
      lpMint.publicKey,
      this.provider.wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    const tx = await this.program.methods
      .createPool(
        new anchor.BN(initialTokenAAmount),
        new anchor.BN(initialTokenBAmount)
      )
      .accounts({
        amm: ammPubkey,
        pool: poolPubkey,
        tokenAMint,
        tokenBMint,
        tokenAVault,
        tokenBVault,
        lpMint: lpMint.publicKey,
        userTokenA,
        userTokenB,
        userLpTokens,
        user: this.provider.wallet.publicKey,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([lpMint])
      .rpc();

    return tx;
  }

  async swap(
    tokenInMint: PublicKey,
    tokenOutMint: PublicKey,
    amountIn: number,
    minimumAmountOut: number
  ): Promise<string> {
    const [ammPubkey] = await this.getAmmPDA();
    
    // Determine which is token A and token B based on the pool
    const [tokenAMint, tokenBMint] = [tokenInMint, tokenOutMint]; // Simplified for demo
    const [poolPubkey] = await this.getPoolPDA(ammPubkey, tokenAMint, tokenBMint);
    
    const userTokenIn = getAssociatedTokenAddressSync(
      tokenInMint,
      this.provider.wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );
    
    const userTokenOut = getAssociatedTokenAddressSync(
      tokenOutMint,
      this.provider.wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    const tokenAVault = getAssociatedTokenAddressSync(
      tokenAMint,
      poolPubkey,
      true,
      TOKEN_2022_PROGRAM_ID
    );
    
    const tokenBVault = getAssociatedTokenAddressSync(
      tokenBMint,
      poolPubkey,
      true,
      TOKEN_2022_PROGRAM_ID
    );

    const tx = await this.program.methods
      .swapWithHooks(
        new anchor.BN(amountIn),
        new anchor.BN(minimumAmountOut)
      )
      .accounts({
        amm: ammPubkey,
        pool: poolPubkey,
        tokenAMint,
        tokenBMint,
        tokenInMint,
        tokenOutMint,
        tokenAVault,
        tokenBVault,
        userTokenIn,
        userTokenOut,
        user: this.provider.wallet.publicKey,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .rpc();

    return tx;
  }

  async addLiquidity(
    tokenAMint: PublicKey,
    tokenBMint: PublicKey,
    tokenAAmount: number,
    tokenBAmount: number,
    minLpTokens: number
  ): Promise<string> {
    const [ammPubkey] = await this.getAmmPDA();
    const [poolPubkey] = await this.getPoolPDA(ammPubkey, tokenAMint, tokenBMint);
    
    const userTokenA = getAssociatedTokenAddressSync(
      tokenAMint,
      this.provider.wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );
    
    const userTokenB = getAssociatedTokenAddressSync(
      tokenBMint,
      this.provider.wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    const tokenAVault = getAssociatedTokenAddressSync(
      tokenAMint,
      poolPubkey,
      true,
      TOKEN_2022_PROGRAM_ID
    );
    
    const tokenBVault = getAssociatedTokenAddressSync(
      tokenBMint,
      poolPubkey,
      true,
      TOKEN_2022_PROGRAM_ID
    );

    // Get LP mint from pool state
    const poolAccount = await this.program.account.pool.fetch(poolPubkey);
    const lpMint = poolAccount.lpMint;
    
    const userLpTokens = getAssociatedTokenAddressSync(
      lpMint,
      this.provider.wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    const tx = await this.program.methods
      .addLiquidity(
        new anchor.BN(tokenAAmount),
        new anchor.BN(tokenBAmount),
        new anchor.BN(minLpTokens)
      )
      .accounts({
        amm: ammPubkey,
        pool: poolPubkey,
        tokenAMint,
        tokenBMint,
        tokenAVault,
        tokenBVault,
        lpMint,
        userTokenA,
        userTokenB,
        userLpTokens,
        user: this.provider.wallet.publicKey,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .rpc();

    return tx;
  }

  async whitelistHook(hookProgramId: PublicKey): Promise<string> {
    const [ammPubkey] = await this.getAmmPDA();
    const [hookWhitelistPubkey] = await this.getHookWhitelistPDA(ammPubkey);
    
    const tx = await this.program.methods
      .whitelistHook(hookProgramId)
      .accounts({
        amm: ammPubkey,
        hookWhitelist: hookWhitelistPubkey,
        authority: this.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  // Helper methods for getting account data
  async getAmmData(): Promise<any> {
    const [ammPubkey] = await this.getAmmPDA();
    return this.program.account.amm.fetch(ammPubkey);
  }

  async getPoolData(tokenAMint: PublicKey, tokenBMint: PublicKey): Promise<any> {
    const [ammPubkey] = await this.getAmmPDA();
    const [poolPubkey] = await this.getPoolPDA(ammPubkey, tokenAMint, tokenBMint);
    return this.program.account.pool.fetch(poolPubkey);
  }

  async getHookWhitelist(): Promise<any> {
    const [ammPubkey] = await this.getAmmPDA();
    const [hookWhitelistPubkey] = await this.getHookWhitelistPDA(ammPubkey);
    try {
      return this.program.account.hookWhitelist.fetch(hookWhitelistPubkey);
    } catch (error) {
      return { whitelistedHooks: [] }; // Return empty if not initialized
    }
  }

  // Utility methods
  calculateSwapOutput(
    amountIn: number,
    reserveIn: number,
    reserveOut: number,
    feeRate: number
  ): number {
    const amountInWithFee = amountIn * (10000 - feeRate) / 10000;
    return (reserveOut * amountInWithFee) / (reserveIn + amountInWithFee);
  }

  async createAssociatedTokenAccount(
    mint: PublicKey,
    owner: PublicKey
  ): Promise<string> {
    const associatedToken = getAssociatedTokenAddressSync(
      mint,
      owner,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    const transaction = new web3.Transaction().add(
      createAssociatedTokenAccountInstruction(
        this.provider.wallet.publicKey,
        associatedToken,
        owner,
        mint,
        TOKEN_2022_PROGRAM_ID
      )
    );

    return this.provider.sendAndConfirm(transaction);
  }
}


