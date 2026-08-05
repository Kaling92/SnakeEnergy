// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import styles from '../assets/Send.module.css'; // Removed import variable clash
import { useWallet } from '../context/WalletContext';
import apiClient from '../api/apiClient';

const classes = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((name) => (styles as Record<string, string>)[name] ?? name)
    .join(' ');

const Send = () => {
  const navigate = useNavigate();
  const { assets, refreshAssets, refreshTransactions, isAuthenticated, assetsLoading } = useWallet();

  // Functional Transaction Core Hooks
  const [recipient, setRecipient] = useState<string>('');
  const [selectedAsset, setSelectedAsset] = useState<string>('ETH');
  const [sendAmount, setSendAmount] = useState<string>('');
  const [sliderVal, setSliderVal] = useState<number>(50);

  // Synchronized Wallet Data Hydration States
  const [userBalances, setUserBalances] = useState<Record<string, number>>({ ETH: 0, BTC: 0, BNB: 0, SOL: 0 });
  const [marketTelemetry, setMarketTelemetry] = useState<Record<string, any>>({});
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        if (!isAuthenticated()) {
          navigate('/Login');
          return;
        }
        await refreshAssets();
      } catch (err) {
        console.error("Could not sync live asset parameters:", err);
        setError('Send API unavailable. Showing fallback balance data.');
      }
    };

    fetchWalletData();
  }, [navigate, refreshAssets, isAuthenticated]);

  useEffect(() => {
    const nextBalances: Record<string, number> = { ETH: 0, BTC: 0, BNB: 0, SOL: 0 };
    (assets || []).forEach((a: any) => {
      const symbol = String(a.symbol || a.short || a.tokenSymbol || '').toUpperCase();
      if (symbol) {
        nextBalances[symbol] = parseFloat(a.balance ?? 0);
      }
    });
    setUserBalances(nextBalances);

    // Lightweight market telemetry fallback map while backend price API remains unchanged.
    setMarketTelemetry({
      ETH: { currentUSD: 2355.07, high24h: 2410, low24h: 2280 },
      BTC: { currentUSD: 64200.0, high24h: 65100, low24h: 63800 },
      BNB: { currentUSD: 580.1, high24h: 592, low24h: 565 },
      SOL: { currentUSD: 145.2, high24h: 151, low24h: 139 }
    });
  }, [assets]);

  // Compute live gas multipliers relative to user's slider values
  const getGasCost = () => {
    if (sliderVal < 30) return 0.000015; // Economy
    if (sliderVal <= 75) return 0.000042; // Standard
    return 0.000085; // Instant
  };

  const currentBalance = userBalances[selectedAsset] ?? 0;
  const currentTokenInfo = marketTelemetry[selectedAsset] || { currentUSD: 0, high24h: 0, low24h: 0 };
  const calculatedValueUSD = (currentBalance * currentTokenInfo.currentUSD).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleMaxClick = () => {
    const gasAdjustment = selectedAsset === 'ETH' ? getGasCost() : 0;
    const maxAmount = Math.max(0, currentBalance - gasAdjustment);
    setSendAmount(maxAmount.toString());
  };

  const handleConfirmSend = async () => {
    if (!recipient || !sendAmount || parseFloat(sendAmount) <= 0) {
      alert("Please fill in valid transaction parameters.");
      return;
    }

    try {
      const res = await apiClient.post('/api/transactions/send', {
        receiverAddress: recipient,
        tokenSymbol: selectedAsset,
        amount: sendAmount,
        feeAmount: getGasCost(),
        memo: 'Send page transfer'
      });

      if (res.data.success) {
        alert(`Successfully broadcast transaction! Hash: ${res.data.txHash || res.data.transaction?.txHash || res.data.transaction?._id}`);
        // Reset local input states
        setSendAmount('');
        setRecipient('');
        // Refresh shared context state
        await Promise.all([refreshAssets(), refreshTransactions()]);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Cryptographic network broadcast rejected.");
    }
  };

  return (
    <PageLayout currentPage="menuSend">
      <div className={classes("transactionHubTitle")}>
        <p>KINETIC ASSETS</p>
        <h1>Send Digital Energy</h1>
      </div>
      {error ? <div className={classes("sendInlineNotice")}>{error}</div> : null}
      
      <div className={classes("mainSendSection")}>
        <div className={classes("leftSendBox")}>
          <div className={classes("sendBox")}>
            
            {/* RECIPIENT INPUT FIELD */}
            <div className={classes("address")}>
              <p>RECIPIENT ADDRESS</p>
              <div className={classes("inputWrapper")}>
                <input 
                  className={classes("enterAddress")} 
                  type="text" 
                  placeholder="Enter recipient address 0x..." 
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
                <i className={classes("fa-solid fa-qrcode")} style={{ cursor: 'pointer' }} onClick={() => setRecipient('0x000000000000000000000000000000000000dead')} title="Scan Demo Address" />
              </div>
            </div>
            
            {/* ASSET SELECTOR & QUANTITY ENTRY */}
            <div className={classes("assetAndAmount")}>
              <div className={classes("asset")}>
                <p>SELECT ASSET</p>
                <select className={classes("assetSelect")} value={selectedAsset} onChange={(e) => setSelectedAsset(e.target.value)}>
                  <option value="ETH">ETH</option>
                  <option value="BTC">BTC</option>
                  <option value="BNB">BNB</option>
                  <option value="SOL">SOL</option>
                </select>
              </div>
              <div className={classes("amount")}>
                <p>AMOUNT</p>
                <div className={classes("inputWrapper")}>
                  <input 
                    className={classes("amountInput")} 
                    type="number" 
                    placeholder="0.00" 
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                  />
                  <a className={classes("maxLink")} style={{ cursor: 'pointer', fontWeight: 'bold' }} onClick={handleMaxClick}>MAX</a>
                </div>
              </div>
            </div>
            
            {/* ADJUSTABLE GAS MATRIX SECTION */}
            <div className={classes("feeBox")}>
              <div className={classes("feeBoxTitle")}>
                <div className={classes("networkFee")}>
                  <i className={classes("fa-solid fa-bolt")} />
                  <p>Network Fee (Gas)</p>
                </div>
                <p className={classes("feeValue")}>{getGasCost()} {selectedAsset === 'ETH' ? 'ETH' : 'GAS'}</p>
              </div>
              <div className={classes("slider-container")}>
                <input 
                  type="range" 
                  min={10} 
                  max={100} 
                  value={sliderVal} 
                  onChange={(e) => setSliderVal(parseInt(e.target.value))}
                  className={classes("slider")} 
                  id="myRange" 
                />
              </div>
              <div className={classes("range")}>
                <p style={{ color: sliderVal < 30 ? 'cyan' : '#6b6b99' }}>ECONOMY</p>
                <p style={{ color: (sliderVal >= 30 && sliderVal <= 75) ? 'cyan' : '#6b6b99' }}>STANDARD (RECOMMENDED)</p>
                <p style={{ color: sliderVal > 75 ? 'cyan' : '#6b6b99' }}>INSTANT</p>
              </div>
            </div>
            
            {/* SUBMIT BUTTON TRIGGER */}
            <button className={classes("confirmAndSend")} onClick={handleConfirmSend} disabled={assetsLoading}>
              <label style={{ cursor: 'pointer' }}>CONFIRM &amp; SEND ENERGY</label>
              <i className={classes("fa-regular fa-paper-plane")} />
            </button>
          </div>
        </div>

        {/* RIGHT METRIC BLOCK: CURRENT BALANCES & WALLET METADATA */}
        <div className={classes("rightSection")}>
          <div className={classes("availableBalance")}>
            <p>AVAILABLE BALANCE</p>
            <div className={classes("balance")}>
              <div className={classes("balanceValue")}>
                <p className={classes("balanceNumber")}>{assetsLoading ? '...' : currentBalance}</p>
                <p className={classes("currencyLabel")}>{selectedAsset}</p>
              </div>
              <p className={classes("realValueUSD")}>${assetsLoading ? '0.00' : calculatedValueUSD} USD</p>
            </div>
            <div className={classes("highLow")}>
              <div className={classes("high")}>
                <p>24H HIGH</p>
                <p className={classes("highValue")}>${currentTokenInfo.high24h}</p>
              </div>
              <div className={classes("low")}>
                <p>24H LOW</p>
                <p className={classes("lowValue")}>${currentTokenInfo.low24h}</p>
              </div>
            </div>
          </div>
          
          {/* QUICK SEND RECIPIENT HISTORIC SELECTION */}
          <div className={classes("recentDestination")}>
            <div className={classes("recentDestinationTitle")}>
              <i className={classes("fa-solid fa-clock-rotate-left")} />
              <p>RECENT DESTINATION</p>
            </div>
            <div className={classes("recentAddress")}>
              {[
                { name: 'vitalik.eth', address: '0x080a229045b14c382103f5d1bca3a1d' },
                { name: 'exchange.wallet', address: '0x4cbe58c5048092782e49c7198a287c' }
              ].map((node, i) => (
                <div 
                  className={classes("recentAddressbox")} 
                  key={i} 
                  onClick={() => setRecipient(node.address)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={classes("recentAddressInfo")}>
                    <p className={classes("recentName")}>{node.name}</p>
                    <p className={classes("recentAddressText")}>{node.address.substring(0,6)}...{node.address.substring(node.address.length - 4)}</p>
                  </div>
                  <i className={classes("fa-solid fa-angle-right")} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Send;