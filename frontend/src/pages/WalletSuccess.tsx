// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../assets/WalletSuccess.module.css';

const classes = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((name) => (styles as Record<string, string>)[name] ?? name)
    .join(' ');

// Language Translation Mapping Resource
const TRANSLATIONS = {
  EN: {
    headerTitle: "Wallet Created Success",
    status: "STATUS",
    energized: "ENERGIZED",
    title: "Wallet Initialized",
    subtitle: "The Ouroboros core has stabilized. Your digital identity is now anchored to the Snake Energy network.",
    primaryAddress: "PRIMARY ADDRESS",
    encrypted: "ENCRYPTED ON L2",
    initialEnergy: "INITIAL ENERGY",
    enterBtn: "Enter the Dashboard",
    protocol: "SECURITY PROTOCOL: ALPHA-SIGMA-9 SECURE",
    node: "OUROBOROS NODE CONNECTED"
  },
  VI: {
    headerTitle: "Tạo Ví Thành Công",
    status: "TRẠNG THÁI",
    energized: "KÍCH HOẠT",
    title: "Khởi Tạo Ví Hoàn Tất",
    subtitle: "Lõi Ouroboros đã ổn định. Danh tính kỹ thuật số của bạn hiện đã được neo vào mạng lưới Năng lượng Rắn.",
    primaryAddress: "ĐỊA CHỈ CHÍNH",
    encrypted: "ĐÃ MÃ HÓA TRÊN L2",
    initialEnergy: "NĂNG LƯỢNG BAN ĐẦU",
    enterBtn: "Vào Bảng Điều Khiển",
    protocol: "GIAO THỨC BẢO MẬT: KHÓA ALPHA-SIGMA-9",
    node: "ĐÃ KẾT NỐI NÚT OUROBOROS"
  }
};

const WalletSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Safe extraction of actual address passed from login/registration forms routing context
  const walletAddress = location.state?.address || "0x71C23...3a4b";

  // Reactive Internationalization (i18n) Engine Hooks
  const [lang, setLang] = useState<'EN' | 'VI'>('EN');
  const t = TRANSLATIONS[lang];

  // Reactive Clock Cycle Architecture
  const [systemTime, setSystemTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setSystemTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0].replace(/-/g, '/');
  };

  const formatTime = (date: Date) => {
    return date.toISOString().split('T')[1].substring(0, 8);
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'EN' ? 'VI' : 'EN');
  };

  const handleEnterDashboard = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/Login');
      return;
    }
    navigate('/Homepage');
  };

  return (
    <div className={classes("app-body")}>
      {/* LANGUAGE SWITCHER CONTROLLER */}
      <div className={classes("langSwitcher")} style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
        <button id="languageToggle" onClick={toggleLanguage} style={{ cursor: 'pointer' }}>
          {lang === 'EN' ? 'VI' : 'EN'}
        </button>
      </div>

      {/* HEADER SECTION */}
      <div className={classes("header")}>
        <div className={classes("header-left")}>
          <i className={classes("fa-solid fa-wallet")} /> <span>{t.headerTitle}</span>
        </div>
        <div className={classes("header-right")}>
          <span>SYSTEM TIME</span><br />
          <span>
            <span>{formatDate(systemTime)}</span> // <span>{formatTime(systemTime)}</span> UTC
          </span>
        </div>
      </div>

      {/* STABILIZATION ORB CORE INTERFACE */}
      <div className={classes("main-content")}>
        <div className={classes("dashed-circle")} />
        <div className={classes("orb-container")}>
          <div className={classes("orb")} />
          <div className={classes("status-badge")}>
            <span style={{ color: '#777799', fontWeight: 'normal' }}>{t.status}</span>
            <span>{t.energized}</span>
          </div>
        </div>
        <div className={classes("title")}>{t.title}</div>
        <div className={classes("subtitle")}>{t.subtitle}</div>

        {/* METADATA SUMMARY CARDS */}
        <div className={classes("cards-container")}>
          <div className={classes("info-card")}>
            <h3>{t.primaryAddress}</h3>
            {/* Direct structural reference substitution */}
            <div className={classes("value")}>{walletAddress}</div> 
            <div className={classes("sub-value")}>
              <i className={classes("fa-solid fa-shield-halved")} /> {t.encrypted}
            </div>
          </div>
          <div className={classes("info-card")}>
            <h3>{t.initialEnergy}</h3>
            <div className={classes("value")}>0.00 <span>SNK</span></div>
            <div className={classes("progress-bar")}><div className={classes("fill")} style={{ width: '0%' }} /></div>
          </div>
        </div>

        {/* STEPPING DASHBOARD ROUTING TRIGGER */}
        <div className={classes("actions")}>
          <button className={classes("btn-primary")} onClick={handleEnterDashboard}>
            {t.enterBtn} <i className={classes("fa-solid fa-arrow-right")} style={{ marginLeft: 8 }} />
          </button>
        </div>
      </div>

      {/* SYSTEM SECURITY COMPLIANCE METRICS FOOTER */}
      <div className={classes("footer")}>
        <span>{t.protocol}</span>
      </div>
      <div className={classes("footer-left")}>
        <div className={classes("dot active")} />
        <div className={classes("dot active")} />
        <div className={classes("dot")} />
        <span>{t.node}</span>
      </div>
    </div>
  );
};

export default WalletSuccess;