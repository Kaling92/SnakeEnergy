// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageLayout from '../components/PageLayout';
import styles from '../assets/Homepage.module.css';
import { useWallet } from '../context/WalletContext';

const classes = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((name) => (styles as Record<string, string>)[name] ?? name)
    .join(' ');

import ethImg from '../assets/eth.jpg';
import snakeImg from '../assets/snake.jpg';
import btcImg from '../assets/btc.jpg';

const Homepage = () => {
  const navigate = useNavigate();
  const {
    assets,
    transactions,
    assetsLoading,
    refreshAssets,
    refreshDashboard,
    isAuthenticated
  } = useWallet();
  const fallbackAssets = [
    { id: 'eth-fb', name: 'ETHEREUM', symbol: 'ETH', balance: 12.42, fiatValue: 33534, trending: '+2.4%' },
    { id: 'btc-fb', name: 'BITCOIN', symbol: 'BTC', balance: 1.2, fiatValue: 78000, trending: '-1.2%' },
    { id: 'sol-fb', name: 'SOLANA', symbol: 'SOL', balance: 48, fiatValue: 6969.6, trending: '+5.8%' },
    { id: 'ada-fb', name: 'CARDANO', symbol: 'ADA', balance: 5200, fiatValue: 1976, trending: '+0.5%' },
    { id: 'bnb-fb', name: 'BINANCE', symbol: 'BNB', balance: 20, fiatValue: 11602, trending: '+1.1%' },
    { id: 'doge-fb', name: 'DOGECOIN', symbol: 'DOGE', balance: 5000, fiatValue: 600, trending: '-4.3%' }
  ];
  const fallbackTransactions = [
    { _id: 'tx-fb-1', blockchain: 'ethereum', toAddress: '0x9fd3a7601cdaf31f6f837f9a56a2ef3ad23a15b8', amount: 0.42, cryptoSymbol: 'ETH', status: 'confirmed' },
    { _id: 'tx-fb-2', blockchain: 'bitcoin', toAddress: 'bc1q8rqzw9v2zmlg2l7pt8fx4d8hct6m3uxm4q8d3p', amount: 0.03, cryptoSymbol: 'BTC', status: 'pending' },
    { _id: 'tx-fb-3', blockchain: 'solana', toAddress: '5fR6xPjWJ2m2f9sFy5n2xM8J2MVVxKR4wBf6oTPp5w1N', amount: 120, cryptoSymbol: 'SOL', status: 'confirmed' },
    { _id: 'tx-fb-4', blockchain: 'binance', toAddress: 'bnb1h52j2pqk6m8l7px7dwf3x2v8z5m7q7f8u6j8qj', amount: 2.5, cryptoSymbol: 'BNB', status: 'confirmed' },
    { _id: 'tx-fb-5', blockchain: 'cardano', toAddress: 'addr1qy8l2j3m8y0h8a6c8n3v9l0t4gk2r5s8z6j4v3w1m2', amount: 800, cryptoSymbol: 'ADA', status: 'pending' },
    { _id: 'tx-fb-6', blockchain: 'dogecoin', toAddress: 'D7Y55gk4Jftu1x2wk2GpvHSGv8dJxNhnCk', amount: 1500, cryptoSymbol: 'DOGE', status: 'confirmed' }
  ];
  
  // State definitions to hold live server data
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        if (!isAuthenticated()) {
          navigate('/Login');
          return;
        }
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/wallet/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data?.success) {
          setDashboardData(res.data);
        }
      } catch (err: any) {
        console.error(err);
        setError("Session expired or backend endpoint is unavailable. Please login again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate, isAuthenticated]);

  if (loading) return <div style={{ color: '#fff', padding: '50px', textAlign: 'center' }}>Synchronizing Secure Vault Data...</div>;

  const totalBalanceValue = dashboardData?.totalBalance || 0;
  const portfolioTotal = totalBalanceValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const rawAssets = (dashboardData?.assets || []).map((item: any) => ({
    id: item.id || item._id || item.tokenSymbol || item.symbol,
    name: item.name || item.tokenSymbol || item.symbol,
    symbol: (item.symbol || item.short || item.tokenSymbol || '').toUpperCase(),
    balance: parseFloat(item.balance ?? 0),
    fiatValue: parseFloat(item.fiatValue ?? item.value ?? 0),
    trending: item.trending || '+0.0%'
  }));

  const liveAssets = [...rawAssets, ...fallbackAssets]
    .filter((item, index, arr) => arr.findIndex((x) => x.symbol === item.symbol) === index)
    .slice(0, 6);

  const rawTx = (dashboardData?.transactions || []).map((tx: any, idx: number) => ({
    _id: tx._id || tx.txHash || `tx-${idx}`,
    blockchain: tx.blockchain || tx.network || 'ethereum',
    toAddress: tx.toAddress || tx.receiverAddress || '0x0000000000000000000000000000000000000000',
    amount: (typeof tx.amount === 'object' && tx.amount !== null && tx.amount.$numberDecimal) ? parseFloat(tx.amount.$numberDecimal) : parseFloat(tx.amount || 0),
    cryptoSymbol: tx.cryptoSymbol || tx.tokenSymbol || 'ETH',
    status: String(tx.status || 'pending').toLowerCase()
  }));

  const liveTransactions = [...rawTx, ...fallbackTransactions]
    .filter((item, index, arr) => arr.findIndex((x) => x._id === item._id) === index)
    .slice(0, 6);

  const marketData = dashboardData?.marketData || null;

  // Map asset symbols to local image icons
  const getAssetImg = (symbol: string) => {
    if (symbol === 'ETH' || symbol === 'ethereum') return ethImg;
    if (symbol === 'BTC' || symbol === 'bitcoin') return btcImg;
    return snakeImg;
  };

  return (
    <PageLayout currentPage="menuDashboard">
      {error && (
        <div style={{
          margin: '16px 0',
          padding: '12px 16px',
          border: '1px solid rgba(255, 84, 84, 0.45)',
          background: 'rgba(255, 84, 84, 0.08)',
          color: '#ff6f6f',
          borderRadius: 10,
          fontSize: 14
        }}>
          {error}
        </div>
      )}
      <div className={classes("totalBalanceBox")}>
        <p>TOTAL PORTFOLIO BALANCE</p>
        <div id="totalBalance">${portfolioTotal}</div>
        <div className={classes("calculate")}>
          <div className={classes("calculateEarn")}>
            <div className={classes("profit")}>
              <p>PROFIT (24H)</p>
              <p id="profit">- $14,204</p>
            </div>
            <div className={classes("growth")}>
              <p>WEEKLY GROWTH</p>
              <p id="growth">+ $31,890</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className={classes("righMarket")}>
        <div className={classes("rightPrice")}>
          <div className={classes("rightPriceTopHolding")}>
            <p>Top Holdings</p>
            <p className={classes("allAssetsLink")} style={{ cursor: 'pointer' }} onClick={() => navigate('/Assets')}>View All Assets</p>
          </div>
          
          <div className={classes("assets")}>
            {liveAssets.map((asset: any) => (
              <div key={asset.id} className={classes("assetsBox")}>
                <div className={classes("assetsName")}>
                  <div className={classes("logo")}>
                    <img src={getAssetImg(asset.symbol)} alt={asset.symbol} />
                    <div className={classes("assetInfo")}>
                      <h1>{asset.name}</h1>
                      <p>{asset.symbol}</p>
                    </div>
                  </div>
                </div>
                <div className={classes("currentPrice")}>
                  <h1>{asset.balance.toLocaleString()} {asset.symbol}</h1>
                  <p>${asset.fiatValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                </div>
                <div className={classes("trending")}>
                  <h1 style={{ color: asset.trending.startsWith('+') ? '#00ffcc' : '#ff4a4a' }}>{asset.trending}</h1>
                  <p>24H</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={classes("rightPriceActivity")}>
          <div className={classes("rightPriceActivityTitle")}>
            <p>Activity</p>
            <i className={classes("fa-solid fa-filter")} />
          </div>
          
          <div className={classes("activity")}>
            {liveTransactions.length === 0 ? (
              <p style={{ color: '#aaa', padding: '15px' }}>No historic transfers logged yet.</p>
            ) : (
              liveTransactions.map((tx: any) => (
                <div key={tx._id} className={classes("activityBox")}>
                  <div className={classes("acitivityName")}>
                    <h1>Transfer {tx.blockchain.toUpperCase()}</h1>
                    <p>To: {tx.toAddress.slice(0, 6)}...{tx.toAddress.slice(-4)}</p>
                    <p className={classes(tx.status)}>{tx.status.toUpperCase()}</p>
                  </div>
                  <div className={classes("activityAmount")}>
                    <p>{tx.amount} {tx.cryptoSymbol}</p>
                  </div>
                </div>
              ))
            )}
            <button id="viewHistory" onClick={() => navigate('/Transactions')}>VIEW HISTORY</button>
          </div>
        </div>

        {/* Static Pricing Table remains clean placeholder context */}
        <div className={classes("rightMarketList")}>
          <div className={classes("rightPriceTopHolding")}>
            <p>Market Prices</p>
          </div>
          <div className={classes("marketTable")} id="marketTable">
            <div className={classes("marketHeader")}>
              <span>Name</span>
              <span>Price</span>
              <span>24H</span>
              <span>Market Cap</span>
            </div>
            {marketData && Array.isArray(marketData) ? (
              marketData.map((coin: any) => (
                <div className={classes("marketRow")} key={coin?.id || Math.random()}>
                  <div className={classes("marketName")}>
                    <img src={coin?.image || getAssetImg(coin?.symbol)} alt={coin?.symbol} style={{ width: 24, height: 24, borderRadius: '50%', marginRight: 10 }} />
                    <strong>{String(coin?.name || '').toUpperCase()}</strong>
                  </div>
                  <span>${Number(coin?.current_price || 0).toLocaleString()}</span>
                  <span style={{ color: Number(coin?.price_change_percentage_24h || 0) >= 0 ? '#00ffcc' : '#ff4a4a' }}>
                    {Number(coin?.price_change_percentage_24h || 0) >= 0 ? '+' : ''}{Number(coin?.price_change_percentage_24h || 0).toFixed(2)}%
                  </span>
                  <span>${(Number(coin?.market_cap || 0) / 1000000000).toFixed(2)}B</span>
                </div>
              ))
            ) : (
              <div className={classes("marketRow marketPlaceholder")}>
                <div className={classes("marketName")}><strong>Loading market data...</strong></div>
                <span /><span /><span />
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Homepage;