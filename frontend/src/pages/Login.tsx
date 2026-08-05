// @ts-nocheck
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../assets/Login.module.css';

const classes = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((name) => (styles as Record<string, string>)[name] ?? name)
    .join(' ');

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
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
          <button id="languageToggle">VI</button>
        </div>
        
        <div className={classes("formHead")}>
          <h1>Snake Energy</h1>
          <h2>DECENTRALIZED POWERHOUSE</h2>
        </div>

        <div className={classes("container")}>
          <div className={classes("title")} data-i18n="loginTitle">Secure Sign In
             <p id="accessVault" data-i18n="accessVault">Access your kinetic assets vault</p>
          </div>
         
          
          {/* Wrap internal elements in a form-content area to perfectly control uniform width */}
          <div className={classes("form-content")}>
            
            <div className={classes("loginField")} data-i18n="identityAccess">IDENTITY ACCESS</div>
            <div className={classes("input")}>
              <input 
                id="userName" 
                type="text" 
                placeholder="Email or Username" 
                data-i18n="emailOrUsername"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Fixed class name spelling to exactly match CSS */}
            <div className={classes("passwordField")}>
              <p className={classes("loginField")}>ACCESS KEY</p>
              <p className='loginField' id="recover">RECOVER</p>
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

            <button id="connect" className={classes("connect")} data-i18n="connectWallet" onClick={handleLogin}>
              CONNECT WALLET <i className={classes("fa-solid fa-bolt")} />
            </button>

            <div className={classes("socialLogin")}>
              <button id="GG" data-i18n="google">GOOGLE</button>
              <button id="iOS" data-i18n="ios">iOS</button>
            </div>

            <div className={classes("signUp")}>
              <label data-i18n="newToEnergy">New to the energy?</label>
              <p id="signUp" style={{ cursor: 'pointer' }} onClick={() => navigate('/SignUp')} data-i18n="initializeAccount">Initialize account</p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Login;