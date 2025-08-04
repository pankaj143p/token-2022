import React from 'react';

const Trade: React.FC = () => {
  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Swap Tokens</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From
            </label>
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <input
                  type="number"
                  className="text-2xl font-semibold bg-transparent border-none outline-none w-full"
                  placeholder="0.0"
                />
                <button className="btn-secondary">Select Token</button>
              </div>
              <div className="text-sm text-gray-500">Balance: 0.00</div>
            </div>
          </div>

          <div className="flex justify-center">
            <button className="p-2 rounded-full border border-gray-300 hover:border-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To
            </label>
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <input
                  type="number"
                  className="text-2xl font-semibold bg-transparent border-none outline-none w-full"
                  placeholder="0.0"
                  disabled
                />
                <button className="btn-secondary">Select Token</button>
              </div>
              <div className="text-sm text-gray-500">Balance: 0.00</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Exchange Rate</span>
              <span>1 TOKEN = 0.5 SOL</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Price Impact</span>
              <span className="text-green-600">{"<0.01%"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Fee</span>
              <span>0.3%</span>
            </div>
          </div>

          <button className="btn-primary w-full" disabled>
            Connect Wallet
          </button>
        </div>
      </div>
    </div>
  );
};

export default Trade;
