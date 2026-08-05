// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import PageLayout from '../components/PageLayout';
import styles from '../assets/Swap.module.css'; // Removed redundant style module conflict
import { useWallet } from '../context/WalletContext';
import apiClient from '../api/apiClient';

const classes = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((name) => (styles as Record<string, string>)[name] ?? name)
    .join(' ');

const Swap = () => {
  const { assets, refreshAssets, refreshTransactions } = useWallet();

  // Asset Routing Control Matrices
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('BTC');
  const [sellAmount, setSellAmount] = useState('0.5');
  const [buyAmount, setBuyAmount] = useState('0.00');

  // Interactive Live Metrics
  const [usdEquivalent, setUsdEquivalent] = useState('0.00');
  const [exchangeRateLabel, setExchangeRateLabel] = useState('1 ETH = 0.00 BTC');
  const [networkFee, setNetworkFee] = useState('4.12');
  const [slippage, setSlippage] = useState('0.5%');

  // Local Wallet Cache Profiles
  const [balances, setBalances] = useState({ ETH: 0, BTC: 0, BNB: 0, SOL: 0 });

  useEffect(() => {
    const nextBalances: Record<string, number> = { ETH: 0, BTC: 0, BNB: 0, SOL: 0 };
    (assets || []).forEach((a: any) => {
      const symbol = String(a.symbol || a.short || a.tokenSymbol || '').toUpperCase();
      if (symbol in nextBalances) {
        nextBalances[symbol] = parseFloat(a.balance ?? 0);
      }
    });
    setBalances(nextBalances);
  }, [assets]);

  // Pull active conversions from backend pricing algorithms
  const updateQuote = useCallback(async (amountStr: string, fromT: string, toT: string) => {
    const numericAmt = parseFloat(amountStr);
    if (!numericAmt || numericAmt <= 0) {
      setBuyAmount('0.00');
      setUsdEquivalent('0.00');
      return;
    }

    try {
      const res = await apiClient.get(`/api/swap/quote`, {
        params: { fromToken: fromT, toToken: toT, amount: amountStr }
      });

      if (res.data.success) {
        setBuyAmount(res.data.targetAmount);
        setUsdEquivalent(res.data.usdValue);
        setExchangeRateLabel(res.data.exchangeRate);
        setNetworkFee(res.data.networkFee);
      }
    } catch (err) {
      console.error("Pricing engine calculations failed:", err);
    }
  }, []);

  // Sync quote computations when fields update
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      updateQuote(sellAmount, fromToken, toToken);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [sellAmount, fromToken, toToken, updateQuote]);

  // Invert routing tokens instantly
  const handleFlipTokens = () => {
    const temporarySource = fromToken;
    setFromToken(toToken);
    setToToken(temporarySource);
    setSellAmount(buyAmount);
  };

  // Submit swap proposal directly to transaction core
  const handleCommitSwap = async () => {
    const inputAmount = parseFloat(sellAmount);
    if (!inputAmount || inputAmount <= 0) return alert("Enter a valid transaction amount.");
    if (inputAmount > (balances[fromToken] || 0)) return alert("Asset limitations: Insufficient balance pool.");

    try {
      const res = await apiClient.post(`/api/swap/execute`, {
        fromToken,
        toToken,
        amount: sellAmount,
        memo: 'Swap page execution'
      });

      if (res.data.success) {
        alert(res.data.message);
        await Promise.all([refreshAssets(), refreshTransactions()]);
        setSellAmount('0');
      }
    } catch (err: any) {
      console.error("Trade finalization rejected:", err);
      const backendMessage = err.response?.data?.message || err.response?.data?.error;
      alert(backendMessage || err.message || "Trade parameters could not be established.");
    }
  };

  return (
    <PageLayout currentPage="menuSwap">
      <div className={classes("righPanel")}>
        <div className={classes("swapTitle")}>
          <h1>Liquid Snake Swap</h1>
          <p>Exchange tokens instantly with zero slippage across the kinetic nebula liquidity pools.</p>
        </div>
        
        <div className={classes("swapContainer")}>
          <div className={classes("transactionRoute")}>
            <p>TRANSACTION ROUTE</p>
            <i className={classes("fa-solid fa-gear")} style={{ cursor: 'pointer' }} />
          </div>

          {/* ASSET DISBURSEMENT ZONE (SELL) */}
          <div className={classes("from")}>
            <div className={classes("fromNameandAmount")}>
              <p>SELL</p>
              <input 
                type="number" 
                className={classes("amountInput")}
                value={sellAmount} 
                onChange={(e) => setSellAmount(e.target.value)}
                placeholder="0.0"
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 24, fontWeight: 'bold', width: '100%', outline: 'none' }}
              />
              <p id="usdEqual" style={{ margin: 0, color: '#6b6b99', fontSize: 12 }}>~${usdEquivalent}</p>
            </div>
            
            <div className={classes("crypType")}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: 11, color: '#6b6b99' }}>Balance:</p>
                <p style={{ margin: 0, fontWeight: 600 }}>{balances[fromToken]?.toFixed(4)} <span style={{ color: '#00e0ff' }}>{fromToken}</span></p>
              </div>
              <div className={classes("cryptoDropdown")}>
                <select value={fromToken} onChange={(e) => setFromToken(e.target.value)}>
                  <option value="ETH">ETH</option>
                  <option value="BTC">BTC</option>
                  <option value="BNB">BNB</option>
                  <option value="SOL">SOL</option>
                </select>
              </div>
            </div>
          </div>

          {/* INVERSION VECTOR SWITCH */}
          <div className={classes("switchIcon")} onClick={handleFlipTokens} style={{ cursor: 'pointer', margin: '10px auto', display: 'table' }}>
            <i className={classes("fa-solid fa-arrow-down-up-across-line")} style={{ color: '#00e0ff' }} />
          </div>

          {/* TARGET ACQUISITION ZONE (BUY) */}
          <div className={classes("to")}>
            <div className={classes("toNamendAmount")}>
              <p>BUY</p>
              <p id="toAmount" style={{ fontSize: 24, fontWeight: 'bold', margin: 0, color: '#00e0ff' }}>{parseFloat(buyAmount).toFixed(4)}</p>
              <div id="fromEqualTo" style={{ display: 'flex', gap: 4, fontSize: 11, color: '#6b6b99', marginTop: 4 }}>
                <span>{exchangeRateLabel}</span>
              </div>
            </div>
            
            <div className={classes("crypType")}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: 11, color: '#6b6b99' }}>Balance:</p>
                <p style={{ margin: 0, fontWeight: 600 }}>{balances[toToken]?.toFixed(4)} <span style={{ color: '#00e0ff' }}>{toToken}</span></p>
              </div>
              <div className={classes("cryptoDropdown")}>
                <select value={toToken} onChange={(e) => setToToken(e.target.value)}>
                  <option value="ETH">ETH</option>
                  <option value="BTC">BTC</option>
                  <option value="BNB">BNB</option>
                  <option value="SOL">SOL</option>
                </select>
              </div>
            </div>
          </div>

          {/* FEE ROUTING & ACCOUNTING DATA PANELS */}
          <div className={classes("billing")} style={{ marginTop: 20 }}>
            <div className={classes("exchangeRate")}><p>Exchange rate validation</p><p id="exchangeRate">{exchangeRateLabel}</p></div>
            <div className={classes("slippageTolerance")}><p>Slippage Tolerance</p><p id="tolerance">{slippage}</p></div>
            <div className={classes("networkFee")}><p>Gas / Network Overhead Friction</p><p id="networkFee">${networkFee}</p></div>
          </div>

          <button id="confirmSwap" onClick={handleCommitSwap} style={{ width: '100%', marginTop: 15, cursor: 'pointer' }}>
            <i className={classes("fa-solid fa-bolt")} /> Confirm trade execution
          </button>
        </div>
      </div>

      {/* METRIC CARD REINFORCEMENTS */}
      <div className={classes("rightInfoCards")}>
        <div className={classes("infoCard")} id="priceActionCard">
          <i className={classes("fa-solid fa-arrow-trend-up")} />
          <h2>Price Action</h2>
          <p>{fromToken}/{toToken} ecosystem trajectories remain performance optimized today.</p>
        </div>
        <div className={classes("infoCard")} id="liquidityCard">
          <i className={classes("fa-solid fa-droplet")} />
          <h2>Liquidity Score</h2>
          <p>Excellent pool depths. Trade volatility risk impact: &lt; 0.01%.</p>
        </div>
        <div className={classes("infoCard")} id="verifiedPoolCard">
          <i className={classes("fa-solid fa-shield")} />
          <h2>Verified Pool</h2>
          <p>Audit parameters finalized completely by Snake Shield Labs.</p>
          <button className={classes("auditBtn")} id="auditBtn">VIEW AUDIT REPORT</button>
        </div>
      </div>
    </PageLayout>
  );
};

export default Swap;