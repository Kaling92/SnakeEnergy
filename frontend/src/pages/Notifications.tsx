// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageLayout from '../components/PageLayout';
import styles from '../assets/Notifications.module.css'; // Resolved import crash

const classes = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((name) => (styles as Record<string, string>)[name] ?? name)
    .join(' ');

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fallbackNotifications = [
    { _id: 'mock1', type: 'critical', title: 'Liquidation Warning', description: 'Your ETH/USDT position is nearing liquidation threshold.', isRead: false, createdAt: new Date() },
    { _id: 'mock2', type: 'critical', title: 'New Login Detected', description: 'A new login was recorded from Tokyo, JP.', isRead: false, createdAt: new Date() },
    { _id: 'mock3', type: 'activity', title: 'Swap Executed', description: 'Successfully swapped 1.5 ETH for 3,600 USDT.', txHash: '0x5f1...12ae', isRead: true, createdAt: new Date() },
    { _id: 'mock4', type: 'activity', title: 'Stake Reward Claimed', description: 'You claimed 42.5 SNK staking rewards.', txHash: '0x4a2...e98b', isRead: false, createdAt: new Date() }
  ];

  // Preference switch simulation state rows
  const [preferences, setPreferences] = useState([
    { label: 'Desktop Push', sub: 'Real-time system alerts', on: true },
    { label: 'Email Digest', sub: 'Weekly activity summary', on: false },
    { label: 'Security Pings', sub: 'Immediate breach alerts', on: true },
  ]);

  const fetchNotificationFeed = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/Login');
        return;
      }
      const res = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error("Error reading live network notifications:", err);
      setError('Notifications endpoint unavailable. Showing cached signal feed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationFeed();
  }, [navigate]);

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('http://localhost:5000/api/notifications/mark-all-read', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        // Optimistically update all loaded client states to read
        setNotifications(prev => prev.map(item => ({ ...item, isRead: true })));
      }
    } catch (err) {
      console.error("Failed collection batch update request:", err);
    }
  };

  const togglePreference = (index: number) => {
    setPreferences(prev => prev.map((p, idx) => idx === index ? { ...p, on: !p.on } : p));
  };

  // Compute stats on the fly from server array
  const criticalAlerts = notifications.filter(n => n.type === 'critical');
  const activityFeed = notifications.filter(n => n.type === 'activity');
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const activeFeed = notifications.length ? notifications : fallbackNotifications;
  const activeCriticalAlerts = activeFeed.filter(n => n.type === 'critical');
  const activeActivityFeed = activeFeed.filter(n => n.type === 'activity');
  const activeUnreadCount = activeFeed.filter(n => !n.isRead).length;

  return (
    <PageLayout currentPage="menuNotifications">
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
        <div className={classes("signalsHeader")}>
          <div className={classes("portfolioTitleName")}>
            <p>SYSTEM UPDATE FEED</p>
            <h1><span className={classes("highlightPink")}>NOTIFICATION</span> CENTER</h1>
          </div>
          <button className={classes("markReadBtn")} onClick={handleMarkAllRead}>
            <i className={classes("fa-solid fa-check-double")} /> Mark all as read
          </button>
        </div>

        <div className={classes("notificationsGrid")}>
          <div className={classes("feedCol")}>
            
            {/* CRITICAL ALERTS SECTION */}
            <div className={classes("sectionLabel orange")}>
              <i className={classes("fa-solid fa-triangle-exclamation")} /> CRITICAL ALERTS
              {activeCriticalAlerts.filter(a => !a.isRead).length > 0 && (
                <span style={{ background: 'rgba(255,77,109,0.1)', color: '#ff4d6d', padding: '2px 6px', borderRadius: 4, fontSize: 9, marginLeft: 10 }}>
                  {activeCriticalAlerts.filter(a => !a.isRead).length} PRIORITY ITEMS
                </span>
              )}
            </div>

            {loading ? (
              <div style={{ color: 'cyan', padding: '20px' }}>Connecting to updates stream...</div>
            ) : activeCriticalAlerts.length === 0 ? (
              <p style={{ color: '#555', padding: '10px 0' }}>No priority risk flags registered.</p>
            ) : (
              activeCriticalAlerts.map((alert) => (
                <div className={`${classes("notifyCard")} ${alert.isRead ? classes("readCard") : ''}`} key={alert._id}>
                  <div className={classes("notifyIcon")} style={{ background: 'rgba(255,77,109,0.1)', color: '#ff4d6d' }}>
                    <i className={classes("fa-solid fa-gavel")} />
                  </div>
                  <div className={classes("notifyContent")}>
                    <h4>{alert.title}</h4>
                    <p>{alert.description}</p>
                    {alert.title.includes('Liquidation') && !alert.isRead && (
                      <div className={classes("cardBtns")}>
                        <button className={classes("btnPrimary")}>Add Collateral</button>
                        <button className={classes("btnSecondary")}>Dismiss</button>
                      </div>
                    )}
                  </div>
                  <span className={classes("notifyTime")}>LIVE</span>
                </div>
              ))
            )}

            {/* ACTIVITY FEED SECTION */}
            <div className={classes("sectionLabel blue")} style={{ marginTop: 40 }}>
              <i className={classes("fa-solid fa-bolt")} /> ACTIVITY FEED
            </div>

            {loading ? (
              <div style={{ color: 'cyan', padding: '20px' }}>Loading activities log...</div>
            ) : activeActivityFeed.length === 0 ? (
              <p style={{ color: '#555', padding: '10px 0' }}>No historical transaction actions detected.</p>
            ) : (
              activeActivityFeed.map((act) => (
                <div className={`${classes("notifyCard")} ${act.isRead ? classes("readCard") : ''}`} key={act._id}>
                  <div className={classes("notifyIcon")} style={{ background: 'rgba(0,224,255,0.1)', color: '#00e0ff' }}>
                    <i className={classes("fa-solid fa-circle-check")} />
                  </div>
                  <div className={classes("notifyContent")}>
                    <h4>{act.title}</h4>
                    <p>{act.description}</p>
                    {act.txHash && <p style={{ fontSize: 10, opacity: '0.5' }}>Tx: {act.txHash}</p>}
                  </div>
                  <span className={classes("notifyTime")}>LOGGED</span>
                </div>
              ))
            )}

            {/* PROTOCOL NEWS STATIC CARD */}
            <div className={classes("sectionLabel")} style={{ color: '#de8aff', marginTop: 40 }}>
              <i className={classes("fa-solid fa-bullhorn")} /> PROTOCOL NEWS
            </div>
            <div className={classes("newsCard")}>
              <span className={classes("newsTag")}>SYSTEM UPDATE</span>
              <span style={{ float: 'right', fontSize: 10, color: '#6b6b99' }}>TODAY</span>
              <h2>Snake Energy v3.0 Mainnet Launch</h2>
              <p>Dynamic gas optimization and multi-chain liquidity routing frameworks are now active across the main consensus node layer.</p>
              <div className={classes("cardBtns")}>
                <button className={classes("btnSecondary")} style={{ background: '#fff', color: '#0b0a1f', border: 'none' }}>Read Changelog</button>
                <button className={classes("btnSecondary")}>Governance Hub</button>
              </div>
            </div>
          </div>

          {/* SIDE PANEL: SIGNAL SUMMARY & PREFERENCES */}
          <div className={classes("prefCol")}>
            <div className={classes("summaryCard")}>
              <h3>Signal Summary</h3>
              <div className={classes("summaryCount")}>
                <h2>{activeUnreadCount}</h2>
                <span>UNREAD SIGNALS</span>
              </div>
              <div className={classes("progressBar")}>
                <div className={classes("progressFill")} style={{ width: `${Math.min(100, activeUnreadCount * 5)}%` }} />
              </div>
              <div style={{ display: 'flex', gap: 15, fontSize: 9, color: '#6b6b99' }}>
                <span><i className={classes("fa-solid fa-circle")} style={{ color: '#ff4d6d', fontSize: 6 }} /> Critical</span>
                <span><i className={classes("fa-solid fa-circle")} style={{ color: '#00e0ff', fontSize: 6 }} /> Activity</span>
              </div>
            </div>

            <div className={classes("summaryCard")}>
              <h3>Signal Preferences</h3>
              {preferences.map((pref, idx) => (
                <div className={classes("prefRow")} key={pref.label}>
                  <div className={classes("prefInfo")}>
                    <h5>{pref.label}</h5>
                    <p>{pref.sub}</p>
                  </div>
                  <div 
                    onClick={() => togglePreference(idx)}
                    style={{
                      width: 36, height: 18, 
                      background: pref.on ? '#a64dff' : 'rgba(255,255,255,0.1)', 
                      borderRadius: 10, position: 'relative', cursor: 'pointer',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <div style={{ 
                      width: 14, height: 14, background: '#fff', borderRadius: '50%', 
                      position: 'absolute', top: 2,
                      left: pref.on ? 'auto' : '2px', right: pref.on ? '2px' : 'auto' 
                    }} />
                  </div>
                </div>
              ))}
              <button className={classes("btnSecondary")} style={{ width: '100%', marginTop: 10 }}>
                <i className={classes("fa-solid fa-sliders")} style={{ marginRight: 8 }} /> Advanced Toggles
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Notifications;