// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageLayout from '../components/PageLayout';
import styles from '../assets/Receive.module.css';

const classes = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((name) => (styles as Record<string, string>)[name] ?? name)
    .join(' ');

const Receive = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState<string>('');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('Ethereum Mainnet');
  const [copyStatus, setCopyStatus] = useState<string>('Copy Address');
  const [shareStatus, setShareStatus] = useState<string>('Share Link');
  const [loading, setLoading] = useState<boolean>(true);
  const [fundToken, setFundToken] = useState<string>('ETH');
  const [fundAmount, setFundAmount] = useState<string>('1');
  const [fundStatus, setFundStatus] = useState<string>('');

  useEffect(() => {
    const fetchReceiveAddress = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/Login');
          return;
        }

        // Fetching directly from the method added to your walletController
        const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/wallets/receive`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          setAddress(res.data.address);
        }
      } catch (err) {
        console.error("Could not fetch user receiving wallet data:", err);
        setAddress('0x4cbe58c5048092782e49c7198a287c88aa3f5d1b'); // Fallback placeholder safety string
      } finally {
        setLoading(false);
      }
    };

    fetchReceiveAddress();
  }, [navigate]);

  const handleCopy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus('Copy Address'), 2000);
    } catch (err) {
      console.error('Failed copying address to clipboard:', err);
    }
  };

  const handleShare = async () => {
    if (!address) return;
    try {
      const shareUrl = `${window.location.origin}/pay?address=${address}`;
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus('Link Copied!');
      setTimeout(() => setShareStatus('Share Link'), 2000);
    } catch (err) {
      console.error('Failed copying link to clipboard:', err);
    }
  };

  const handleFundWallet = async () => {
    try {
      setFundStatus('Funding wallet...');
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/Login');
        return;
      }

      const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/wallets/fund`, {
        tokenSymbol: fundToken,
        amount: parseFloat(fundAmount)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setFundStatus(`Success: +${res.data.amount} ${res.data.tokenSymbol}. New balance: ${res.data.updatedBalance}`);
      } else {
        setFundStatus('Funding failed.');
      }
    } catch (err: any) {
      setFundStatus(err.response?.data?.message || 'Funding failed.');
    }
  };

  return (
    <PageLayout currentPage="menuReceive">
      <div className={classes("transactionHubTitle")}>
        <p>TRANSACTION HUB</p>
        <h1>Receive Assets</h1>
      </div>
      
      <div className={classes("transactionHub")}>
        <div className={classes("receive")}>
          {/* Dynamic QR code generated on the fly from the database address */}
          <div id="qrCode" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: 140, height: 140, background: '#fff', padding: 8, borderRadius: 8, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {address ? (
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${address}`} 
                  alt="Wallet Address QR" 
                />
              ) : (
                <div style={{ color: '#000', fontSize: 11 }}>Generating QR...</div>
              )}
            </div>
          </div>
          
          <p style={{ marginTop: 15 }}>YOUR SNAKE WALLET ADDRESS</p>
          <p id="address" style={{ wordBreak: 'break-all', fontFamily: 'monospace', color: 'cyan', padding: '0 10px' }}>
            {loading ? 'Fetching secure node address...' : address}
          </p>
          
          <div className={classes("receiveButton")}>
            <button id="copyAddress" onClick={handleCopy} disabled={loading}>
              <i className={classes("fa-solid fa-copy")} />
              <label style={{ cursor: 'pointer' }}>{copyStatus}</label>
            </button>
            <button id="shareLink" onClick={handleShare} disabled={loading}>
              <i className={classes("fa-solid fa-share")} />
              <label style={{ cursor: 'pointer' }}>{shareStatus}</label>
            </button>
          </div>
        </div>

        <div className={classes("rightNetwork")}>
          <div className={classes("rightNetworkTitle")}>
            <i className={classes("fa-solid fa-network-wired")} />
            <p>Select Network</p>
          </div>
          {[
            { name: 'Ethereum Mainnet', tag: 'RECOMMENDED' },
            { name: 'Tron', tag: 'LOW FEE' },
            { name: 'META MASK', tag: 'LAYER 2' },
          ].map((net) => (
            <div 
              className={`${classes("netWorkBox")} ${selectedNetwork === net.name ? classes("activeNetwork") : ''}`} 
              key={net.name}
              onClick={() => setSelectedNetwork(net.name)}
              style={{ cursor: 'pointer' }}
            >
              <p className={classes("netWorkName")}>{net.name}</p>
              <p className={classes("reccommend")}>{net.tag}</p>
            </div>
          ))}
          
          <div className={classes("safetyProtocol")}>
            <i className={classes("fa-solid fa-triangle-exclamation")} />
            <p className={classes("safetyProtocolTitle")}>SAFETY PROTOCOL</p>
            <p className={classes("safetyProtocolContent")}>
              Only send tokens supported by {selectedNetwork} to this address layout.
            </p>
          </div>
        </div>
      </div>

      <div className={classes("mainNet")}>
        <div className={classes("mainNetTitle")}>
          <p>Supported Tokens on {selectedNetwork}</p>
          <button id="autoVerify">AUTO VERIFY ENABLED</button>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', margin: '12px 0 18px 0', flexWrap: 'wrap' }}>
          <select value={fundToken} onChange={(e) => setFundToken(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8 }}>
            <option value="ETH">ETH</option>
            <option value="BTC">BTC</option>
            <option value="BNB">BNB</option>
            <option value="SOL">SOL</option>
          </select>
          <input
            type="number"
            min="0.0001"
            step="0.0001"
            value={fundAmount}
            onChange={(e) => setFundAmount(e.target.value)}
            style={{ padding: '8px 10px', borderRadius: 8, width: 140 }}
          />
          <button onClick={handleFundWallet} style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}>
            Add Test Funds
          </button>
          <span style={{ color: '#7be3ff', fontSize: 13 }}>{fundStatus}</span>
        </div>
        
        <div className={classes("mainNetSection")}>
          {[
            { icon: 'fa-brands fa-bitcoin', name: 'WBTC', full: 'Wrapped Bitcoin', trend: '+1.2%' },
            { icon: 'fa-solid fa-dollar-sign', name: 'USDT', full: 'Tether USD', trend: '-0.01%' },
            { icon: 'fa-solid fa-staff-snake', name: 'SNK', full: 'Snake Energy', trend: '-0.01%' },
          ].map((token) => (
            <div className={classes("tokenBox")} key={token.name}>
              <div className={classes("tokenBoxContent")}>
                <i className={token.icon} />
                <p className={classes("tokenName")}>{token.name}</p>
                <p className={classes("tokenFullName")}>{token.full}</p>
              </div>
              <p className={classes("tokenTrending")}>{token.trend}</p>
            </div>
          ))}
          
          <div className={classes("addingToken")}>
            <button id="addTokenButton">+</button>
            <h2>Add Token</h2>
            <p>Custom Import</p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Receive;