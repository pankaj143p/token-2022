import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Keypair } from '@solana/web3.js';
import { 
  TOKEN_2022_PROGRAM_ID,
  createInitializeMintInstruction,
  createMintToInstruction,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
  ExtensionType,
  createInitializeTransferHookInstruction,
  getMintLen,
} from '@solana/spl-token';
import toast from 'react-hot-toast';

const CreateToken: React.FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    decimals: 9,
    supply: 1000000,
    hookType: 'whitelist',
    description: '',
  });
  
  const [isCreating, setIsCreating] = useState(false);
  const [createdToken, setCreatedToken] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'decimals' || name === 'supply' ? parseInt(value) || 0 : value
    }));
  };

  const createTokenWithHook = async () => {
    if (!publicKey || !connection) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsCreating(true);
    
    try {
      // Generate a new mint keypair
      const mintKeypair = Keypair.generate();
      const mint = mintKeypair.publicKey;
      
      // Calculate space needed for mint account with transfer hook extension
      const extensions = [ExtensionType.TransferHook];
      const mintLen = getMintLen(extensions);
      
      // Get associated token account for the user
      const userTokenAccount = getAssociatedTokenAddressSync(
        mint,
        publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );
      
      // Create transaction instructions
      const instructions = [];
      
      // Create mint account
      instructions.push(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mint,
          space: mintLen,
          lamports: await connection.getMinimumBalanceForRentExemption(mintLen),
          programId: TOKEN_2022_PROGRAM_ID,
        })
      );
      
      // Initialize transfer hook (using a dummy hook program for demo)
      const hookProgramId = new PublicKey('HOOK2222222222222222222222222222222222222222');
      instructions.push(
        createInitializeTransferHookInstruction(
          mint,
          publicKey, // authority
          hookProgramId,
          TOKEN_2022_PROGRAM_ID
        )
      );
      
      // Initialize mint
      instructions.push(
        createInitializeMintInstruction(
          mint,
          formData.decimals,
          publicKey, // mint authority
          publicKey, // freeze authority
          TOKEN_2022_PROGRAM_ID
        )
      );
      
      // Create associated token account
      instructions.push(
        createAssociatedTokenAccountInstruction(
          publicKey, // payer
          userTokenAccount,
          publicKey, // owner
          mint,
          TOKEN_2022_PROGRAM_ID
        )
      );
      
      // Mint initial supply
      const mintAmount = formData.supply * Math.pow(10, formData.decimals);
      instructions.push(
        createMintToInstruction(
          mint,
          userTokenAccount,
          publicKey, // authority
          mintAmount,
          [],
          TOKEN_2022_PROGRAM_ID
        )
      );
      
      // Create and send transaction
      const { blockhash } = await connection.getLatestBlockhash();
      const transaction = new (await import('@solana/web3.js')).Transaction({
        recentBlockhash: blockhash,
        feePayer: publicKey,
      });
      
      transaction.add(...instructions);
      transaction.partialSign(mintKeypair);
      
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature);
      
      setCreatedToken(mint.toString());
      toast.success(`Token created successfully! Mint: ${mint.toString()}`);
      
    } catch (error) {
      console.error('Error creating token:', error);
      toast.error('Failed to create token. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Create Token-2022 with Transfer Hook
        </h1>
        
        {createdToken ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-green-800 mb-2">
              Token Created Successfully! 🎉
            </h2>
            <p className="text-green-700 mb-4">
              Your Token-2022 with transfer hook has been created.
            </p>
            <div className="bg-white rounded-lg p-4 border">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mint Address:
              </label>
              <code className="text-sm text-gray-900 break-all bg-gray-50 p-2 rounded block">
                {createdToken}
              </code>
            </div>
            <button
              onClick={() => {
                setCreatedToken(null);
                setFormData({
                  name: '',
                  symbol: '',
                  decimals: 9,
                  supply: 1000000,
                  hookType: 'whitelist',
                  description: '',
                });
              }}
              className="btn-primary mt-4"
            >
              Create Another Token
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); createTokenWithHook(); }}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., My RWA Token"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symbol *
                </label>
                <input
                  type="text"
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., RWA"
                  maxLength={10}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Decimals
                  </label>
                  <input
                    type="number"
                    name="decimals"
                    value={formData.decimals}
                    onChange={handleInputChange}
                    className="input-field"
                    min="0"
                    max="18"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Supply
                  </label>
                  <input
                    type="number"
                    name="supply"
                    value={formData.supply}
                    onChange={handleInputChange}
                    className="input-field"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transfer Hook Type
                </label>
                <select
                  name="hookType"
                  value={formData.hookType}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="whitelist">Whitelist Hook</option>
                  <option value="kyc">KYC Hook</option>
                  <option value="ratelimit">Rate Limit Hook</option>
                  <option value="compliance">Compliance Hook</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Choose the type of transfer restrictions for your token
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input-field"
                  rows={3}
                  placeholder="Describe your token and its use case..."
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">Transfer Hook Benefits:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Programmable transfer restrictions</li>
                  <li>• KYC/AML compliance support</li>
                  <li>• Whitelist management</li>
                  <li>• Rate limiting capabilities</li>
                  <li>• Perfect for tokenized real-world assets</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={isCreating || !publicKey}
                className="btn-primary w-full"
              >
                {isCreating ? 'Creating Token...' : 'Create Token with Hook'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateToken;
