// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageLayout from '../components/PageLayout';
import styles from '../assets/ExploreVaults.module.css'; // Dropped dual asset declaration to secure uniqueness

const classes = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((name) => (styles as Record<string, string>)[name] ?? name)
    .join(' ');

const ExploreVaults = () => {
  const navigate = useNavigate();
  // Reactive Navigation and Content Fetch states
  const [activeTab, setActiveTab] = useState<'ALL' | 'STABLECOINS' | 'AGGRESSIVE' | 'LENDING'>('ALL');
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Categories declaration matrix mapping
  const navigationTabs = [
    { id: 'ALL', label: 'ALL VAULTS' },
    { id: 'STABLECOINS', label: 'STABLECOINS' },
    { id: 'AGGRESSIVE', label: 'AGGRESSIVE' },
    { id: 'LENDING', label: 'LENDING' }
  ];

  useEffect(() => {
    const fetchYieldVaults = async () => {
      try {
        setLoading(true);
        const url = `http://localhost:5000/api/yield/strategies?category=${activeTab}`;
        const res = await axios.get(url);
        if (res.data.success) {
          setStrategies(res.data.strategies);
        }
      } catch (err) {
        console.error("Failed fetching smart pool strategies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchYieldVaults();
  }, [activeTab]);

  // Utility logic to dynamically safely build background alpha styles
  const getAlphaColor = (hex: string, alpha = 0.1) => {
    if (!hex.startsWith('#')) return hex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Helper macro to parse numeric TVLs into visual presentation formats
  const formatTVL = (value: number) => {
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  };

  return (
    <PageLayout currentPage="menuAssets">
      <div className={classes("vaultsContainer")}>
        
        {/* HERO YIELD PERFORMANCE ENGINE CARD */}
        <div className={classes("heroCard")}>
          <div className={classes("heroLeft")}>
            <p style={{ color: '#00e0ff', letterSpacing: 2, fontWeight: 'bold', margin: 0, fontSize: 10 }}>OPTIMIZED YIELD ENGINE</p>
            <h1 className={classes("pageTitle")}><span style={{ color: '#de8aff' }}>YIELD</span> NEBULA</h1>
            <p>Navigate the high-efficiency liquidity streams of the Snake ecosystem. Real-time yield discovery with cinematic precision.</p>
            <div className={classes("heroStats")}>
              <div className={classes("hStat")}><label>GLOBAL TVL</label><p>$1.42B</p></div>
              <div className={classes("hStat")}><label>YIELD PULSE</label><p style={{ color: '#00e0ff' }}>18.4% <i className={classes("fa-solid fa-arrow-trend-up")} style={{ fontSize: 14 }} /></p></div>
            </div>
          </div>
          <div className={classes("heroRight")}>
            <div className={classes("chartHeader")}>
              <div><h4>SNAKE YIELD PERFORMANCE</h4><h2>84.22%</h2></div>
              <span style={{ fontSize: 10, color: '#05c46b', fontWeight: 'bold' }}>+4.12%</span>
            </div>
            <div className={classes("barChart")}>
              {['30%', '45%', '35%', '60%', '80%', '100%'].map((h, i) => (
                <div key={i} className={`${classes("bar")} ${i === 5 ? classes("active") : ''}`} style={{ height: h }} />
              ))}
            </div>
          </div>
        </div>

        {/* FUNCTIONAL CATEGORY INTERACTION TAB ROW */}
        <div className={classes("tabRow")}>
          {navigationTabs.map((tab) => (
            <div 
              key={tab.id}
              className={`${classes("tab")} ${activeTab === tab.id ? classes("active") : ''}`}
              onClick={() => setActiveTab(tab.id as any)}
              style={{ cursor: 'pointer' }}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {/* VAULT STRATEGIES LISTINGS */}
        <div className={classes("vaultGrid")}>
          {loading ? (
            <p style={{ color: '#6b6b99', gridColumn: '1 / -1' }}>Querying decentralized yield indexes across networks...</p>
          ) : strategies.length === 0 ? (
            <p style={{ color: '#6b6b99', gridColumn: '1 / -1' }}>No active strategies matched this vector category selector.</p>
          ) : (
            strategies.map((vault) => (
              <div className={classes("vCard")} key={vault._id || vault.name}>
                <div className={classes("vIcon")} style={{ background: getAlphaColor(vault.themeColor, 0.1), color: vault.themeColor }}>
                  <i className={vault.icon} />
                </div>
                <span style={{ 
                  background: vault.category === 'AGGRESSIVE' ? 'rgba(255,77,109,0.1)' : 'rgba(255,255,255,0.05)', 
                  color: vault.category === 'AGGRESSIVE' ? '#ff4d6d' : '#6b6b99', 
                  fontSize: 8, fontWeight: 'bold', padding: '2px 6px', borderRadius: 4, float: 'right' 
                }}>
                  {vault.category}
                </span>
                <h3>{vault.name}</h3>
                <p className={classes("vDesc")}>{vault.desc}</p>
                <div className={classes("vMetrics")}>
                  <div className={classes("vMetric")}>
                    <label>CURRENT APY</label>
                    <p style={{ color: vault.themeColor }}>{vault.apy}%</p>
                  </div>
                  <div className={classes("vMetric")}>
                    <label>TOTAL TVL</label>
                    <p>{formatTVL(vault.tvl)}</p>
                  </div>
                </div>
                <div className={classes("riskRow")}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    RISK SCORE 
                    <div className={classes("riskDots")}>
                      {[1, 2, 3, 4].map(n => (
                        <div key={n} className={`${classes("dot")} ${n <= vault.risk ? classes("fill") : ''}`} />
                      ))}
                    </div>
                  </div>
                  <span>{vault.pair}</span>
                </div>
                <button className={classes("depositBtn")} onClick={() => navigate('/Send')}>DEPOSIT FUNDS</button>
              </div>
            ))
          )}
        </div>

        {/* FOOTER METRICS RUNWAY PANEL */}
        <div className={classes("footerStats")}>
          {[
            { label: 'TOTAL VALUE LOCKED', val: '$1,421,984,203' },
            { label: 'TOTAL YIELD PAID', val: '$84,120,551', color: '#00e0ff' },
            { label: 'ACTIVE WALLETS', val: '12,402' },
            { label: 'SNAKE BURN (24H)', val: '842,100 SNK', color: '#de8aff' }
          ].map((s) => (
            <div className={classes("fStat")} key={s.label}>
              <label>{s.label}</label>
              <p style={s.color ? { color: s.color } : {}}>{s.val}</p>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default ExploreVaults;