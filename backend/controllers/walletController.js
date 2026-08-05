const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { ethers } = require('ethers');
const axios = require('axios');

let marketDataCache = null;
let lastFetchTime = 0;
const CACHE_TTL = 60 * 1000; // 60 seconds

async function fetchLiveMarketData() {
  const now = Date.now();
  if (marketDataCache && (now - lastFetchTime < CACHE_TTL)) {
    return marketDataCache;
  }
  try {
    const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false';
    const response = await axios.get(url);
    marketDataCache = response.data;
    lastFetchTime = now;
    return marketDataCache;
  } catch (error) {
    console.error('Failed to fetch live market data, returning fallback/cached data:', error.message);
    return marketDataCache || [
      { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 2700, price_change_percentage_24h: 2.4, market_cap: 320000000000, image: '' },
      { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 65000, price_change_percentage_24h: -1.2, market_cap: 1200000000000, image: '' },
      { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 145.2, price_change_percentage_24h: 5.8, market_cap: 65000000000, image: '' },
      { id: 'cardano', symbol: 'ada', name: 'Cardano', current_price: 0.38, price_change_percentage_24h: 0.5, market_cap: 13000000000, image: '' },
      { id: 'binancecoin', symbol: 'bnb', name: 'BNB', current_price: 580.1, price_change_percentage_24h: 1.1, market_cap: 89000000000, image: '' },
      { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', current_price: 0.12, price_change_percentage_24h: -4.3, market_cap: 17000000000, image: '' }
    ];
  }
}

const TOKEN_TO_CHAIN = {
  ETH: 'ethereum',
  BTC: 'bitcoin',
  BNB: 'ethereum',
  SOL: 'solana'
};

const CHAIN_TO_ID = {
  ethereum: 1,
  bitcoin: 0,
  solana: 101
};

function findTokenBalance(wallet, token) {
  const item = (wallet.balances || []).find((b) => b.token.toUpperCase() === token);
  return item ? item.amount : 0;
}

function upsertTokenBalance(wallet, token, nextAmount) {
  const existing = (wallet.balances || []).find((b) => b.token.toUpperCase() === token);
  if (existing) {
    existing.amount = nextAmount;
    return;
  }
  wallet.balances.push({ token, amount: nextAmount });
}

const FUNDABLE_TOKENS = new Set(['ETH', 'BTC', 'BNB', 'SOL']);

exports.fundWallet = async (req, res) => {
  try {
    const userId = req.user.userId;
    const tokenSymbol = String(req.body?.tokenSymbol || 'ETH').toUpperCase();
    const amount = parseFloat(req.body?.amount);

    if (!FUNDABLE_TOKENS.has(tokenSymbol)) {
      return res.status(400).json({ success: false, message: 'tokenSymbol must be one of ETH, BTC, BNB, SOL.' });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'amount must be greater than 0.' });
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found for authenticated user.' });
    }

    const prev = findTokenBalance(wallet, tokenSymbol);
    const next = prev + amount;
    upsertTokenBalance(wallet, tokenSymbol, next);
    await wallet.save();

    const receiverAddress = String(wallet.address || wallet.publicAddress || '').toLowerCase();
    const txHash = ethers.hexlify(ethers.randomBytes(32));
    const network = TOKEN_TO_CHAIN[tokenSymbol] || 'ethereum';

    const transactionRecord = await Transaction.create({
      txHash,
      idempotencyKey: txHash,
      senderAddress: '0x000000000000000000000000000000000000faucet',
      receiverAddress,
      chainId: CHAIN_TO_ID[network] ?? 1,
      network,
      amount,
      tokenSymbol,
      transactionType: 'RECEIVE',
      status: 'SUCCESS',
      feeAmount: 0,
      feeToken: tokenSymbol,
      confirmations: 1,

      // Compatibility fields
      userId,
      walletAddress: receiverAddress,
      blockchain: network,
      fromAddress: '0x000000000000000000000000000000000000faucet',
      toAddress: receiverAddress,
      cryptoSymbol: tokenSymbol,
      timestamp: new Date(),
      title: 'Wallet Funding',
      subtitle: `Received ${amount} ${tokenSymbol} from test faucet`,
      txType: 'receive',
      assetProtocol: tokenSymbol,
      amountSub: '',
      impact: null,
      impactSub: null
    });

    return res.status(200).json({
      success: true,
      message: `Funded ${amount} ${tokenSymbol} successfully.`,
      tokenSymbol,
      amount,
      previousBalance: prev,
      updatedBalance: next,
      txHash,
      transaction: transactionRecord
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createWallet = async (req, res) => {
  try {
    const { blockchain = 'ethereum' } = req.body;
    const userId = req.user.userId;

    const existing = await Wallet.findOne({ userId, blockchain });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Wallet already exists for this chain.',
        address: existing.address
      });
    }

    const walletInfo = ethers.Wallet.createRandom();

    const newWallet = new Wallet({
      userId,
      blockchain,
      address: walletInfo.address,
      label: `${blockchain.toUpperCase()} Primary Wallet`,
      balances: []
    });

    await newWallet.save();

    res.status(201).json({
      success: true,
      message: 'Wallet generated!',
      address: walletInfo.address,
      mnemonic: walletInfo.mnemonic.phrase
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getWallets = async (req, res) => {
  try {
    const userId = req.user.userId;
    const wallets = await Wallet.find({ userId });
    res.status(200).json({ success: true, wallets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.userId;
    const wallets = await Wallet.find({ userId });

    const recentTransactions = await Transaction.find({ userId })
      .sort({ timestamp: -1 })
      .limit(4);

    let totalPortfolioBalance = 0;
    const marketData = await fetchLiveMarketData();

    let formattedAssets = [];
    wallets.forEach((wallet) => {
      // If wallet has balances, map them all
      if (wallet.balances && wallet.balances.length > 0) {
        wallet.balances.forEach((bal) => {
          const coinSymbol = (bal.token || '').toUpperCase();
          const balanceAmount = bal.amount || 0;
          const coin = marketData.find(c => (c.symbol || '').toUpperCase() === coinSymbol) || marketData[0];
          
          const fiatValue = balanceAmount * (coin.current_price || 0);
          const change = coin.price_change_percentage_24h || 0;
          const trendingChange = change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;

          totalPortfolioBalance += fiatValue;

          formattedAssets.push({
            id: `${wallet._id}-${coinSymbol}`,
            name: coin.name || coinSymbol,
            symbol: coinSymbol,
            address: wallet.address,
            balance: balanceAmount,
            fiatValue,
            trending: trendingChange
          });
        });
      } else {
        // Fallback for an empty wallet to show 0 native balance
        const nativeSymbol = wallet.blockchain === 'ethereum' ? 'ETH' : wallet.blockchain === 'bitcoin' ? 'BTC' : 'SOL';
        const coin = marketData.find(c => (c.symbol || '').toUpperCase() === nativeSymbol) || marketData[0];
        const change = coin.price_change_percentage_24h || 0;
        const trendingChange = change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
        
        formattedAssets.push({
          id: `${wallet._id}-${nativeSymbol}`,
          name: coin.name || nativeSymbol,
          symbol: nativeSymbol,
          address: wallet.address,
          balance: 0,
          fiatValue: 0,
          trending: trendingChange
        });
      }
    });

    // Sort formattedAssets from high to low based on fiat value (amount in coin)
    formattedAssets.sort((a, b) => b.fiatValue - a.fiatValue);

    // Return meaningful demo dashboard data when a fresh account has no wallets/transactions yet.
    if (formattedAssets.length === 0) {
      const fallbackAssets = [
        { id: 'eth-fb', name: 'ETHEREUM', symbol: 'ETH', address: '0x71c2...3a4b', balance: 12.42, fiatValue: 33534, trending: '+2.4%' },
        { id: 'btc-fb', name: 'BITCOIN', symbol: 'BTC', address: 'bc1q...k20f', balance: 1.2, fiatValue: 78000, trending: '-1.2%' },
        { id: 'sol-fb', name: 'SOLANA', symbol: 'SOL', address: '8w2F...mq1z', balance: 48, fiatValue: 6969.6, trending: '+5.8%' }
      ];
      const fallbackTransactions = [
        {
          _id: 'tx-fb-1',
          blockchain: 'ethereum',
          toAddress: '0x9fd3a7601cdaf31f6f837f9a56a2ef3ad23a15b8',
          amount: 0.42,
          cryptoSymbol: 'ETH',
          status: 'confirmed'
        },
        {
          _id: 'tx-fb-2',
          blockchain: 'bitcoin',
          toAddress: 'bc1q8rqzw9v2zmlg2l7pt8fx4d8hct6m3uxm4q8d3p',
          amount: 0.03,
          cryptoSymbol: 'BTC',
          status: 'pending'
        }
      ];
      const fallbackTotal = fallbackAssets.reduce((sum, a) => sum + a.fiatValue, 0);

      return res.status(200).json({
        success: true,
        totalBalance: fallbackTotal,
        assets: fallbackAssets,
        transactions: fallbackTransactions,
        marketData: marketData
      });
    }

    res.status(200).json({
      success: true,
      totalBalance: totalPortfolioBalance,
      assets: formattedAssets,
      transactions: recentTransactions,
      marketData: marketData
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUserAssets = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userWallets = await Wallet.find({ userId });

    const marketData = await fetchLiveMarketData();

    let calculatedTotalOverview = 0;
    const assetsList = [];

    userWallets.forEach((wallet) => {
      if (wallet.balances && wallet.balances.length > 0) {
        wallet.balances.forEach((bal) => {
          const coinSymbol = (bal.token || '').toUpperCase();
          const balanceAmount = bal.amount || 0;
          const coin = marketData.find(c => (c.symbol || '').toUpperCase() === coinSymbol) || marketData[0];
          
          const totalValue = balanceAmount * (coin.current_price || 0);
          calculatedTotalOverview += totalValue;

          assetsList.push({
            id: `${wallet._id}-${coinSymbol}`,
            name: coin.name || coinSymbol,
            short: coinSymbol,
            icon: coin.image || '',
            price: coin.current_price || 0,
            balance: balanceAmount,
            value: totalValue,
            change24h: coin.price_change_percentage_24h || 0
          });
        });
      } else {
        const nativeSymbol = wallet.blockchain === 'ethereum' ? 'ETH' : wallet.blockchain === 'bitcoin' ? 'BTC' : 'SOL';
        const coin = marketData.find(c => (c.symbol || '').toUpperCase() === nativeSymbol) || marketData[0];
        
        assetsList.push({
          id: `${wallet._id}-${nativeSymbol}`,
          name: coin.name || nativeSymbol,
          short: nativeSymbol,
          icon: coin.image || '',
          price: coin.current_price || 0,
          balance: 0,
          value: 0,
          change24h: coin.price_change_percentage_24h || 0
        });
      }
    });

    if (assetsList.length === 0) {
      // Fallback if brand new user has no wallets
      const fallbackList = ['ETH', 'BTC', 'SOL'];
      fallbackList.forEach((sym) => {
        const coin = marketData.find(c => (c.symbol || '').toUpperCase() === sym) || marketData[0];
        const dummyBalance = sym === 'ETH' ? 12.42 : sym === 'BTC' ? 1.2 : 48;
        const totalValue = dummyBalance * (coin.current_price || 0);
        calculatedTotalOverview += totalValue;
        assetsList.push({
          id: `fb-${sym}`,
          name: coin.name || sym,
          short: sym,
          icon: coin.image || '',
          price: coin.current_price || 0,
          balance: dummyBalance,
          value: totalValue,
          change24h: coin.price_change_percentage_24h || 0
        });
      });
    }

    assetsList.sort((a, b) => b.value - a.value);

    const distribution = assetsList.map((asset, index) => {
      const percentage = calculatedTotalOverview > 0 ? ((asset.value / calculatedTotalOverview) * 100).toFixed(1) : 0;
      return {
        label: index < 3 ? `Top ${index + 1}` : 'Others',
        percent: `${percentage}%`
      };
    });

    res.status(200).json({
      success: true,
      portfolioOverview: calculatedTotalOverview,
      assets: assetsList,
      distribution: distribution.slice(0, 4)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAnalyticsData = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userWallets = await Wallet.find({ userId });

    const marketData = await fetchLiveMarketData();

    const marketPrices = {
      ETH: { current: marketData.ethereum?.usd || 2750.0, change24h: marketData.ethereum?.usd_24h_change || 2.4 },
      BTC: { current: marketData.bitcoin?.usd || 63800.0, change24h: marketData.bitcoin?.usd_24h_change || -1.2 },
      BNB: { current: marketData.binancecoin?.usd || 575.5, change24h: marketData.binancecoin?.usd_24h_change || 1.1 },
      DOGE: { current: marketData.dogecoin?.usd || 0.12, change24h: marketData.dogecoin?.usd_24h_change || -4.3 },
      SOL: { current: marketData.solana?.usd || 142.1, change24h: marketData.solana?.usd_24h_change || 5.8 }
    };

    const costBasis = {
      ETH: { entry: 2329.8, qty: 23.5 },
      BTC: { entry: 60828.0, qty: 0.7 },
      BNB: { entry: 649.69, qty: 20.0 },
      DOGE: { entry: 0.109, qty: 5000.0 },
      SOL: { entry: 94.45, qty: 30.0 }
    };

    let totalPortfolioValue = 0;
    let total24hChangeUSD = 0;

    const breakdownRows = Object.keys(costBasis).map((symbol) => {
      const live = marketPrices[symbol];
      const basis = costBasis[symbol];

      const chain = TOKEN_TO_CHAIN[symbol];
      const chainWallet = userWallets.find((w) => w.blockchain === chain);
      const activeQty = chainWallet ? findTokenBalance(chainWallet, symbol) || basis.qty : basis.qty;

      const currentAssetValue = activeQty * live.current;
      const initialCostBasis = activeQty * basis.entry;
      const unrealizedPL = currentAssetValue - initialCostBasis;
      const realizedPL = symbol === 'ETH' ? 450.0 : symbol === 'SOL' ? 120.0 : 0.0;

      totalPortfolioValue += currentAssetValue;

      const assetPriceYesterday = live.current / (1 + live.change24h / 100);
      const valueYesterday = activeQty * assetPriceYesterday;
      total24hChangeUSD += currentAssetValue - valueYesterday;

      return {
        name: symbol === 'ETH' ? 'Ethereum' : symbol === 'BTC' ? 'Bitcoin' : symbol,
        short: symbol,
        avgEntry: basis.entry,
        currentPrice: live.current,
        qty: activeQty,
        realized: realizedPL,
        unrealized: unrealizedPL
      };
    });

    const allocation = breakdownRows
      .map((item) => ({
        name: item.name,
        short: item.short,
        pct: totalPortfolioValue > 0 ? `${((item.qty * item.currentPrice) / totalPortfolioValue * 100).toFixed(1)}%` : '0%',
        val: item.qty * item.currentPrice
      }))
      .sort((a, b) => b.val - a.val);

    const baseValue = totalPortfolioValue - total24hChangeUSD;
    const aggregatePercentageChange = baseValue > 0 ? ((total24hChangeUSD / baseValue) * 100).toFixed(2) : '0.00';

    res.status(200).json({
      success: true,
      totalBalance: totalPortfolioValue,
      balanceChangeUSD: total24hChangeUSD,
      balanceChangePercent: aggregatePercentageChange,
      allocation: allocation.slice(0, 3),
      breakdown: breakdownRows
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getReceiveDetails = async (req, res) => {
  try {
    const userId = req.user.userId;
    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet profile not found for this authenticated session.'
      });
    }

    res.status(200).json({ success: true, address: wallet.address });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getWalletBalances = async (req, res) => {
  try {
    const userId = req.user.userId;
    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet node structure missing.' });
    }

    const balanceMap = {};
    (wallet.balances || []).forEach((b) => {
      balanceMap[b.token.toUpperCase()] = b.amount;
    });

    res.status(200).json({
      success: true,
      balances: balanceMap,
      marketTelemetry: {
        ETH: { currentUSD: 2355.07, high24h: 2410, low24h: 2280 },
        BTC: { currentUSD: 64200.0, high24h: 65100, low24h: 63800 },
        LINK: { currentUSD: 15.3, high24h: 16.1, low24h: 14.9 }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.sendTransaction = async (req, res) => {
  try {
    const senderUserId = req.user.userId;
    const { recipientAddress, asset, amount, gasFee } = req.body;
    const tokenSymbol = String(asset || '').toUpperCase();
    const transferAmount = parseFloat(amount);
    const feeAmount = parseFloat(gasFee || 0);

    if (!recipientAddress || !tokenSymbol || !transferAmount || transferAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid address target or transaction quantity.' });
    }

    const senderWallet = await Wallet.findOne({ userId: senderUserId });
    if (!senderWallet) return res.status(404).json({ success: false, message: 'Sender node not configured.' });

    const recipientWallet = await Wallet.findOne({ address: recipientAddress.toLowerCase() });
    if (!recipientWallet) return res.status(404).json({ success: false, message: 'Destination key address not found.' });

    const senderBalance = findTokenBalance(senderWallet, tokenSymbol);
    if (senderBalance < transferAmount + feeAmount) {
      return res.status(400).json({ success: false, message: 'Insufficient clear cryptocurrency reserves.' });
    }

    upsertTokenBalance(senderWallet, tokenSymbol, senderBalance - transferAmount - feeAmount);

    const recipientBalance = findTokenBalance(recipientWallet, tokenSymbol);
    upsertTokenBalance(recipientWallet, tokenSymbol, recipientBalance + transferAmount);

    await senderWallet.save();
    await recipientWallet.save();

    const senderAddress = String(senderWallet.address || senderWallet.publicAddress || '').toLowerCase();
    const receiverAddress = String(recipientWallet.address || recipientWallet.publicAddress || '').toLowerCase();
    const network = String(senderWallet.blockchain || TOKEN_TO_CHAIN[tokenSymbol] || 'ethereum').toLowerCase();

    const transactionRecord = await Transaction.create({
      // Canonical fields
      senderAddress,
      receiverAddress,
      chainId: CHAIN_TO_ID[network] ?? 1,
      network,
      tokenSymbol,
      transactionType: 'SEND',
      feeAmount: feeAmount,
      feeToken: tokenSymbol,
      confirmations: 1,
      status: 'SUCCESS',

      // Compatibility fields
      userId: senderUserId,
      walletAddress: senderAddress,
      txHash: ethers.hexlify(ethers.randomBytes(32)),
      blockchain: network,
      fromAddress: senderAddress,
      toAddress: receiverAddress,
      amount: transferAmount,
      cryptoSymbol: tokenSymbol,
      timestamp: new Date()
    });

    res.status(200).json({ success: true, message: 'Cryptographic transaction committed.', transaction: transactionRecord });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};