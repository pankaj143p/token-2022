import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TokenAmm } from "../target/types/token_amm";
import { 
  PublicKey,
  Keypair,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
} from "@solana/spl-token";
import { expect } from "chai";

describe("token-2022-amm", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.TokenAmm as Program<TokenAmm>;
  const provider = anchor.getProvider();
  
  let tokenAMint: PublicKey;
  let tokenBMint: PublicKey;
  let userTokenAAccount: PublicKey;
  let userTokenBAccount: PublicKey;
  let poolPda: PublicKey;
  let poolBump: number;
  
  const user = Keypair.generate();
  const authority = provider.publicKey;

  before(async () => {
    // Airdrop SOL to user for testing
    const signature = await provider.connection.requestAirdrop(
      user.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);

    // Create Token A (Token-2022)
    tokenAMint = await createMint(
      provider.connection,
      user, // payer
      authority, // mint authority
      authority, // freeze authority
      9, // decimals
      Keypair.generate(), // mint keypair
      undefined, // confirm options
      TOKEN_2022_PROGRAM_ID
    );

    // Create Token B (regular SPL token for testing)
    tokenBMint = await createMint(
      provider.connection,
      user, // payer
      authority, // mint authority
      authority, // freeze authority
      9 // decimals
    );

    // Create user token accounts
    userTokenAAccount = await createAccount(
      provider.connection,
      user,
      tokenAMint,
      user.publicKey,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );

    userTokenBAccount = await createAccount(
      provider.connection,
      user,
      tokenBMint,
      user.publicKey
    );

    // Mint initial tokens to user
    await mintTo(
      provider.connection,
      user,
      tokenAMint,
      userTokenAAccount,
      authority,
      1000000 * 10 ** 9, // 1M tokens
      [],
      undefined,
      TOKEN_2022_PROGRAM_ID
    );

    await mintTo(
      provider.connection,
      user,
      tokenBMint,
      userTokenBAccount,
      authority,
      1000000 * 10 ** 9 // 1M tokens
    );

    // Calculate pool PDA
    [poolPda, poolBump] = await PublicKey.findProgramAddress(
      [Buffer.from("pool"), tokenAMint.toBuffer(), tokenBMint.toBuffer()],
      program.programId
    );
  });

  it("Initializes a pool", async () => {
    const feeRate = 30; // 0.3%
    const hookWhitelist = []; // Empty for testing

    const tx = await program.methods
      .initializePool(new anchor.BN(feeRate), hookWhitelist)
      .accounts({
        authority: authority,
        pool: poolPda,
        tokenAMint: tokenAMint,
        tokenBMint: tokenBMint,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    console.log("Pool initialized. Transaction signature:", tx);

    // Verify pool state
    const poolAccount = await program.account.pool.fetch(poolPda);
    expect(poolAccount.authority.toString()).to.equal(authority.toString());
    expect(poolAccount.tokenAMint.toString()).to.equal(tokenAMint.toString());
    expect(poolAccount.tokenBMint.toString()).to.equal(tokenBMint.toString());
    expect(poolAccount.feeRate.toNumber()).to.equal(feeRate);
    expect(poolAccount.isActive).to.be.true;
  });

  it("Demonstrates hook validation concept", async () => {
    // This test demonstrates the concept of hook validation
    // In a real implementation, this would involve:
    // 1. Creating a transfer hook program
    // 2. Registering it with the token mint
    // 3. Validating hook execution during transfers

    console.log("Hook validation concept demonstrated");
    console.log("Token A (with hooks):", tokenAMint.toString());
    console.log("Token B (standard):", tokenBMint.toString());
    console.log("Pool address:", poolPda.toString());
  });
});
