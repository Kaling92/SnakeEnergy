// @ts-nocheck
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../assets/Login.module.css';
import LanguageToggle from '../components/LanguageToggle';
import { useLanguage } from '../context/LanguageContext';
import { TRANSLATIONS } from '../i18n/translations';

const classes = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((name) => (styles as Record<string, string>)[name] ?? name)
    .join(' ');

const Login = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = TRANSLATIONS[language]?.login || TRANSLATIONS.EN.login;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

const handleLogin = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/login`, {
        username: String(username || '').trim(),
        password
      });
      
      if (res.data.success) {
        // SAVE the token to localStorage so remaining pages can use it for authentication
        localStorage.setItem('token', res.data.token);
        
        navigate('/Homepage');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error connecting to API.');
    }
  };

  return (
    <>
      <div className={classes("auth-body login-page")}>
        <div className={classes("langSwitcher")} style={{ position: 'absolute', top: 20, right: 20 }}>
          <LanguageToggle />
        </div>
        
        <div className={classes("formHead")}>
          <h1>Snake Energy</h1>
          <h2>DECENTRALIZED POWERHOUSE</h2>
        </div>

        <div className={classes("container")}>
          <div className={classes("title")}>{t.title}
             <p id="accessVault">{t.accessVault}</p>
          </div>
         
          
          {/* Wrap internal elements in a form-content area to perfectly control uniform width */}
          <div className={classes("form-content")}>
            
            <div className={classes("loginField")}>{t.identityAccess}</div>
            <div className={classes("input")}>
              <input 
                id="userName" 
                type="text" 
                placeholder={t.emailPlaceholder}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Fixed class name spelling to exactly match CSS */}
            <div className={classes("passwordField")}>
              <p className={classes("loginField")}>{t.accessKey}</p>
              <p className='loginField' id="recover">{t.recover}</p>
            </div>
            
            <div className={classes("input")}>
              <input 
                id="passWord" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

            <button id="connect" className={classes("connect")} onClick={handleLogin}>
              {t.connectWallet} <i className={classes("fa-solid fa-bolt")} />
            </button>

            <div className={classes("socialLogin")}>
              <button id="GG">{t.google}</button>
              <button id="iOS">{t.ios}</button>
            </div>

            <div className={classes("signUp")}>
              <label>{t.newToEnergy}</label>
              <p id="signUp" style={{ cursor: 'pointer' }} onClick={() => navigate('/SignUp')}>{t.initializeAccount}</p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Login;