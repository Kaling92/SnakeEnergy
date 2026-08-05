// @ts-nocheck
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import apiClient from '../api/apiClient';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserInfo {
  id: string;
  username: string;
  email: string;
}

interface Asset {
  tokenSymbol: string;
  balance: number;
  availableBalance: number;
  network: string;
}

interface Transaction {
  _id?: string;
  txHash: string;
  senderAddress: string;
  receiverAddress: string;
  amount: number;
  tokenSymbol: string;
  transactionType: string;
  status: string;
  timestamp: string;
}

interface WalletContextValue {
  // State
  user: UserInfo | null;
  walletAddress: string;
  assets: Asset[];
  transactions: Transaction[];
  loading: boolean;
  assetsLoading: boolean;
  error: string;

  // Actions
  refreshAssets: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const WalletContext = createContext<WalletContextValue>(null);

const POLL_INTERVAL_MS = 10000; // 10 seconds

// ─── Provider ─────────────────────────────────────────────────────────────────

export function WalletProvider({ children }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [error, setError] = useState('');

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Restore user from localStorage on mount ──────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('wallet_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        // ignore malformed saved user
      }
    }
  }, []);

  // ─── Fetch assets ─────────────────────────────────────────────────
  const refreshAssets = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setAssetsLoading(true);
    try {
      const res = await apiClient.get('/api/wallet/assets');
      if (res.data?.success && Array.isArray(res.data.assets)) {
        const normalized = res.data.assets.map((a: any) => ({
          tokenSymbol: String(a.tokenSymbol || a.symbol || a.short || '').toUpperCase(),
          balance: parseFloat(a.balance ?? a.value ?? 0),
          availableBalance: parseFloat(a.availableBalance ?? a.balance ?? 0),
          network: a.network || 'ethereum',
          ...a
        }));
        setAssets(normalized);
      }
    } catch (err) {
      console.error('[WalletContext] refreshAssets failed:', err?.message);
    } finally {
      setAssetsLoading(false);
    }
  }, []);

  // ─── Fetch transactions ───────────────────────────────────────────
  const refreshTransactions = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await apiClient.get('/api/transactions', {
        params: { limit: 10, page: 1 }
      });
      if (res.data?.success && Array.isArray(res.data.transactions)) {
        setTransactions(res.data.transactions);
      }
    } catch (err) {
      console.error('[WalletContext] refreshTransactions failed:', err?.message);
    }
  }, []);

  // ─── Fetch dashboard (address + summary) ──────────────────────────
  const refreshDashboard = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await apiClient.get('/api/wallet/dashboard');
      if (res.data?.success) {
        if (res.data.assets?.[0]?.address) {
          setWalletAddress(res.data.assets[0].address);
        }
        if (Array.isArray(res.data.transactions)) {
          setTransactions(res.data.transactions);
        }
      }
    } catch (err) {
      console.error('[WalletContext] refreshDashboard failed:', err?.message);
    }
  }, []);

  // ─── Start/stop 10-second asset polling ───────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Immediate first fetch
    refreshAssets();
    refreshDashboard();

    pollIntervalRef.current = setInterval(() => {
      refreshAssets();
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [refreshAssets, refreshDashboard]);

  // ─── Login ────────────────────────────────────────────────────────
  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.post('/api/login', { username, password });
      if (res.data?.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('wallet_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        await refreshAssets();
        await refreshDashboard();
      } else {
        throw new Error(res.data?.message || 'Login failed.');
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Login error.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [refreshAssets, refreshDashboard]);

  // ─── Logout ───────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('wallet_user');
    setUser(null);
    setWalletAddress('');
    setAssets([]);
    setTransactions([]);
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const isAuthenticated = useCallback(() => {
    return Boolean(localStorage.getItem('token'));
  }, []);

  return (
    <WalletContext.Provider value={{
      user,
      walletAddress,
      assets,
      transactions,
      loading,
      assetsLoading,
      error,
      refreshAssets,
      refreshTransactions,
      refreshDashboard,
      login,
      logout,
      isAuthenticated
    }}>
      {children}
    </WalletContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside <WalletProvider>');
  return ctx;
}

export default WalletContext;
