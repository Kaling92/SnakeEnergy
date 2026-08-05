// @ts-nocheck
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../assets/SignUp.module.css';

const classes = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((name) => (styles as Record<string, string>)[name] ?? name)
    .join(' ');

const SignUp = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [vaultKey, setVaultKey] = useState('');
  const [confirmKey, setConfirmKey] = useState('');
  const [acknowledge, setAcknowledge] = useState(false);

  const handleSignUp = async () => {
    if (!fullName || !email || !vaultKey || !confirmKey) {
      alert("Please fill in all fields.");
      return;
    }

    if (vaultKey !== confirmKey) {
      alert("Passwords do not match.");
      return;
    }

    if (!acknowledge) {
      alert("Please acknowledge the policy terms.");
      return;
    }

   try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', { 
        username: email, 
        password: vaultKey, 
        fullName 
      });
      
      if (res.data.success) {
        // Immediately establish a session so protected pages can load after WalletSuccess
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
          username: email,
          password: vaultKey
        });
        if (loginRes.data?.success && loginRes.data?.token) {
          localStorage.setItem('token', loginRes.data.token);
        }
        alert("Account created successfully!");
        navigate('/WalletSuccess');
      } else {
        alert("Signup failed: " + res.data.message);
      }
    } catch (err: any) {
      console.error(err);
      const message = err?.response?.data?.message || "Error connecting to API.";
      alert("Signup failed: " + message);
    }
  };

  return (
    <>
      <div className={classes("langSwitcher")} style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <button id="languageToggle">VI</button>
      </div>

      <div className={classes("left")}>
        <div className={classes("formHeader")}>Snake Energy</div>
        <p data-i18n="protectWallet">Protect your wallet</p>
        <div className={classes("seedSecurity")}>
          <h2 data-i18n="seedSecurityTitle">Seed Phrase Security</h2>
          <p data-i18n="seedSecurityDesc">
            Your recovery phrase is the master key to your assets. Never share it
            with anyone else. Snake energy will never ask for your recovery phrase
            in any support interaction.
          </p>
        </div>
      </div>

      <div className={classes("right")}>
        <div className={classes("container")}>
          
          <div className={classes("signUp")}>
            <div className={classes("signUpField")} data-i18n="fullName">FULL NAME</div>
            <input id="fullName" type="text" placeholder="Satoshi Nakamoto" value={fullName} onChange={e => setFullName(e.target.value)} />
          </div>
          
          <div className={classes("signUp")}>
            <div className={classes("signUpField")} data-i18n="etherEmail">ETHER EMAIL</div>
            <input id="email" type="email" placeholder="snake@gmail.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          
          <div className={classes("signUp")}>
            <div className={classes("signUpField")} data-i18n="vaultKey">VAULT KEY</div>
            <input id="vaulKey" type="password" value={vaultKey} onChange={e => setVaultKey(e.target.value)} />
          </div>
          
          <div className={classes("signUp")}>
            <div className={classes("signUpField")} data-i18n="confirmKey">CONFIRM KEY</div>
            <input id="confirmKey" type="password" value={confirmKey} onChange={e => setConfirmKey(e.target.value)} />
          </div>
          
          <div className={classes("acknowledge")}>
            <input id="acknowledge" type="checkbox" checked={acknowledge} onChange={e => setAcknowledge(e.target.checked)} />
            <span data-i18n="ack1">I acknowledge that I have read the </span>
            <label id="policy" data-i18n="policyTerms">Policy Terms</label>
            <span data-i18n="ack2"> and understand that my private keys are my sole responsibility.</span>
          </div>
          
          <button id="createWallet" data-i18n="createWallet" onClick={handleSignUp}>
            Create Wallet
            <i className={classes("fa-solid fa-bolt")}></i>
          </button>
          
          <div className={classes("login")}>
            <p data-i18n="alreadySynchronized">Already synchornized?</p>
            <label id="login" onClick={() => navigate('/Login')} data-i18n="loginToVault" style={{ cursor: 'pointer' }}>Login to Vault</label>
          </div>
        </div>
        <p className={classes("subDes")} data-i18n="securingFuture">SECURING THE FUTURE OF DECENTRALIZED ENERGY</p>
      </div>
    </>
  );
};

export default SignUp;