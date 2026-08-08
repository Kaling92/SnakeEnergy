// @ts-nocheck
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PageLayout from '../components/PageLayout';
import styles from '../assets/Wallet.module.css'; // Removed secondary file styles import overlap

const classes = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((name) => (styles as Record<string, string>)[name] ?? name)
    .join(' ');

const Wallet = () => {
  // Live State Registries
  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal Interactive Form States
  const [showModal, setShowModal] = useState(false);
  const [newVaultName, setNewVaultName] = useState('');
  const [newVaultTag, setNewVaultTag] = useState('');

  // Static Activity Feed Matrix Mapping
  const activityData = [
    { dotColor: '#a64dff', vault: 'Main Vault', type: 'Swap Protocol', entity: '0x7b26...124d', delta: '+1.42 ETH', deltaClass: 'plus', width: '75%' },
    { dotColor: '#ff4d6d', vault: 'Ledger Nano X', type: 'Direct Transfer', entity: '0xde2d...a314', delta: '-5,000 USDC', deltaClass: 'minus', width: '40%' },
    { dotColor: '#00e0ff', vault: 'DeFi Hot Wallet', type: 'Liquidity Provision', entity: '0x12c4...77d2', delta: '+12.5 LP', deltaClass: 'plus', width: '60%' },
  ];

  // Asynchronous Fetch
  const fetchVaultData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/vaults`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setVaults(res.data.vaults);
      }
    } catch (err) {
      console.error("Vault parameters extraction error connection:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaultData();
  }, []);

  // Copy-to-Clipboard helper action
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Address signature copied to buffer: ${text}`);
  };

  // Submit dynamic new vault registration action
  const handleCreateVault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVaultName) return alert('Provide custom identification naming parameters.');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/vaults/add`, {
        name: newVaultName,
        tag: newVaultTag
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setVaults(prev => [...prev, res.data.vault, res.data.vault]);
        setNewVaultName('');
        setNewVaultTag('');
        setShowModal(false);
        fetchVaultData(); // Hard refresh dataset references
      }
    } catch (err) {
      console.error("Database compilation parameters validation rejected:", err);
    }
  };

  return (
    <PageLayout currentPage="menuWallet">
      <div className={classes("walletContainer")}>
        <h1 className={classes("pageTitle")}><span style={{ color: '#de8aff' }}>MULTIVERSE</span> VAULTS</h1>
        <p className={classes("pageSubtitle")}>MANAGE YOUR FRAGMENTED DIGITAL PRESENCE ACROSS THE KINETIC NEBULA. SECURE, FLUID, MULTI-DIMENSIONAL.</p>
        
        {/* VAULT ARCHITECTURE CARDS GRID */}
        <div className={classes("vaultGrid")}>
          {loading ? (
            <p style={{ color: '#6b6b99' }}>Syncing core cloud ledger balance indexes...</p>
          ) : (
            vaults.map((v) => {
              // Extract currency presentation parts cleanly from number properties
              const numericValue = v.worth || 0;
              const dollarString = Math.floor(numericValue).toLocaleString();
              const decimalString = '.' + (numericValue.toFixed(2).split('.')[1] || '00');

              return (
                <div className={classes("vaultCard")} key={v._id || v.name}>
                  <div className={classes("vTop")}>
                    {v.tag && <span className={classes(v.tagClass || "primaryTag")}>{v.tag}</span>}
                    <p>VAULT IDENTITY</p>
                    <h3>{v.name}</h3>
                    <span 
                      className={classes("addr")} 
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleCopyToClipboard(v.address)}
                    >
                      {v.address} <i className={classes("fa-regular fa-copy")} style={{ marginLeft: 5 }} />
                    </span>
                  </div>
                  <div className={classes("vBottom")}>
                    <span>NET WORTH</span>
                    <h2>${dollarString}<small>{decimalString}</small></h2>
                  </div>
                </div>
              );
            })
          )}

          {/* ADD FRESH VAULT ACTION TRIGGER */}
          <div className={classes("vaultCard addVaultCard")} onClick={() => setShowModal(true)} style={{ cursor: 'pointer' }}>
            <i className={classes("fa-solid fa-plus")} />
            <h4>ADD NEW VAULT</h4>
            <p>CONNECT HARDWARE OR IMPORT SEED</p>
          </div>
        </div>

        {/* NEBULA TRANSACTIONS LIST SUBSECTION */}
        <div className={classes("activitySection")}>
          <div className={classes("activityHeader")}>
            <h2>NEBULA ACTIVITY</h2>
            <a href="/transactions" className={classes("viewHistory")}>VIEW FULL HISTORY <i className={classes("fa-solid fa-arrow-right-long")} style={{ marginLeft: 5 }} /></a>
          </div>
          <div className={classes("activityTable")}>
            <table>
              <thead>
                <tr><th>VAULT</th><th>INTERACTION</th><th>ENTITY</th><th>ENERGY DELTA</th><th>ENTROPY</th></tr>
              </thead>
              <tbody>
                {activityData.map((row) => (
                  <tr key={row.vault + row.type}>
                    <td><div className={classes("vLabel")}><div className={classes("vDot")} style={{ background: row.dotColor }} /> {row.vault}</div></td>
                    <td className={classes("interaction")}>{row.type}</td>
                    <td className={classes("entity")}>{row.entity}</td>
                    <td className={`${classes("delta")} ${classes(row.deltaClass)}`}>{row.delta}</td>
                    <td><div className={classes("entBar")}><div className={classes("entFill")} style={{ width: row.width }} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DYNAMIC FORM INJECTION SYSTEM MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(10,10,22,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#14142b', padding: 30, borderRadius: 12, width: 400, border: '1px solid #3d3d66' }}>
            <h3 style={{ color: '#fff', marginTop: 0, letterSpacing: 1 }}>DEPLOY COMPONENT VAULT</h3>
            <form onSubmit={handleCreateVault} style={{ display: 'flex', flexDirection: 'column', gap: 15, marginTop: 15 }}>
              <div>
                <label style={{ color: '#6b6b99', fontSize: 12, display: 'block', marginBottom: 5 }}>VAULT LABEL</label>
                <input 
                  type="text" 
                  value={newVaultName} 
                  onChange={(e) => setNewVaultName(e.target.value)}
                  placeholder="e.g., Quantum Cold Storage" 
                  style={{ width: '100%', padding: '10px', background: '#0e0e1f', border: '1px solid #3d3d66', color: '#fff', borderRadius: 6, outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ color: '#6b6b99', fontSize: 12, display: 'block', marginBottom: 5 }}>HARDWARE/PROTOCOL CONFIG TAG</label>
                <select 
                  value={newVaultTag} 
                  onChange={(e) => setNewVaultTag(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: '#0e0e1f', border: '1px solid #3d3d66', color: '#fff', borderRadius: 6 }}
                >
                  <option value="">None (Standard Base Profile)</option>
                  <option value="PRIMARY">PRIMARY (Main Asset Target)</option>
                  <option value="HARDWARE">HARDWARE (Airgapped Ledger/Trezor)</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ background: 'transparent', border: '1px solid #3d3d66', color: '#fff', padding: '8px 16px', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: '#a64dff', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' }}>Initialize Vault</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default Wallet;