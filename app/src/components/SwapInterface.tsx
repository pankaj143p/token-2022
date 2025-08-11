import { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import toast from 'react-hot-toast'

export default function SwapInterface() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [tokenInMint, setTokenInMint] = useState('')
  const [tokenOutMint, setTokenOutMint] = useState('')
  const [amountIn, setAmountIn] = useState('')
  const [estimatedOut, setEstimatedOut] = useState<number>(0)
  const [slippage, setSlippage] = useState(0.5)
  const [loading, setLoading] = useState(false)

  const updateEstimate = async () => {
    if (!tokenInMint || !tokenOutMint || !amountIn) return
    
    const amountInNumber = parseFloat(amountIn)
    if (isNaN(amountInNumber)) return
    
    // Demo calculation - in real app, this would query the pool
    const estimated = amountInNumber * 0.997 // Simulated 0.3% fee
    setEstimatedOut(estimated)
  }

  const performSwap = async () => {
    if (!wallet.connected) {
      toast.error('Please connect your wallet')
      return
    }

    if (!tokenInMint || !tokenOutMint || !amountIn) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    
    try {
      // Demo swap simulation
      toast.success(`Demo: Swapping ${amountIn} tokens with ${slippage}% slippage tolerance`)
      
      // Reset form
      setAmountIn('')
      setEstimatedOut(0)
      
    } catch (error) {
      console.error('Error performing swap:', error)
      toast.error('Failed to perform swap: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6 text-yellow-500">
        🔄 Swap Tokens
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">From Token (Input)</label>
          <input
            type="text"
            value={tokenInMint}
            onChange={(e) => {
              setTokenInMint(e.target.value)
              updateEstimate()
            }}
            onBlur={updateEstimate}
            placeholder="Enter input token mint address"
            className="input w-full font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Amount In</label>
          <input
            type="number"
            value={amountIn}
            onChange={(e) => {
              setAmountIn(e.target.value)
              updateEstimate()
            }}
            onBlur={updateEstimate}
            min={0}
            step={0.001}
            className="input w-full"
          />
        </div>

        {/* Swap Direction Indicator */}
        <div className="flex justify-center">
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
            ⇅
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">To Token (Output)</label>
          <input
            type="text"
            value={tokenOutMint}
            onChange={(e) => {
              setTokenOutMint(e.target.value)
              updateEstimate()
            }}
            onBlur={updateEstimate}
            placeholder="Enter output token mint address"
            className="input w-full font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Estimated Output</label>
          <div className="input w-full bg-gray-800 text-gray-400">
            {estimatedOut > 0 ? estimatedOut.toFixed(6) : '0.000000'}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Slippage Tolerance ({slippage}%)
          </label>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={slippage}
            onChange={(e) => setSlippage(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0.1%</span>
            <span>5%</span>
          </div>
        </div>

        {estimatedOut > 0 && (
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Swap Details</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Rate:</span>
                <span>1 IN = {(estimatedOut / parseFloat(amountIn || '1')).toFixed(6)} OUT</span>
              </div>
              <div className="flex justify-between">
                <span>Minimum Received:</span>
                <span>{(estimatedOut * (1 - slippage / 100)).toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span>Price Impact:</span>
                <span className="text-green-400">&lt; 0.01%</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
          <h3 className="font-semibold text-orange-400 mb-2">⚡ Transfer Hook Notice</h3>
          <p className="text-sm text-gray-300">
            This swap may execute transfer hooks. Ensure both tokens are compatible and 
            any required conditions are met.
          </p>
        </div>

        <button
          onClick={performSwap}
          disabled={loading || !tokenInMint || !tokenOutMint || !amountIn}
          className={`w-full py-3 rounded-lg font-bold transition-all duration-300 ${
            loading || !tokenInMint || !tokenOutMint || !amountIn
              ? 'bg-gray-600 cursor-not-allowed'
              : 'btn-primary hover:scale-105'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Swapping...</span>
            </div>
          ) : (
            'Execute Swap'
          )}
        </button>
      </div>
    </div>
  )
}
