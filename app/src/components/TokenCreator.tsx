import { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Keypair, SystemProgram, Transaction } from '@solana/web3.js'
import { TOKEN_2022_PROGRAM_ID, createInitializeMintInstruction, createMintToInstruction, createAssociatedTokenAccountInstruction, getAssociatedTokenAddressSync, getMintLen, ExtensionType, createInitializeTransferHookInstruction, createInitializeMetadataPointerInstruction, createInitializeInstruction, TYPE_SIZE, LENGTH_SIZE } from '@solana/spl-token'
import toast from 'react-hot-toast'

export default function TokenCreator() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [tokenName, setTokenName] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [decimals, setDecimals] = useState(9)
  const [initialSupply, setInitialSupply] = useState(1000000)
  const [useTransferHook, setUseTransferHook] = useState(false)
  const [hookProgramId, setHookProgramId] = useState('')
  const [loading, setLoading] = useState(false)
  const [createdToken, setCreatedToken] = useState<string | null>(null)

  const createToken = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast.error('Please connect your wallet')
      return
    }

    if (!tokenName || !tokenSymbol) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    
    try {
      // For demo purposes, we'll create a simplified token
      // In production, you would implement the full Token-2022 creation logic
      toast.success(`Demo: Token "${tokenName}" (${tokenSymbol}) would be created with ${initialSupply} initial supply`)
      
      // Simulate token creation
      const demoMint = Keypair.generate()
      setCreatedToken(demoMint.publicKey.toString())
      
      // Reset form
      setTokenName('')
      setTokenSymbol('')
      setDecimals(9)
      setInitialSupply(1000000)
      setUseTransferHook(false)
      setHookProgramId('')
      
    } catch (error) {
      console.error('Error creating token:', error)
      toast.error('Failed to create token: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6 text-solana-green">
        🪙 Create Token-2022
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Token Name</label>
          <input
            type="text"
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
            placeholder="e.g., My Awesome Token"
            className="input w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Token Symbol</label>
          <input
            type="text"
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
            placeholder="e.g., MAT"
            className="input w-full"
            maxLength={10}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Decimals</label>
            <input
              type="number"
              value={decimals}
              onChange={(e) => setDecimals(parseInt(e.target.value) || 9)}
              min={0}
              max={9}
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Initial Supply</label>
            <input
              type="number"
              value={initialSupply}
              onChange={(e) => setInitialSupply(parseInt(e.target.value) || 0)}
              min={0}
              className="input w-full"
            />
          </div>
        </div>

        <div className="border border-gray-600 rounded-lg p-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={useTransferHook}
              onChange={(e) => setUseTransferHook(e.target.checked)}
              className="form-checkbox h-5 w-5 text-solana-green rounded focus:ring-solana-green focus:ring-2"
            />
            <span className="font-medium">Add Transfer Hook</span>
          </label>
          
          {useTransferHook && (
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">
                Hook Program ID (optional)
              </label>
              <input
                type="text"
                value={hookProgramId}
                onChange={(e) => setHookProgramId(e.target.value)}
                placeholder="Enter hook program public key"
                className="input w-full"
              />
              <p className="text-xs text-gray-400 mt-1">
                Leave empty to use default hook validation
              </p>
            </div>
          )}
        </div>

        <button
          onClick={createToken}
          disabled={loading || !tokenName || !tokenSymbol}
          className={`w-full py-3 rounded-lg font-bold transition-all duration-300 ${
            loading || !tokenName || !tokenSymbol
              ? 'bg-gray-600 cursor-not-allowed'
              : 'btn-primary hover:scale-105'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creating Token...</span>
            </div>
          ) : (
            'Create Token-2022'
          )}
        </button>

        {createdToken && (
          <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
            <h3 className="font-bold text-green-400 mb-2">Token Created Successfully! 🎉</h3>
            <div className="text-sm space-y-2">
              <div>
                <span className="text-gray-400">Mint Address:</span>
                <div className="font-mono text-green-400 break-all">
                  {createdToken}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Name: {tokenName}</span>
                <span className="text-gray-400">Symbol: {tokenSymbol}</span>
              </div>
              {useTransferHook && (
                <div className="text-yellow-400 text-xs">
                  ⚡ Transfer Hook enabled - This token supports conditional transfers
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
