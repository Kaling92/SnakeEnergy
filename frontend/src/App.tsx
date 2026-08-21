// @ts-nocheck
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { WalletProvider } from './context/WalletContext'

import Homepage from './pages/Homepage'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import NFT from './pages/NFT'
import Assets from './pages/Assets'
import ExploreVaults from './pages/ExploreVaults'
import Analytics from './pages/Analytics'
import Search from './pages/Search'
import Notifications from './pages/Notifications'
import Receive from './pages/Receive'
import Security from './pages/Security'
import Send from './pages/Send'
import Settings from './pages/Settings'
import Swap from './pages/Swap'
import Transactions from './pages/Transactions'
import Wallet from './pages/Wallet'
import WalletSuccess from './pages/WalletSuccess'

function App() {
  return (
    <WalletProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/Login" />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/Homepage" element={<Homepage />} />
        <Route path="/NFT" element={<NFT />} />
        <Route path="/Assets" element={<Assets />} />
        <Route path="/ExploreVaults" element={<ExploreVaults />} />
        <Route path="/Analytics" element={<Analytics />} />
        <Route path="/Search" element={<Search />} />
        <Route path="/Notifications" element={<Notifications />} />
        <Route path="/Receive" element={<Receive />} />
        <Route path="/Security" element={<Security />} />
        <Route path="/Send" element={<Send />} />
        <Route path="/Settings" element={<Settings />} />
        <Route path="/Swap" element={<Swap />} />
        <Route path="/Transactions" element={<Transactions />} />
        <Route path="/Wallet" element={<Wallet />} />
        <Route path="/WalletSuccess" element={<WalletSuccess />} />
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/Login" />} />
      </Routes>
    </Router>
    </WalletProvider>
  )
}

export default App
