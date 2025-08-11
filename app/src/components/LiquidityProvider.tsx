import { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import toast from 'react-hot-toast'

export default function LiquidityProvider() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [tokenAMint, setTokenAMint] = useState('')
  const [tokenBMint, setTokenBMint] = useState('')
  const [tokenAAmount, setTokenAAmount] = useState(100)
  const [tokenBAmount, setTokenBAmount] = useState(100)
  const [minLpTokens, setMinLpTokens] = useState(90)
  const [loading, setLoading] = useState(false)

  const addLiquidity = async () => {
    if (!wallet.connected) {
      toast.error('Please connect your wallet')
      return
    }

    if (!tokenAMint || !tokenBMint) {
      toast.error('Please enter both token mint addresses')
      return
    }

    setLoading(true)
    
    try {
      // Demo liquidity addition simulation
      toast.success(`Demo: Added ${tokenAAmount} Token A and ${tokenBAmount} Token B to liquidity pool`)
      
      // Reset form
      setTokenAAmount(100)
      setTokenBAmount(100)
      setMinLpTokens(90)
      
    } catch (error) {
      console.error('Error adding liquidity:', error)
      toast.error('Failed to add liquidity: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6 text-blue-400">
        💧 Add Liquidity
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Token A Mint Address</label>
          <input
            type="text"
            value={tokenAMint}
            onChange={(e) => setTokenAMint(e.target.value)}
            placeholder="Enter Token A mint address"
            className="input w-full font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Token B Mint Address</label>
          <input
            type="text"
            value={tokenBMint}
            onChange={(e) => setTokenBMint(e.target.value)}
            placeholder="Enter Token B mint address"
            className="input w-full font-mono text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Token A Amount</label>
            <input
              type="number"
              value={tokenAAmount}
              onChange={(e) => setTokenAAmount(parseFloat(e.target.value) || 0)}
              min={0}
              step={0.001}
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Token B Amount</label>
            <input
              type="number"
              value={tokenBAmount}
              onChange={(e) => setTokenBAmount(parseFloat(e.target.value) || 0)}
              min={0}
              step={0.001}
              className="input w-full"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Minimum LP Tokens</label>
          <input
            type="number"
            value={minLpTokens}
            onChange={(e) => setMinLpTokens(parseFloat(e.target.value) || 0)}
            min={0}
            step={0.001}
            className="input w-full"
          />
        </div>

        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
          <h3 className="font-semibold text-green-400 mb-2">💰 Liquidity Provider Benefits</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Earn trading fees from all swaps in this pool</li>
            <li>• Receive LP tokens representing your pool share</li>
            <li>• Can remove liquidity anytime by burning LP tokens</li>
            <li>• Support the ecosystem by providing liquidity</li>
          </ul>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-400 mb-2">⚠️ Liquidity Risks</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Impermanent loss risk if token prices diverge</li>
            <li>• Transfer hooks may affect liquidity operations</li>
            <li>• Ensure you understand the token mechanics</li>
          </ul>
        </div>

        <button
          onClick={addLiquidity}
          disabled={loading || !tokenAMint || !tokenBMint}
          className={`w-full py-3 rounded-lg font-bold transition-all duration-300 ${
            loading || !tokenAMint || !tokenBMint
              ? 'bg-gray-600 cursor-not-allowed'
              : 'btn-primary hover:scale-105'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Adding Liquidity...</span>
            </div>
          ) : (
            'Add Liquidity'
          )}
        </button>
      </div>
    </div>
  )
}
