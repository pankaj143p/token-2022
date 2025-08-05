import { TokenAmm } from "./target/types/token_amm";
import { PublicKey } from "@solana/web3.js";

const programId = new PublicKey("2516vhAXsYH9co7EPrW1k2oMnHUq7yS6eHerftbVaqms");

console.log("✅ TokenAmm import successful!");
console.log("Program ID:", programId.toString());
