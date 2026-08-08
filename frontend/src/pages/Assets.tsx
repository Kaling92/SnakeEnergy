// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageLayout from '../components/PageLayout';
import styles from '../assets/Asset.module.css'; // Combined and fixed duplicate import bug

const classes = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((name) => (styles as Record<string, string>)[name] ?? name)
    .join(' ');

const Assets = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fallbackData = {
    portfolioOverview: 132245.6,
    assets: [
      { id: 'eth-fb', name: 'Ethereum', short: 'ETH', icon: 'fa-brands fa-ethereum', price: 2650.0, balance: 12.5, value: 33125, change24h: 2.4 },
      { id: 'btc-fb', name: 'Bitcoin', short: 'BTC', icon: 'fa-solid fa-bitcoin-sign', price: 64200.5, balance: 1.2, value: 77040.6, change24h: -1.2 },
      { id: 'sol-fb', name: 'Solana', short: 'SOL', icon: 'fa-brands fa-hive', price: 145.2, balance: 48, value: 6969.6, change24h: 5.8 },
      { id: 'bnb-fb', name: 'BNB', short: 'BNB', icon: 'fa-solid fa-cube', price: 580.1, balance: 20, value: 11602, change24h: 1.1 },
      { id: 'doge-fb', name: 'Dogecoin', short: 'DOGE', icon: 'fa-brands fa-dog', price: 0.12, balance: 5000, value: 600, change24h: -4.3 },
      { id: 'ada-fb', name: 'Cardano', short: 'ADA', icon: 'fa-solid fa-coins', price: 0.38, balance: 5200, value: 1976, change24h: 0.5 }
    ],
    distribution: [
      { label: 'Top 1', percent: '58.2%' },
      { label: 'Top 2', percent: '25.4%' },
      { label: 'Top 3', percent: '10.1%' },
      { label: 'Others', percent: '6.3%' }
    ]
  };

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/Login');
          return;
        }

        const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/wallet/assets`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Error pulling active asset matrices:", err);
        setError('Asset API unavailable. Showing fallback market data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [navigate]);

  if (loading) return <div style={{ color: '#fff', padding: '50px', textAlign: 'center' }}>Updating Crypto Assets...</div>;

  const activeData = data?.assets?.length ? data : fallbackData;
  const totalOverview = activeData?.portfolioOverview?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00';
  const trackedAssets = activeData?.assets || [];
  const allocationDistribution = activeData?.distribution || [];

  return (
    <PageLayout currentPage="menuAssets">
      <div className={classes("rightPanel")}>
        {error && (
          <div style={{
            marginBottom: 12,
            padding: '10px 12px',
            border: '1px solid rgba(255, 184, 77, 0.45)',
            background: 'rgba(255, 184, 77, 0.08)',
            color: '#ffd08a',
            borderRadius: 10,
            fontSize: 13
          }}>
            {error}
          </div>
        )}
        <div className={classes("portfolioOverview")}>
          <p>PORTFOLIO OVERVIEW</p>
          <p className={classes("portfolioValue")}>${totalOverview}</p>
          <div className={classes("trend")}>
            <div className={classes("increase")}>
              <i className={classes("fa-solid fa-arrow-trend-up")} />
              <p className={classes("increaseAmount")}>+12.4%</p>
              <p>(24H)</p>
            </div>
            <div className={classes("reward")}>
              <i className={classes("fa-solid fa-leaf")} />
              <p className={classes("rewardAmount")}>842</p>
              <p className={classes("typeCurrency")}>SNK</p>
              <p>Rewards</p>
            </div>
          </div>
        </div>

        <div className={classes("filterSort")}>
          <div className={classes("filter")}>
            <i className={classes("fa-solid fa-filter-circle-dollar")} />
            <span>Filter</span>
          </div>
          <div className={classes("sort")}>
            <i className={classes("fa-solid fa-sort")} />
            <span>Sort</span>
          </div>
        </div>

        <div className={classes("assetTable")}>
          <div className={classes("assetColumn")}>
            <p>ASSET</p><p>PRICE</p><p>BALANCE</p><p>VALUE</p><p>24H CHANGE</p>
          </div>
          <div className={classes("assetContainer")}>
            {trackedAssets.map((asset: any) => (
              <div className={classes("assetBox")} key={asset?.id} data-id={asset?.id} data-type="LIQUID">
                <div className={classes("assetname")}>
                  {asset?.icon && String(asset.icon).startsWith('http') ? (
                    <img src={asset.icon} alt={asset?.short} style={{width: 24, height: 24, borderRadius: '50%', marginRight: 10}} />
                  ) : (
                    <i className={classes(asset?.icon || 'fa-solid fa-coins')} />
                  )}
                  <div className={classes("name")}>
                    <p className={classes("assetName")}>{String(asset?.name || 'Unknown')}</p>
                    <p className={classes("short")}>{String(asset?.short || 'UNK')}</p>
                  </div>
                </div>
                <div className={classes("values")}>
                  <div className={classes("price")}>
                    <p className={classes("assetPrice")}>${Number(asset?.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className={classes("balanceAmount")}>
                    <p className={classes("assetBalance")}>{Number(asset?.balance || 0).toLocaleString()}</p>
                    <p className={classes("currency")}>{String(asset?.short || '')}</p>
                    <p className={classes("type")}>LIQUID</p>
                  </div>
                  <div className={classes("value")}>
                    <p className={classes("assetValue")}>${Number(asset?.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className={classes("change24h")}>
                    <p className={classes("asset24hChange")} style={{ color: asset.change24h >= 0 ? '#00ffcc' : '#ff4a4a' }}>
                      {asset.change24h >= 0 ? `+${asset.change24h}` : asset.change24h}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={classes("distributionAndOptimize")}>
          <div className={classes("assetDistribution")}>
            <div className={classes("assetDistributionTitle")}>
              <h2>Asset Distribution</h2>
              <p>Portfolio spread across major protocols</p>
            </div>
            <div className={classes("assetDistributionDashboard")}>
              <div className={classes("pieChart")} />
              <div className={classes("dots")}>
                {allocationDistribution.map((dist: any, i: number) => (
                  <div className={classes("dotRow")} key={i}>
                    <span className={`dot top${i+1}`} />
                    <div>
                      <p className={classes("largest")}>{dist.label}</p>
                      <p className={classes("percent")}>{dist.percent}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className={classes("optimize")}>
            <i className={classes("fa-solid fa-wand-sparkles")} />
            <h2>Optimize your spending flow</h2>
            <div className={classes("exploreVault")} onClick={() => navigate('/ExploreVaults')} style={{ cursor: 'pointer' }}>
              <p>Explore Vaults</p>
              <i className={classes("fa-solid fa-right-long")} />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Assets;