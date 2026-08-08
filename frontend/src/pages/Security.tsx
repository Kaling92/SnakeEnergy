// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageLayout from '../components/PageLayout';
import styles from '../assets/Settings.module.css'; // Removed import variable collision
import userImg from '../assets/user.png';

const classes = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((name) => (styles as Record<string, string>)[name] ?? name)
    .join(' ');

const Security = () => {
  const navigate = useNavigate();
  
  // Dynamic Profile States bound to Backend
  const [username, setUsername] = useState<string>('Loading User...');
  const [publicId, setPublicId] = useState<string>('snake.eth');
  const [currency, setCurrency] = useState<string>('USD ($)');
  
  // Interactive UI Toggles & Mock Lists
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [twoFactor, setTwoFactor] = useState<boolean>(true);
  const [showSeed, setShowSeed] = useState<boolean>(false);
  const [rotateMsg, setRotateMsg] = useState<string>('');
  const [devices, setDevices] = useState([
    { name: 'MacBook Pro 16"', action: 'current' },
    { name: 'iPhone 15 Pro', action: 'revoke' },
    { name: 'iPad Air', action: 'revoke' }
  ]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/Login');
          return;
        }
        const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setUsername(res.data.username);
          setPublicId(res.data.publicIdentity);
          setCurrency(res.data.displayCurrency);
        }
      } catch (err) {
        console.error("Could not sync profile settings configurations:", err);
      }
    };
    fetchUserData();
  }, [navigate]);

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/users/profile`, {
        publicIdentity: publicId,
        displayCurrency: currency
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        alert("Systems configurations synchronized successfully!");
      }
    } catch (err) {
      console.error("Failed to commit profile mutations:", err);
    }
  };

  const handleRevokeDevice = (name: string) => {
    setDevices(prev => prev.filter(d => d.name !== name));
  };

  const handleWipeVault = () => {
    const confirmWipe = window.confirm("CRITICAL WARNING: This completely purges your local storage credentials and session keys permanently. Proceed?");
    if (confirmWipe) {
      localStorage.clear();
      navigate('/Login');
    }
  };

  return (
    <PageLayout currentPage="menuSecurity">
      <div className={classes("systemPage")}>
        <div className={classes("systemHeader")}>
          <h1>SYSTEMS CORE</h1>
          <p>Manage your digital identity and reinforce your cryptographic vault layers.</p>
        </div>
        
        <div className={classes("systemLayout")}>
          {/* LEFT SECTION: PROFILE BOX & THEME TOGGLE */}
          <div className={classes("leftCol")}>
            <div className={classes("profileBox")}>
              <div className={classes("avatarWrap")}>
                <img src={userImg} id="avatar" alt="Avatar" />
                <i className={classes("fa-solid fa-pen editIcon")} style={{ cursor: 'pointer' }} />
              </div>
              <p id="username">{username}</p>
              <p id="role">MASTER KEY HOLDER</p>
              
              <div className={classes("inputBox")}>
                <p>PUBLIC IDENTITY</p>
                <input 
                  value={publicId} 
                  onChange={(e) => setPublicId(e.target.value)} 
                />
              </div>
              
              <div className={classes("inputBox")}>
                <p>DISPLAY CURRENCY</p>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="USD ($)">USD ($)</option>
                  <option value="EUR (€)">EUR (€)</option>
                  <option value="ETH (Ξ)">ETH (Ξ)</option>
                </select>
              </div>

              <button 
                className={classes("outlineBtn")} 
                onClick={handleSaveChanges}
                style={{ width: '100%', marginTop: 15, padding: '8px', border: '1px solid cyan', color: 'cyan', background: 'transparent', cursor: 'pointer' }}
              >
                SAVE CONFIGURATION
              </button>
            </div>
            
            <div className={classes("interfaceBox")}>
              <p>Interface Mode</p>
              <div className={classes("modeToggle")} onClick={() => setIsDarkMode(!isDarkMode)} style={{ cursor: 'pointer' }}>
                <i className={classes("fa-solid fa-sun")} style={{ color: !isDarkMode ? '#ffeb3b' : '#6b6b99' }} />
                <div className={`${classes("switch")} ${isDarkMode ? classes("on") : ''}`} />
                <i className={classes("fa-solid fa-moon")} style={{ color: isDarkMode ? '#a64dff' : '#6b6b99' }} />
              </div>
            </div>
          </div>
          
          {/* RIGHT SECTION: HARDENING VULT LAYERS */}
          <div className={classes("rightCol")}>
            <div className={classes("topCards")}>
              <div className={classes("cardBox")}>
                <div className={classes("cardIcon blue")} />
                <p className={classes("cardTitle")}>Dual-Layer Auth</p>
                <p className={classes("cardDesc")}>Secure your transfers with dynamic biometric or authenticator codes.</p>
                <div className={classes("cardBottom")}>
                  <p className={classes("activeText")}>{twoFactor ? "ACTIVE PROTECTION" : "DISABLED"}</p>
                  <div 
                    className={`${classes("switch")} ${twoFactor ? classes("on") : ''}`} 
                    onClick={() => setTwoFactor(!twoFactor)}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
              </div>
              
              <div className={classes("cardBox pinkBorder")}>
                <div className={classes("cardIcon pink")} />
                <p className={classes("cardTitle")}>Recovery Seed</p>
                <p className={classes("cardDesc")}>Your 24-word master key is the only way to recover your assets.</p>
                {showSeed && (
                  <p style={{ fontFamily: 'monospace', color: '#ffb84d', margin: '10px 0', fontSize: 12, wordBreak: 'break-all', background: 'rgba(255, 184, 77, 0.1)', padding: 8, borderRadius: 6 }}>
                    abandon ability able about above absent absorb abstract absurd abuse access accident
                  </p>
                )}
                <button className={classes("outlineBtn")} onClick={() => setShowSeed(!showSeed)}>
                  {showSeed ? "HIDE SEED PHRASE" : "BACKUP REVEAL"}
                </button>
              </div>
            </div>
            
            <div className={classes("passwordBox")}>
              <div className={classes("passTop")}>
                <p>Local Password</p>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {rotateMsg && <span style={{ color: '#ffb84d', fontSize: 10 }}>{rotateMsg}</span>}
                  <button className={classes("small rotateBtn")} onClick={() => {
                    setRotateMsg("Action restricted in demo layer");
                    setTimeout(() => setRotateMsg(""), 2000);
                  }}>
                    ROTATE SECRET KEY
                  </button>
                </div>
              </div>
              <p className={classes("sub")}>Last changed 42 days ago</p>
              <div className={classes("strengthBar")}><div className={classes("fill")} style={{ width: '85%' }} /></div>
              <div className={classes("strengthRow")}>
                <p>SECURITY STRENGTH</p>
                <p className={classes("good")}>OPTIMAL</p>
              </div>
            </div>
            
            <div className={classes("deviceBox")}>
              <p id="first">Connected Nodes</p>
              {devices.map((d) => (
                <div className={classes("device")} key={d.name}>
                  <p>{d.name}</p>
                  {d.action === 'current' ? (
                    <button className={classes("current")}>Current</button>
                  ) : (
                    <button className={classes("revoke")} onClick={() => handleRevokeDevice(d.name)}>REVOKE</button>
                  )}
                </div>
              ))}
              <p className={classes("logout")} onClick={() => setDevices(prev => prev.filter(d => d.action === 'current'))} style={{ cursor: 'pointer' }}>
                LOGOUT OF ALL OTHER SESSIONS
              </p>
            </div>
          </div>
        </div>
        
        {/* DANGER DESTRUCTION ACTION */}
        <div className={classes("dangerBox")}>
          <div>
            <p className={classes("dangerTitle")}>Destruction Protocol</p>
            <p className={classes("dangerDesc")}>Permanently wipe all local wallet data and keys. This action is cryptographic and cannot be reversed.</p>
          </div>
          <button className={classes("wipeBtn")} onClick={handleWipeVault}>Wipe Vault</button>
        </div>
      </div>
    </PageLayout>
  );
};

export default Security;