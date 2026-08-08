// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageLayout from '../components/PageLayout';
import styles from '../assets/AdvancedSettings.module.css'; // Eliminated duplicate style variable clash

const classes = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((name) => (styles as Record<string, string>)[name] ?? name)
    .join(' ');

const Settings = () => {
  const navigate = useNavigate();

  // Network Telemetry Engine States
  const [networkStats, setNetworkStats] = useState({ latency: '24ms', blockHeight: '18,442,109' });

  // Core Configurations Interactive Form State Binding
  const [language, setLanguage] = useState('English (Universal)');
  const [currency, setCurrency] = useState('USD ($)');
  const [motionProfile, setMotionProfile] = useState('Kinetic');
  const [infoDensity, setInfoDensity] = useState('STANDARD');
  const [blurStrength, setBlurStrength] = useState(70);
  const [slippage, setSlippage] = useState(0.5);
  
  // Data Privacy Toggle Toggles State Box
  const [anonymousRpc, setAnonymousRpc] = useState(true);
  const [hideZeroBalances, setHideZeroBalances] = useState(false);
  const [telemetry, setTelemetry] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/Login');
          return;
        }

        const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/users/settings/advanced`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          const s = res.data.settings;
          setLanguage(s.language);
          setCurrency(s.currency);
          setMotionProfile(s.motionProfile);
          setInfoDensity(s.infoDensity);
          setBlurStrength(s.blurStrength);
          setSlippage(s.slippageTolerance);
          setAnonymousRpc(s.anonymousRpc);
          setHideZeroBalances(s.hideZeroBalances);
          setTelemetry(s.telemetry);
          setNetworkStats(res.data.networkTelemetry);
        }
      } catch (err) {
        console.error("Could not load setting configuration array properties:", err);
      }
    };

    fetchSettings();
  }, [navigate]);

  const handleApplyChanges = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/users/settings/advanced`, {
        language,
        displayCurrency: currency,
        motionProfile,
        infoDensity,
        blurStrength,
        slippageTolerance: slippage,
        anonymousRpc,
        hideZeroBalances,
        telemetry
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        alert("Advanced engine matrices applied successfully.");
      }
    } catch (err) {
      console.error("System parameter modification failed:", err);
      alert("Error synchronizing local system parameters.");
    }
  };

  const handleResetDefaults = () => {
    setLanguage('English (Universal)');
    setCurrency('USD ($)');
    setMotionProfile('Kinetic');
    setInfoDensity('STANDARD');
    setBlurStrength(70);
    setSlippage(0.5);
    setAnonymousRpc(true);
    setHideZeroBalances(false);
    setTelemetry(false);
  };

  return (
    <PageLayout currentPage="menuSettings">
      <div className={classes("settingsPanel")}>
        
        {/* OVERHEAD ENGINE METRICS ROW */}
        <div className={classes("headerStats")}>
          <div className={classes("statBox")}>
            <span>NETWORK LATENCY</span>
            <p style={{ color: '#00e0ff' }}>
              <i className={classes("fa-solid fa-circle")} style={{ fontSize: 6, verticalAlign: 'middle', marginRight: 4 }} /> 
              {networkStats.latency}
            </p>
          </div>
          <div className={classes("statBox")}>
            <span>BLOCK HEIGHT</span>
            <p>{networkStats.blockHeight}</p>
          </div>
        </div>
        
        <p className={classes("pageLabel")}>SNAKE ENGINE V2.0.4</p>
        <h1 className={classes("pageTitle")}>Settings</h1>
        
        <div className={classes("settingsGrid")}>
          {/* GENERAL PREFERENCES BLOCK */}
          <div className={classes("col")}>
            <div className={classes("card")}>
              <div className={classes("cardHeader")}>
                <i className={classes("fa-solid fa-earth-americas")} /> 
                <h3>General</h3>
              </div>
              <div className={classes("field")}>
                <label>Display Language</label>
                <select className={classes("select")} value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option value="English (Universal)">English (Universal)</option>
                  <option value="Español">Español</option>
                </select>
              </div>
              <div className={classes("field")}>
                <label>Primary Currency</label>
                <select className={classes("select")} value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="USD ($)">USD ($)</option>
                  <option value="EUR (€)">EUR (€)</option>
                </select>
              </div>
              <div className={classes("field")}>
                <label>RPC Node Strategy</label>
                <div className={classes("rpcOption")}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Auto-Switch (Ultra)</p>
                    <p style={{ fontSize: 10, color: '#00e0ff', margin: 0 }}>
                      <i className={classes("fa-solid fa-circle")} style={{ fontSize: 5 }} /> Optimal latency routing
                    </p>
                  </div>
                  <i className={classes("fa-solid fa-circle-check")} style={{ color: '#00e0ff' }} />
                </div>
              </div>
            </div>
          </div>

          {/* VISUAL LAYOUT & COMPACTNESS DRIVERS */}
          <div className={classes("col")}>
            <div className={classes("card")}>
              <div className={classes("cardHeader")} style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <i className={classes("fa-solid fa-gauge-high")} style={{ color: '#00e0ff' }} /> 
                  <h3>Interface</h3>
                </div>
                <span style={{ fontSize: 9, color: '#00e0ff', border: '1px solid #00e0ff', padding: '2px 8px', borderRadius: 4 }}>VISUAL ENGINE</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30 }}>
                <div>
                  <label style={{ fontSize: 10, color: '#6b6b99', marginBottom: 15, display: 'block' }}>MOTION PROFILE</label>
                  <div className={classes("options")}>
                    <div 
                      className={`${classes("opt")} ${motionProfile === 'Kinetic' ? classes("active") : ''}`}
                      onClick={() => setMotionProfile('Kinetic')}
                      style={{ cursor: 'pointer', position: 'relative' }}
                    >
                      <h5>Kinetic</h5>
                      <span>FULL PARALLAX SHADERS</span>
                      <i className={classes(motionProfile === 'Kinetic' ? "fa-solid fa-circle-dot" : "fa-regular fa-circle")} style={{ position: 'absolute', top: 15, right: 15 }} />
                    </div>
                    <div 
                      className={`${classes("opt")} ${motionProfile === 'Static' ? classes("active") : ''}`}
                      onClick={() => setMotionProfile('Static')}
                      style={{ cursor: 'pointer', position: 'relative' }}
                    >
                      <h5>Static</h5>
                      <span>PERFORMANCE OPTIMIZED</span>
                      <i className={classes(motionProfile === 'Static' ? "fa-solid fa-circle-dot" : "fa-regular fa-circle")} style={{ position: 'absolute', top: 15, right: 15 }} />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label style={{ fontSize: 10, color: '#6b6b99', marginBottom: 15, display: 'block' }}>INFORMATION DENSITY</label>
                  <div className={classes("toggleBar")}>
                    {['COZY', 'STANDARD', 'COMPACT'].map((density) => (
                      <button 
                        key={density}
                        className={infoDensity === density ? classes("active") : ''}
                        onClick={() => setInfoDensity(density)}
                      >
                        {density}
                      </button>
                    ))}
                  </div>
                  <div style={{ marginTop: 25, background: 'rgba(0,0,0,0.2)', padding: 15, borderRadius: 12 }}>
                    <p style={{ fontSize: 11, marginBottom: 10 }}>
                      <i className={classes("fa-solid fa-layer-group")} /> Glass Blur Strength ({blurStrength}%)
                    </p>
                    <input 
                      type="range" 
                      min={10} 
                      max={100} 
                      value={blurStrength} 
                      onChange={(e) => setBlurStrength(parseInt(e.target.value))} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* LOWER INTERACTIVE SUBGRID: TRANSACTION ENGINE & PRIVACY SECTOR */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className={classes("card")}>
                <div className={classes("cardHeader")}>
                  <i className={classes("fa-solid fa-bolt")} style={{ color: '#ff4d6d' }} /> 
                  <h3>Transaction Core</h3>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 10 }}>
                  <span>Slippage Tolerance</span>
                  <span style={{ color: '#ff4d6d', fontWeight: 'bold' }}>{slippage}%</span>
                </div>
                <input 
                  type="range" 
                  min={1} 
                  max={50} 
                  value={slippage * 10} 
                  onChange={(e) => setSlippage(parseFloat(e.target.value) / 10)}
                  style={{ accentColor: '#ff4d6d', marginBottom: 20, width: '100%' }} 
                />
                <div className={classes("toggleBar")}>
                  <button>AUTO</button>
                  <button className={classes("active")} style={{ color: '#ff4d6d' }}>FAST</button>
                  <button>PRO</button>
                </div>
              </div>

              <div className={classes("card")}>
                <div className={classes("cardHeader")}>
                  <i className={classes("fa-solid fa-shield-halved")} /> 
                  <h3>Data Privacy</h3>
                </div>
                {[
                  { label: 'Anonymous RPC', val: anonymousRpc, set: setAnonymousRpc },
                  { label: 'Hide Zero Balances', val: hideZeroBalances, set: setHideZeroBalances },
                  { label: 'Telemetry', val: telemetry, set: setTelemetry }
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#6b6b99' }}>{item.label}</span>
                    <div 
                      className={`${classes("switch")} ${item.val ? classes("on") : ''}`} 
                      onClick={() => item.set(!item.val)}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* REINFORCED PREFERENCE SAVE ACTIONS FOOTER */}
        <div className={classes("footer")}>
          <div className={classes("note")}>
            <i className={classes("fa-solid fa-circle-info")} /> 
            <p>Changing advanced settings may affect transaction speed and success rate.</p>
          </div>
          <div className={classes("btns")}>
            <button className={classes("btnText")} onClick={handleResetDefaults}>RESET DEFAULT</button>
            <button className={classes("btnMain")} onClick={handleApplyChanges}>APPLY CHANGES</button>
          </div>
        </div>

      </div>
    </PageLayout>
  );
};

export default Settings;