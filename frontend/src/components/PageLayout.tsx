import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import styles from '../assets/Homepage.module.css';
import LanguageToggle from './LanguageToggle';

const classes = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((name) => (styles as Record<string, string>)[name] ?? name)
    .join(' ');

interface PageLayoutProps {
  currentPage?: string;
  topNotice?: React.ReactNode;
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ currentPage, topNotice, children }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/Search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className={classes("app-body")}>
      <Sidebar currentPage={currentPage} />
      <div className={classes("layoutRight")}>
        {/* Shared top header */}
        <div className={classes("layoutRightHeader")}>
          <div className={classes("layoutRightHeaderLeft")}>
            <input id="searchBar" type="text" placeholder="Search Assets, NFTs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearchKey} />
            <div className={classes("langSwitcher")}>
              <LanguageToggle />
            </div>
          </div>
          <div className={classes("layoutRightHeaderRight")}>
            <div className={classes("layoutHeaderRightButton")}>
              <button id="receive" onClick={() => navigate('/Receive')}>Receive</button>
              <button id="send" onClick={() => navigate('/Send')}>Send</button>
            </div>
            <div className={classes("layoutBell")} onClick={() => navigate('/Notifications')} style={{ cursor: 'pointer' }}>
              <i className={classes("fa-solid fa-bell")} />
            </div>
            <div className={classes("layoutWallet")} onClick={() => navigate('/Wallet')} style={{ cursor: 'pointer' }}>
              <i className={classes("fa-solid fa-wallet")} />
            </div>
          </div>
        </div>
        {topNotice ? <div className={classes("layoutPageTopNotice")}>{topNotice}</div> : null}
        {/* Page-specific content */}
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
