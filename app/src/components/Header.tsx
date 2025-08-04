import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Header: React.FC = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Create Token', href: '/create-token' },
    { name: 'Create Pool', href: '/create-pool' },
    { name: 'Trade', href: '/trade' },
    { name: 'Liquidity', href: '/liquidity' },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary-600">
                Token-2022 AMM
              </h1>
            </div>
            
            <nav className="hidden md:block">
              <div className="flex space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      px-3 py-2 text-sm font-medium rounded-md transition-colors
                      ${location.pathname === item.href
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                      }
                    `}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </nav>
          </div>

          <div className="flex items-center">
            <WalletMultiButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
