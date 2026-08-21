// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';

// Searchable pages/features in the app
const SEARCHABLE_ITEMS = [
  { name: 'Dashboard', description: 'View your portfolio balance, top holdings, and recent activity', path: '/Homepage', tags: ['home', 'portfolio', 'balance', 'dashboard'] },
  { name: 'Assets', description: 'Browse and manage all your crypto assets', path: '/Assets', tags: ['assets', 'crypto', 'tokens', 'coins', 'balance'] },
  { name: 'NFT Vault', description: 'View and manage your NFT collectibles', path: '/NFT', tags: ['nft', 'collectibles', 'vault', 'digital art'] },
  { name: 'Swap Tokens', description: 'Exchange one cryptocurrency for another', path: '/Swap', tags: ['swap', 'exchange', 'trade', 'convert'] },
  { name: 'Send Crypto', description: 'Transfer cryptocurrency to another wallet', path: '/Send', tags: ['send', 'transfer', 'payment'] },
  { name: 'Receive Crypto', description: 'Get your wallet address to receive funds', path: '/Receive', tags: ['receive', 'deposit', 'address', 'qr'] },
  { name: 'Transactions', description: 'View your full transaction history', path: '/Transactions', tags: ['transactions', 'history', 'transfers', 'activity'] },
  { name: 'Analytics', description: 'Portfolio analytics, P&L breakdown, and allocation', path: '/Analytics', tags: ['analytics', 'charts', 'profit', 'loss', 'performance'] },
  { name: 'Explore Vaults', description: 'Discover yield-generating DeFi vaults', path: '/ExploreVaults', tags: ['vaults', 'defi', 'yield', 'staking', 'earn'] },
  { name: 'Wallet', description: 'Manage your wallet keys and addresses', path: '/Wallet', tags: ['wallet', 'keys', 'address', 'manage'] },
  { name: 'Notifications', description: 'View alerts and system notifications', path: '/Notifications', tags: ['notifications', 'alerts', 'messages'] },
  { name: 'Settings', description: 'Configure app preferences and account settings', path: '/Settings', tags: ['settings', 'preferences', 'config', 'account'] },
  { name: 'Security', description: 'Manage security settings, 2FA, and privacy', path: '/Security', tags: ['security', '2fa', 'password', 'privacy', 'protection'] },
  // Crypto assets for quick search
  { name: 'Ethereum (ETH)', description: 'View Ethereum asset details and price', path: '/Assets', tags: ['ethereum', 'eth', 'ether'] },
  { name: 'Bitcoin (BTC)', description: 'View Bitcoin asset details and price', path: '/Assets', tags: ['bitcoin', 'btc'] },
  { name: 'Solana (SOL)', description: 'View Solana asset details and price', path: '/Assets', tags: ['solana', 'sol'] },
  { name: 'BNB', description: 'View BNB asset details and price', path: '/Assets', tags: ['bnb', 'binance'] },
  { name: 'Cardano (ADA)', description: 'View Cardano asset details and price', path: '/Assets', tags: ['cardano', 'ada'] },
  { name: 'Dogecoin (DOGE)', description: 'View Dogecoin asset details and price', path: '/Assets', tags: ['dogecoin', 'doge'] },
];

const Search: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const query = params.get('query') || '';

  const results = query.trim()
    ? SEARCHABLE_ITEMS.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.tags.some((tag) => tag.includes(q))
        );
      })
    : [];

  return (
    <PageLayout currentPage="">
      <div style={{ padding: '20px 10px' }}>
        <h2 style={{ color: '#e0e0ff', marginBottom: '6px', fontSize: '1.4rem' }}>
          Search Results for "<span style={{ color: '#a64dff' }}>{query}</span>"
        </h2>
        <p style={{ color: '#8c8ceb', fontSize: '0.85rem', marginBottom: '20px' }}>
          {results.length} result{results.length !== 1 ? 's' : ''} found
        </p>

        {results.length === 0 && query.trim() && (
          <div style={{
            padding: '30px',
            textAlign: 'center',
            background: 'rgba(20, 20, 40, 0.85)',
            borderRadius: '12px',
            boxShadow: '0 0 10px rgba(166, 77, 255, 0.3)',
          }}>
            <p style={{ color: '#b3b3cc', fontSize: '1rem' }}>
              No results found for "<strong style={{ color: '#e0e0ff' }}>{query}</strong>"
            </p>
            <p style={{ color: '#777799', fontSize: '0.85rem', marginTop: '8px' }}>
              Try searching for assets (ETH, BTC), pages (Swap, Send), or features (analytics, vault)
            </p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {results.map((item, idx) => (
            <div
              key={idx}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 18px',
                background: '#1a1a33',
                borderRadius: '12px',
                boxShadow: '0 0 8px rgba(166, 77, 255, 0.2)',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.015)';
                e.currentTarget.style.boxShadow = '0 0 14px rgba(166, 77, 255, 0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 0 8px rgba(166, 77, 255, 0.2)';
              }}
            >
              <div>
                <h3 style={{ color: '#ffffff', fontSize: '1rem', margin: '0 0 4px 0', fontWeight: 600 }}>
                  {item.name}
                </h3>
                <p style={{ color: '#a6a6d2', fontSize: '0.8rem', margin: 0 }}>
                  {item.description}
                </p>
              </div>
              <div style={{ color: '#a64dff', fontSize: '0.85rem', whiteSpace: 'nowrap', marginLeft: '16px' }}>
                Go →
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default Search;
