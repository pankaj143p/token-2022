// import * as anchor from "@coral-xyz/anchor";
// import { Program } from "@coral-xyz/anchor";
// import { TokenAmm } from "../target/types";
// import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
// import { 
//   TOKEN_PROGRAM_ID, 
//   createMint, 
//   getOrCreateAssociatedTokenAccount,
//   mintTo 
// } from "@solana/spl-token";
// import { expect } from "chai";

// describe("token-amm", () => {
//   const provider = anchor.AnchorProvider.env();
//   anchor.setProvider(provider);

//   const program = anchor.workspace.TokenAmm as Program<TokenAmm>;
//   const authority = provider.wallet as anchor.Wallet;

//   let tokenAMint: PublicKey;
//   let tokenBMint: PublicKey;
//   let poolPda: PublicKey;

//   before(async () => {
//     // Create test tokens
//     tokenAMint = await createMint(
//       provider.connection,
//       authority.payer,
//       authority.publicKey,
//       null,
//       6
//     );

//     tokenBMint = await createMint(
//       provider.connection,
//       authority.payer,
//       authority.publicKey,
//       null,
//       6
//     );

//     // Find pool PDA
//     [poolPda] = PublicKey.findProgramAddressSync(
//       [Buffer.from("pool"), tokenAMint.toBuffer(), tokenBMint.toBuffer()],
//       program.programId
//     );
//   });

//   it("Initialize pool", async () => {
//     const feeRate = new anchor.BN(300); // 3%
//     const hookWhitelist: PublicKey[] = [];

//     await program.methods
//       .initializePool(feeRate, hookWhitelist)
//       .accounts({
//         authority: authority.publicKey,
//         pool: poolPda,
//         tokenAMint,
//         tokenBMint,
//         systemProgram: SystemProgram.programId,
//         tokenProgram: TOKEN_PROGRAM_ID,
//       })
//       .rpc();

//     const poolAccount = await program.account.pool.fetch(poolPda);
//     expect(poolAccount.authority.toString()).to.equal(authority.publicKey.toString());
//     expect(poolAccount.feeRate.toNumber()).to.equal(300);
//     expect(poolAccount.isActive).to.be.true;
//   });

//   it("Add liquidity", async () => {
//     const amountA = new anchor.BN(1000000); // 1 token A
//     const amountB = new anchor.BN(2000000); // 2 token B

//     await program.methods
//       .addLiquidity(amountA, amountB)
//       .accounts({
//         authority: authority.publicKey,
//         pool: poolPda,
//         tokenProgram: TOKEN_PROGRAM_ID,
//       })
//       .rpc();

//     console.log("Liquidity added successfully");
//   });
// });