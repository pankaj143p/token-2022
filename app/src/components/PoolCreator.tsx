import { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js'
import { TOKEN_2022_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddressSync } from '@solana/spl-token'
import toast from 'react-hot-toast'

export default function PoolCreator() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [tokenAMint, setTokenAMint] = useState('')
  const [tokenBMint, setTokenBMint] = useState('')
  const [tokenAAmount, setTokenAAmount] = useState(1000)
  const [tokenBAmount, setTokenBAmount] = useState(1000)
  const [loading, setLoading] = useState(false)

  const createPool = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast.error('Please connect your wallet')
      return
    }

    if (!tokenAMint || !tokenBMint) {
      toast.error('Please enter both token mint addresses')
      return
    }

    setLoading(true)
    
    try {
      const tokenA = new PublicKey(tokenAMint)
      const tokenB = new PublicKey(tokenBMint)
      
      // For demo purposes, we'll create associated token accounts
      // In a real AMM, this would create the actual pool
      const transaction = new Transaction()
      
      // Create associated token accounts for both tokens if they don't exist
      const userTokenAAccount = getAssociatedTokenAddressSync(
        tokenA,
        wallet.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      )
      
      const userTokenBAccount = getAssociatedTokenAddressSync(
        tokenB,
        wallet.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      )

      // Add instructions to create accounts (this would be handled by the AMM in reality)
      transaction.add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          userTokenAAccount,
          wallet.publicKey,
          tokenA,
          TOKEN_2022_PROGRAM_ID
        )
      )

      transaction.add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          userTokenBAccount,
          wallet.publicKey,
          tokenB,
          TOKEN_2022_PROGRAM_ID
        )
      )

      // Set recent blockhash and fee payer
      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = wallet.publicKey

      // Sign and send transaction
      const signedTransaction = await wallet.signTransaction(transaction)
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize()
      )
      
      await connection.confirmTransaction(signature, 'confirmed')

      toast.success(`Pool preparation completed! (Demo) - Signature: ${signature.slice(0, 8)}...`)
      
      // Reset form
      setTokenAMint('')
      setTokenBMint('')
      setTokenAAmount(1000)
      setTokenBAmount(1000)
      
    } catch (error) {
      console.error('Error creating pool:', error)
      toast.error('Failed to create pool: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <span className="mr-3">🏊‍♀️</span>
        Create Liquidity Pool
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Token A Mint Address</label>
          <input
            type="text"
            value={tokenAMint}
            onChange={(e) => setTokenAMint(e.target.value)}
            placeholder="Enter Token A mint address"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Token B Mint Address</label>
          <input
            type="text"
            value={tokenBMint}
            onChange={(e) => setTokenBMint(e.target.value)}
            placeholder="Enter Token B mint address (or use SOL)"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Token A Amount</label>
            <input
              type="number"
              value={tokenAAmount}
              onChange={(e) => setTokenAAmount(parseFloat(e.target.value) || 0)}
              min={0}
              step={0.001}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Token B Amount</label>
            <input
              type="number"
              value={tokenBAmount}
              onChange={(e) => setTokenBAmount(parseFloat(e.target.value) || 0)}
              min={0}
              step={0.001}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-300 mb-2">💡 Pool Creation Tips</h3>
          <ul className="text-sm text-blue-200 space-y-1">
            <li>• Choose appropriate initial ratios for fair pricing</li>
            <li>• Higher initial liquidity provides better price stability</li>
            <li>• You'll receive LP tokens representing your pool share</li>
            <li>• This demo creates associated token accounts for preparation</li>
          </ul>
        </div>

        <button
          onClick={createPool}
          disabled={loading || !tokenAMint || !tokenBMint || !wallet.connected}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Preparing Pool...
            </div>
          ) : (
            '🚀 Prepare Liquidity Pool (Demo)'
          )}
        </button>
      </div>
    </div>
  )
}
