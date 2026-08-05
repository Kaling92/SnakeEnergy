// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageLayout from '../components/PageLayout';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import styles from '../assets/Analytics.module.css'; // Fixed colliding duplicate style bug

const classes = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((name) => (styles as Record<string, string>)[name] ?? name)
    .join(' ');

const Analytics = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/Login');
          return;
        }

        const res = await axios.get('http://localhost:5000/api/wallet/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          setMetrics(res.data);
        }
      } catch (err) {
        console.error("Failed fetching live portfolio pulse matrices:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [navigate]);

  if (loading) return <div style={{ color: '#fff', padding: '50px', textAlign: 'center' }}>Analyzing Portfolio Health...</div>;

  const totalValue = metrics?.totalBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00';
  const rawChange = metrics?.balanceChangeUSD || 0;
  const pctChange = metrics?.balanceChangePercent || '0.00';
  const allocations = metrics?.allocation || [];
  const breakdowns = metrics?.breakdown || [];

  return (
    <PageLayout currentPage="menuAnalytics">
      <div className={classes("portfolioPanel")}>
        <div className={classes("portfolioTitle")}>
          <div className={classes("portfolioTitleName")}>
            <h1>PORTFOLIO PULSE</h1>
            <p>REAL-TIME PERFORMANCE ANALYTICS &amp; ASSET HEALTH</p>
          </div>
          <div className={classes("timeFrame")}>
            <p>1D</p><p className={classes("activeTime")}>1W</p><p>1M</p><p>1Y</p><p>ALL</p>
          </div>
        </div>

        <div className={classes("topGrid")}>
          <div className={classes("balanceCard")}>
            <div className={classes("balanceCardTitle")}>
              <p>CURRENT BALANCE</p>
              <h2 id="totalBalance1">${totalValue}</h2>
              <p id="balanceChange" style={{ color: rawChange >= 0 ? '#00ffcc' : '#ff4a4a' }}>
                {rawChange >= 0 ? `+$${rawChange.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : `-$${Math.abs(rawChange).toLocaleString(undefined, { maximumFractionDigits: 2 })}`} ({pctChange}%)
              </p>
            </div>
            <div className={classes("describeDot")}>
              <div className={classes("dot wallet")} /><p>WALLET PERFORMANCE</p>
              <div className={classes("dot market")} /><p>MARKET AVG</p>
            </div>
            <div className={classes("chartContainer")} style={{ height: 250, marginTop: 20, marginLeft: -20 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { name: 'Mon', wallet: 112000, market: 110000 },
                  { name: 'Tue', wallet: 118000, market: 114000 },
                  { name: 'Wed', wallet: 116000, market: 116500 },
                  { name: 'Thu', wallet: 125000, market: 120000 },
                  { name: 'Fri', wallet: 122000, market: 121000 },
                  { name: 'Sat', wallet: 129000, market: 125000 },
                  { name: 'Sun', wallet: metrics?.totalBalance || 132245, market: 128000 },
                ]}>
                  <defs>
                    <linearGradient id="colorWallet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00e0ff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00e0ff" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorMarket" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#de8aff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#de8aff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#6b6b99" tick={{fill: '#6b6b99', fontSize: 12}} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b6b99" tick={{fill: '#6b6b99', fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1c1c28', border: '1px solid #3d3d66', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="market" stroke="#de8aff" fillOpacity={1} fill="url(#colorMarket)" />
                  <Area type="monotone" dataKey="wallet" stroke="#00e0ff" fillOpacity={1} fill="url(#colorWallet)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={classes("allocationCard")}>
            <p>ASSET ALLOCATION</p>
            <div className={classes("circle")} />
            <div className={classes("assetList")}>
              {allocations.map((a: any) => (
                <div className={classes("assetRow")} key={a.short}>
                  <div className={classes("assetLeft")}>
                    <div className={`${classes("bar")} ${classes(a.short.toLowerCase())}`} style={{ width: '6px', backgroundColor: a.short === 'ETH' ? '#8c8cfa' : a.short === 'BTC' ? '#f5b041' : '#2ecc71' }} />
                    <div>
                      <p className={classes("assetName")}>{a.name}</p>
                      <p className={classes("assetSub")}>{a.short} / LAYER 1</p>
                    </div>
                  </div>
                  <div className={classes("assetRight")}>
                    <p>{a.pct}</p>
                    <p>${a.val.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={classes("tableCard")}>
          <div className={classes("tableTitle")}>
            <p>ASSET PROFIT/LOSS BREAKDOWN</p>
            <div className={classes("tableFunction")}>
              <i className={classes("fa-solid fa-arrow-down-short-wide")} />
              <i className={classes("fa-solid fa-download")} />
            </div>
          </div>
          <div className={classes("tableHeader")}>
            <p>Asset</p><p>Avg Entry</p><p>Current</p><p>Qty</p><p>Realized</p><p>Unrealized</p>
          </div>
          {breakdowns.map((r: any) => (
            <div className={classes("row")} key={r.short}>
              <div className={classes("logo")}>
                <div>
                  <p style={{ fontWeight: 'bold' }}>{r.name}</p>
                  <p style={{ fontSize: '11px', color: '#888' }}>{r.short}</p>
                </div>
              </div>
              <p>${r.avgEntry.toLocaleString()}</p>
              <p>${r.currentPrice.toLocaleString()}</p>
              <p>{r.qty}</p>
              <p style={{ color: r.realized >= 0 ? '#00ffcc' : '#ff4a4a' }}>
                {r.realized >= 0 ? `+$${r.realized}` : `-$${Math.abs(r.realized)}`}
              </p>
              <p style={{ color: r.unrealized >= 0 ? '#00ffcc' : '#ff4a4a' }}>
                {r.unrealized >= 0 ? `+$${r.unrealized.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : `-$${Math.abs(r.unrealized).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
              </p>
            </div>
          ))}
        </div>

        <div className={classes("bottomGrid")}>
          <div className={classes("miniCard")}>
            <i className={classes("fa-solid fa-octagon cardIcon")} />
            <p>ACTIVE STAKES</p>
            <h3 id="activeStakes">$24,102.00</h3>
            <p className={classes("subText")} style={{ color: 'aqua' }}>APY AVG: 6.4%</p>
            <div className={classes("progressBar")}><div className={classes("progressFill")} style={{ width: '65%' }} /></div>
          </div>
          <div className={classes("miniCard")}>
            <i className={classes("fa-solid fa-leaf cardIcon")} />
            <p>YIELD HARVESTED</p>
            <h3 id="yield">$1,244.50</h3>
            <p className={classes("subText")} style={{ color: 'rgb(174,43,226)' }}>LIFE-TIME ENERGY</p>
            <div className={classes("barChart")}><span /><span /><span /><span /><span /></div>
          </div>
          <div className={classes("miniCard")}>
            <i className={classes("fa-solid fa-droplet cardIcon")} />
            <p>LIQUIDITY SCORE</p>
            <h3 id="liquidity">94/100</h3>
            <p className={classes("subText")} style={{ color: 'rgb(0,255,150)' }}>OPTIMAL PORTFOLIO HEALTH</p>
            <p className={classes("note")}>Your ratio of liquid assets to locked stakes is balanced. Consider hedging 10% more in USDC for market volatility.</p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Analytics;