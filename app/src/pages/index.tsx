import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import toast from 'react-hot-toast'

// Components
import TokenCreator from '../components/TokenCreator'
import PoolCreator from '../components/PoolCreator'
import SwapInterface from '../components/SwapInterface'
import LiquidityProvider from '../components/LiquidityProvider'

export default function Home() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [activeTab, setActiveTab] = useState('create-token')

  const tabs = [
    { id: 'create-token', label: 'Create Token-2022', icon: '🪙' },
    { id: 'create-pool', label: 'Create Pool', icon: '🏊‍♀️' },
    { id: 'swap', label: 'Swap', icon: '🔄' },
    { id: 'liquidity', label: 'Add Liquidity', icon: '💧' },
  ]

  return (
    <>
      <Head>
        <title>Token-2022 AMM - DeFi for the Future</title>
        <meta name="description" content="Trade Token-2022 with Transfer Hooks on Solana" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        {/* Header */}
        <header className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">🚀</div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-solana-green to-solana-purple bg-clip-text text-transparent">
                    Token-2022 AMM
                  </h1>
                  <p className="text-sm text-gray-400">DeFi with Transfer Hooks</p>
                </div>
              </div>
              <WalletMultiButton className="btn-primary" />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!wallet.connected ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-8">👛</div>
              <h2 className="text-3xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-gray-400 mb-8">
                Connect your Solana wallet to start trading Token-2022 with Transfer Hooks
              </p>
              <WalletMultiButton className="btn-primary text-lg px-8 py-4" />
            </div>
          ) : (
            <>
              {/* Navigation Tabs */}
              <div className="mb-8">
                <nav className="flex space-x-1 bg-gray-800 rounded-lg p-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  {activeTab === 'create-token' && (
                    <TokenCreator />
                  )}
                  {activeTab === 'create-pool' && (
                    <PoolCreator />
                  )}
                  {activeTab === 'swap' && (
                    <SwapInterface />
                  )}
                  {activeTab === 'liquidity' && (
                    <LiquidityProvider />
                  )}
                </div>

                {/* Info Panel */}
                <div className="space-y-6">
                  <div className="card">
                    <h3 className="text-xl font-bold mb-4 text-solana-green">
                      🎯 About Token-2022 AMM
                    </h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-start space-x-2">
                        <span className="text-solana-green mt-1">•</span>
                        <span>First AMM to support Token-2022 with Transfer Hooks</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-solana-green mt-1">•</span>
                        <span>Enable KYC gating and conditional transfers</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-solana-green mt-1">•</span>
                        <span>Perfect for tokenizing real-world assets (RWA)</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-solana-green mt-1">•</span>
                        <span>Whitelisted hook programs for security</span>
                      </li>
                    </ul>
                  </div>

                  <div className="card">
                    <h3 className="text-xl font-bold mb-4 text-solana-purple">
                      🛠️ Features
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-700 rounded-lg">
                        <div className="text-2xl mb-2">🪙</div>
                        <div className="font-semibold">Token Creation</div>
                        <div className="text-sm text-gray-400">With Transfer Hooks</div>
                      </div>
                      <div className="text-center p-3 bg-gray-700 rounded-lg">
                        <div className="text-2xl mb-2">🏊‍♀️</div>
                        <div className="font-semibold">Pool Creation</div>
                        <div className="text-sm text-gray-400">SOL-Token Pairs</div>
                      </div>
                      <div className="text-center p-3 bg-gray-700 rounded-lg">
                        <div className="text-2xl mb-2">🔄</div>
                        <div className="font-semibold">Instant Swaps</div>
                        <div className="text-sm text-gray-400">Hook-Safe Trading</div>
                      </div>
                      <div className="text-center p-3 bg-gray-700 rounded-lg">
                        <div className="text-2xl mb-2">💧</div>
                        <div className="font-semibold">Liquidity</div>
                        <div className="text-sm text-gray-400">Earn Fees</div>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <h3 className="text-xl font-bold mb-4 text-yellow-500">
                      ⚠️ Important Notes
                    </h3>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li className="flex items-start space-x-2">
                        <span className="text-yellow-500 mt-1">•</span>
                        <span>This is a demo on Solana devnet</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-yellow-500 mt-1">•</span>
                        <span>Always verify hook programs before trading</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-yellow-500 mt-1">•</span>
                        <span>Transfer Hooks may affect transaction costs</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-20 border-t border-gray-700 bg-gray-800/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-gray-400">
              <p>Token-2022 AMM - Making Transfer Hooks tradable on Solana 🚀</p>
              <p className="text-sm mt-2">Built for the Solana ecosystem</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
