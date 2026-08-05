// @ts-nocheck
import React, { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import styles from '../assets/Transactions.module.css'; // Eliminated clash with homepage styles
import { useWallet } from '../context/WalletContext';

const classes = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((name) => (styles as Record<string, string>)[name] ?? name)
    .join(' ');

// Icon and decorative styling definitions helper matrix
const STYLE_REGISTRY: Record<string, { icon: string; color: string; dotColor: string }> = {
  swap: { icon: 'fa-solid fa-arrow-right-arrow-left', color: '#00e0ff', dotColor: '#ffab00' },
  send: { icon: 'fa-solid fa-arrow-up', color: '#a64dff', dotColor: '#00e0ff' },
  stake: { icon: 'fa-solid fa-building-columns', color: '#ff4d6d', dotColor: '#00e0ff' },
  receive: { icon: 'fa-solid fa-arrow-down', color: '#00e0ff', dotColor: '#00e0ff' },
  mint: { icon: 'fa-solid fa-cube', color: '#6b6b99', dotColor: '#ff4d6d' },
};

const Transactions = () => {
  const { transactions, refreshTransactions } = useWallet();

  // Filter Selection Hooks
  const [txType, setTxType] = useState('All Activities');
  const [timeHorizon, setTimeHorizon] = useState('Last 30 Days');
  const [assetProtocol, setAssetProtocol] = useState('All Assets');
  
  // Feed Arrays, Summary Profiles & Pagination State Matrices
  const [ledgerFeed, setLedgerFeed] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState({ completed: 142, pending: 3, totalVolume: "$124,592.80" });
  const [error, setError] = useState('');

  const fallbackLedger = [
    { _id: 'fb-1', txType: 'swap', title: 'Asset Swap', subtitle: 'ETH -> USDC', amount: '-1.20 ETH', amountSub: '~$3,186.00', impact: '+3,180 USDC', impactSub: 'after fees', status: 'completed', txHash: '0x5f1dcb2216f2f3c7fb55e2a6a9b0fd663f3e7e2d4bbf4f1cd8a998b1ff201122' },
    { _id: 'fb-2', txType: 'send', title: 'Outbound Transfer', subtitle: 'Sent to 0x9fd3...15b8', amount: '-0.42 ETH', amountSub: '~$1,113.00', impact: null, impactSub: null, status: 'pending', txHash: '0xe1c7988f1602fa7fb97ab1435ce2dfe0eb8e06a2ab7f75535b6f9cfb9b0b2f22' },
    { _id: 'fb-3', txType: 'stake', title: 'Staking Deployment', subtitle: 'SOL Validator Pool', amount: '48.00 SOL', amountSub: '~$6,969.60', impact: '+7.8% APY', impactSub: 'est. annual', status: 'completed', txHash: '0x7c8ce2bfa620c74f7d65ec25b1284ec5f39f7066d7fa1b55c5a2d5cfecf28a44' },
    { _id: 'fb-4', txType: 'receive', title: 'Inbound Assets', subtitle: 'Received from bc1q...8d3p', amount: '+0.03 BTC', amountSub: '~$1,926.00', impact: null, impactSub: null, status: 'completed', txHash: '0xbc4f8ab1f952f41f0d391f2ee10f74dcf53f3f5d16f2e4b2cfa39d850f18d882' },
    { _id: 'fb-5', txType: 'mint', title: 'Contract Mint', subtitle: 'NFT Gas Commit', amount: '-0.011 ETH', amountSub: '~$29.15', impact: null, impactSub: null, status: 'failed', txHash: '0x89d6f28d2ab9de1e5b64f5fbef08d6f7f99cc5dcdb3071bf4414f76c9d6f0195' }
  ];

  const fetchTransactions = async () => {
    try {
      await refreshTransactions();
    } catch (err) {
      console.error("Ledger acquisition engine synchronization dropped:", err);
      setError('Ledger endpoint unavailable. Showing fallback activity records.');
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [refreshTransactions]);

  useEffect(() => {
    const raw = Array.isArray(transactions) ? transactions : [];

    const transformed = raw.map((tx: any) => {
      const type = String(tx.txType || tx.transactionType || 'send').toLowerCase();
      const status = String(tx.status || 'pending').toLowerCase();
      const token = tx.assetProtocol || tx.tokenSymbol || tx.cryptoSymbol || 'ETH';
      const amountValue = parseFloat(tx.amount ?? 0);
      const amountPrefix = type === 'send' ? '-' : '+';

      return {
        _id: tx._id || tx.txHash,
        txType: type,
        title: tx.title || `${type.toUpperCase()} Transaction`,
        subtitle: tx.subtitle || `${tx.senderAddress || tx.fromAddress || 'wallet'} -> ${tx.receiverAddress || tx.toAddress || 'wallet'}`,
        amount: (typeof tx.amount === 'object' && tx.amount !== null && tx.amount.$numberDecimal) 
          ? `${amountPrefix}${tx.amount.$numberDecimal} ${token}` 
          : (tx.amount?.toString?.() !== '[object Object]' ? tx.amount?.toString?.() : `${amountPrefix}${amountValue || 0} ${token}`),
        amountSub: tx.amountSub || '',
        amountColor: tx.amountColor,
        impact: tx.impact,
        impactSub: tx.impactSub,
        status,
        txHash: tx.txHash || ''
      };
    });

    const filtered = transformed.filter((tx: any) => {
      const typeOk = txType === 'All Activities' || tx.txType === txType.toLowerCase();
      const assetOk = assetProtocol === 'All Assets' || tx.amount.includes(assetProtocol);
      let horizonOk = true;
      if (timeHorizon === 'Last 30 Days') {
        // Keep true for now because tx payload in UI mode does not always carry reliable timestamp strings.
        horizonOk = true;
      }
      return typeOk && assetOk && horizonOk;
    });

    const pageSize = 5;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const paged = filtered.slice(start, end);

    const completedCount = transformed.filter((t: any) => ['completed', 'confirmed', 'success'].includes(String(t.status || '').toLowerCase())).length;
    const pendingCount = transformed.filter((t: any) => String(t.status || '').toLowerCase() === 'pending').length;

    setLedgerFeed(paged);
    setTotalPages(Math.max(1, Math.ceil(filtered.length / pageSize)));
    setSummary((prev) => ({
      ...prev,
      completed: completedCount,
      pending: pendingCount
    }));
  }, [transactions, txType, timeHorizon, assetProtocol, currentPage]);

  const visibleLedger = ledgerFeed.length ? ledgerFeed : fallbackLedger;

  const handleResetFilters = (e: React.MouseEvent) => {
    e.preventDefault();
    setTxType('All Activities');
    setTimeHorizon('Last 30 Days');
    setAssetProtocol('All Assets');
    setCurrentPage(1);
  };

  return (
    <PageLayout currentPage="menuTransactions">
      <div className={classes("portfolioPanel")}>
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
        <div className={classes("portfolioTitleName")}>
          <p style={{ color: '#00e0ff', letterSpacing: 2, fontWeight: 'bold', margin: 0 }}>ON-CHAIN ACTIVITY</p>
          <h1>TRANSACTION LEDGER</h1>
        </div>
        
        {/* INTERACTIVE CONTROLS ROW */}
        <div className={classes("summaryRow")}>
          <div className={classes("refineCard")}>
            <div className={classes("refineHeader")}>
              <h3>Refine Results</h3>
              <a href="#" className={classes("resetFilters")} onClick={handleResetFilters}>
                <i className={classes("fa-solid fa-rotate-left")} /> Reset Filters
              </a>
            </div>
            <div className={classes("filterControls")}>
              <div className={classes("filterGroup")}>
                <label>Transaction Type</label>
                <select className={classes("filterSelect")} value={txType} onChange={(e) => { setTxType(e.target.value); setCurrentPage(1); }}>
                  <option value="All Activities">All Activities</option>
                  <option value="Swap">Asset Swaps</option>
                  <option value="Send">Outbound Transfers</option>
                  <option value="Stake">Staking Deployments</option>
                  <option value="Receive">Inbound Assets</option>
                  <option value="Mint">Mints & Smart Contracts</option>
                </select>
              </div>
              <div className={classes("filterGroup")}>
                <label>Time Horizon</label>
                <select className={classes("filterSelect")} value={timeHorizon} onChange={(e) => { setTimeHorizon(e.target.value); setCurrentPage(1); }}>
                  <option value="Last 30 Days">Last 30 Days</option>
                  <option value="All Time">All Historical Activity</option>
                </select>
              </div>
              <div className={classes("filterGroup")}>
                <label>Asset Protocol</label>
                <select className={classes("filterSelect")} value={assetProtocol} onChange={(e) => { setAssetProtocol(e.target.value); setCurrentPage(1); }}>
                  <option value="All Assets">All Assets</option>
                  <option value="ETH">ETH (Ethereum)</option>
                  <option value="BTC">BTC (Bitcoin)</option>
                  <option value="USDC">USDC (USD Coin)</option>
                  <option value="SNK">SNK (Snake Token)</option>
                </select>
              </div>
            </div>
          </div>

          {/* DYNAMIC COMPLETED STATISTICS METRIC CARD */}
          <div className={classes("volumeCard")}>
            <p>TOTAL VOLUME (30D)</p>
            <h2 className={classes("totalVolume")}>{summary.totalVolume}</h2>
            <div className={classes("volumeStats")}>
              <div className={classes("stat")}><span className={classes("statDot")} style={{ background: '#00e0ff' }} /> {summary.completed} Completed</div>
              <div className={classes("stat")}><span className={classes("statDot")} style={{ background: '#ffab00' }} /> {summary.pending} Pending</div>
            </div>
          </div>
        </div>

        {/* LEDGER FEED BLOCK */}
        <div className={classes("transactionLedger")}>
          {visibleLedger.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b6b99' }}>
              <p>No transactions match your tracking criteria parameters.</p>
            </div>
          ) : (
            visibleLedger.map((tx) => {
              const design = STYLE_REGISTRY[tx.txType] || { icon: 'fa-solid fa-cube', color: '#fff', dotColor: '#fff' };
              return (
                <div className={classes("txRow")} key={tx._id || tx.txHash}>
                  <div className={classes("txLeft")}>
                    <div className={classes("txIconBox")} style={{ color: design.color }}>
                      <i className={design.icon} />
                      <span className={classes("statusDot")} style={{ background: design.dotColor }} />
                    </div>
                    <div className={classes("txInfo")}>
                      <h4>{tx.title}</h4>
                      <p style={tx.status === 'failed' ? { color: '#ff4d6d', fontStyle: 'italic' } : {}}>{tx.subtitle}</p>
                    </div>
                  </div>
                  <div className={classes("txRight")}>
                    <div className={classes("txValues")} style={!tx.impact ? { marginRight: 40 } : {}}>
                      <p className={classes("amount")} style={tx.amountColor ? { color: tx.amountColor } : {}}>{tx.amount}</p>
                      <p className={classes("subValue")}>{tx.amountSub}</p>
                    </div>
                    {tx.impact && (
                      <div className={classes("impact")}>
                        <p className={classes("tokenAmount")}>{tx.impact}</p>
                        <p className={classes("usdValue")}>{tx.impactSub}</p>
                      </div>
                    )}
                    <span className={`${classes("badge")} ${classes(tx.status)}`}>{tx.status.toUpperCase()}</span>
                    <i 
                      className={classes("fa-solid fa-arrow-up-right-from-square externalLink")} 
                      onClick={() => window.open(`https://etherscan.io/tx/${tx.txHash}`, '_blank')}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* PAGINATION STEPPER LOGIC */}
        {totalPages > 1 && (
          <div className={classes("pagination")}>
            <div 
              className={classes("pageBtn")} 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              style={{ pointerEvents: currentPage === 1 ? 'none' : 'auto', opacity: currentPage === 1 ? 0.4 : 1 }}
            >
              <i className={classes("fa-solid fa-chevron-left")} />
            </div>
            
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNumber) => (
              <div 
                key={pageNumber} 
                className={`${classes("pageBtn")} ${currentPage === pageNumber ? classes("active") : ''}`}
                onClick={() => setCurrentPage(pageNumber)}
              >
                {pageNumber}
              </div>
            ))}

            <div 
              className={classes("pageBtn")} 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              style={{ pointerEvents: currentPage === totalPages ? 'none' : 'auto', opacity: currentPage === totalPages ? 0.4 : 1 }}
            >
              <i className={classes("fa-solid fa-chevron-right")} />
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Transactions;