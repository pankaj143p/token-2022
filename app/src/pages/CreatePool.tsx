import React, { useState } from 'react';

const CreatePool: React.FC = () => {
  const [formData, setFormData] = useState({
    tokenA: '',
    tokenB: '',
    feeRate: 30, // 0.3%
    initialTokenA: 0,
    initialTokenB: 0,
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Create Liquidity Pool
        </h1>
        <p className="text-gray-600 mb-8">
          Create a new AMM pool for trading Token-2022 tokens with transfer hooks.
        </p>
        
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token A Mint Address *
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter Token-2022 mint address"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token B Mint Address *
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter second token mint address"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fee Rate (Basis Points)
            </label>
            <select className="input-field">
              <option value="30">30 (0.3%)</option>
              <option value="100">100 (1.0%)</option>
              <option value="300">300 (3.0%)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Initial Token A Amount
              </label>
              <input
                type="number"
                className="input-field"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Initial Token B Amount
              </label>
              <input
                type="number"
                className="input-field"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full">
            Create Pool
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePool;
