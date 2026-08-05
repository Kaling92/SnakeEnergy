import React from 'react';
import { useNavigate } from 'react-router-dom';
import userImg from '../assets/user.png';
import styles from '../assets/Homepage.module.css';

const classes = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((name) => (styles as Record<string, string>)[name] ?? name)
    .join(' ');

interface SidebarProps {
  currentPage?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage = '' }) => {
  const navigate = useNavigate();

  const menuItems = [
    { id: 'menuDashboard', icon: 'fa-th',                  label: 'Dashboard',     path: '/Homepage' },
    { id: 'menuAssets',    icon: 'fa-wallet',               label: 'Assets',        path: '/Assets' },
    { id: 'menuSwap',      icon: 'fa-arrow-right-arrow-left', label: 'Swap',        path: '/Swap' },
    { id: 'menuAnalytics', icon: 'fa-chart-line',           label: 'Analytics',     path: '/Analytics' },
    { id: 'menuNFT',       icon: 'fa-gem',                  label: 'NFTs',          path: '/NFT' },
    { id: 'menuTransactions', icon: 'fa-clock-rotate-left', label: 'Transactions',  path: '/Transactions' },
    { id: 'menuNotifications', icon: 'fa-bell',             label: 'Notifications', path: '/Notifications' },
    { id: 'menuSecurity',  icon: 'fa-shield',               label: 'Security',      path: '/Security' },
    { id: 'menuSettings',  icon: 'fa-gear',                 label: 'Settings',      path: '/Settings' },
  ];

  return (
    <div className={classes("left")}>
      <div className={classes("title")}>Snake Energy</div>
      <div className={classes("profile")}>
        <div><img id="userPhoto" src={userImg} alt="User" /></div>
        <div id="userProfile">
          <label>User Profile</label>
          <p id="phoneNumber">0913108937</p>
        </div>
      </div>
      <div className={classes("menu")}>
        {menuItems.map((item) => (
          <div
            key={item.id}
            id={item.id}
            className={`${classes("menuItem")} ${currentPage === item.id ? classes("menuItemActive") : ''}`}
            onClick={() => navigate(item.path)}
            style={{ cursor: 'pointer' }}
          >
            <i className={`fa-solid ${item.icon}`} /> {item.label}
          </div>
        ))}
      </div>
      <button id="logoutBtn" onClick={() => navigate('/Login')}>
        <i className={classes("fa-solid fa-right-from-bracket")} /> <span>Log out</span>
      </button>
    </div>
  );
};

export default Sidebar;
