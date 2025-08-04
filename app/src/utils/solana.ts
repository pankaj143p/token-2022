import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { AnchorProvider, Program, Idl } from '@project-serum/anchor';

export const PROGRAM_ID = new PublicKey('AMM22222222222222222222222222222222222222222');
export const HOOK_PROGRAM_ID = new PublicKey('HOOK2222222222222222222222222222222222222222');

export const getConnection = () => {
  return new Connection(clusterApiUrl('devnet'));
};

export const getProvider = (wallet: any) => {
  const connection = getConnection();
  return new AnchorProvider(connection, wallet, {});
};

export const getProgram = (provider: AnchorProvider) => {
  // This would typically load the IDL from a file
  // For demo purposes, we'll use a minimal interface
  const idl = {
    version: "0.1.0",
    name: "token_2022_amm",
    instructions: [],
    accounts: [],
    errors: []
  } as Idl;
  
  return new Program(idl, PROGRAM_ID, provider);
};

export const formatTokenAmount = (amount: number, decimals: number = 9): string => {
  return (amount / Math.pow(10, decimals)).toFixed(6);
};

export const parseTokenAmount = (amount: string, decimals: number = 9): number => {
  return parseFloat(amount) * Math.pow(10, decimals);
};
