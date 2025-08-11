import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token-2022";
import { assert } from "chai";

describe("Token-2022 AMM", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Token2022Amm as Program;
  const payer = provider.wallet as anchor.Wallet;

  let ammPubkey: PublicKey;
  let ammBump: number;

  before(async () => {
    // Get AMM PDA
    [ammPubkey, ammBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("amm")],
      program.programId
    );

    // Airdrop SOL to payer
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        payer.publicKey,
        2 * LAMPORTS_PER_SOL
      ),
      "confirmed"
    );
  });

  it("Initializes the AMM", async () => {
    const feeRate = 30; // 0.3%

    await program.methods
      .initializeAmm(new anchor.BN(feeRate))
      .accounts({
        amm: ammPubkey,
        authority: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const ammAccount = await program.account.amm.fetch(ammPubkey);
    assert.equal(ammAccount.authority.toString(), payer.publicKey.toString());
    assert.equal(ammAccount.feeRate.toNumber(), feeRate);
    assert.equal(ammAccount.bump, ammBump);
  });

  it("Creates a pool", async () => {
    // For this test, we'll create dummy mint addresses
    const tokenAMint = anchor.web3.Keypair.generate().publicKey;
    const tokenBMint = anchor.web3.Keypair.generate().publicKey;
    
    const [poolPubkey] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("pool"),
        ammPubkey.toBuffer(),
        tokenAMint.toBuffer(),
        tokenBMint.toBuffer(),
      ],
      program.programId
    );

    // Note: In a real test, you'd need to create actual Token-2022 mints
    // and associated token accounts. This is a simplified test structure.
    
    console.log("Pool PDA:", poolPubkey.toString());
    console.log("Token A Mint:", tokenAMint.toString());
    console.log("Token B Mint:", tokenBMint.toString());
  });

  it("Whitelists a transfer hook", async () => {
    const hookProgramId = anchor.web3.Keypair.generate().publicKey;
    
    const [hookWhitelistPubkey] = PublicKey.findProgramAddressSync(
      [Buffer.from("hook_whitelist"), ammPubkey.toBuffer()],
      program.programId
    );

    await program.methods
      .whitelistHook(hookProgramId)
      .accounts({
        amm: ammPubkey,
        hookWhitelist: hookWhitelistPubkey,
        authority: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const whitelistAccount = await program.account.hookWhitelist.fetch(hookWhitelistPubkey);
    assert.equal(whitelistAccount.whitelistedHooks.length, 1);
    assert.equal(
      whitelistAccount.whitelistedHooks[0].toString(),
      hookProgramId.toString()
    );
  });
});
