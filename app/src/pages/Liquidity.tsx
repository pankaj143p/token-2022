import React from 'react';

const Liquidity: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Liquidity</h1>
        
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <div className="flex space-x-4">
              <button className="btn-primary">Add Liquidity</button>
              <button className="btn-secondary">Remove Liquidity</button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token A Amount
              </label>
              <input
                type="number"
                className="input-field"
                placeholder="0.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token B Amount
              </label>
              <input
                type="number"
                className="input-field"
                placeholder="0.0"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Pool Information</h3>
              <div className="space-y-1 text-sm text-blue-700">
                <div className="flex justify-between">
                  <span>Your Pool Share:</span>
                  <span>0%</span>
                </div>
                <div className="flex justify-between">
                  <span>Pool Fee:</span>
                  <span>0.3%</span>
                </div>
              </div>
            </div>

            <button className="btn-primary w-full" disabled>
              Connect Wallet to Add Liquidity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Liquidity;
