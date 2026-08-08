const crypto = require('crypto');
const mongoose = require('mongoose');
const { WalletDAO, AssetDAO, TransactionDAO } = require('../dao');
const Notification = require('../models/Notification');
const axios = require('axios');

// Fixed AMM rate matrix: how many units of toToken you get per 1 fromToken
const AMM_RATE = {
  ETH: { BTC: 0.052,  BNB: 20,    SOL: 19.5  },
  BTC: { ETH: 19.2,   BNB: 384,   SOL: 375   },
  BNB: { ETH: 0.05,   BTC: 0.0026, SOL: 0.98  },
  SOL: { ETH: 0.051,  BTC: 0.0027, BNB: 1.02  }
};

const VALID_TOKENS = new Set(['BTC', 'ETH', 'BNB', 'SOL']);

function decimal(value) {
  return mongoose.Types.Decimal128.fromString(
    typeof value === 'object' && value !== null
      ? value.toString()
      : String(value)
  );
}

function toNumber(decimal128) {
  if (!decimal128) return 0;
  return parseFloat(decimal128.toString());
}

function generateTxHash(data) {
  return crypto
    .createHash('sha256')
    .update(`${data}:${Date.now()}:${crypto.randomBytes(16).toString('hex')}`)
    .digest('hex');
}

function appError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode || 400;
  return err;
}

async function createTransferNotifications(params, session) {
  const {
    senderUserId,
    receiverUserId,
    senderAddress,
    receiverAddress,
    amount,
    token,
    txHash
  } = params;

  const items = [];

  if (senderUserId) {
    items.push({
      userId: senderUserId,
      type: 'activity',
      title: 'Transfer Sent',
      description: `You sent ${amount} ${token} to ${receiverAddress}.`,
      txHash
    });
  }

  if (receiverUserId) {
    items.push({
      userId: receiverUserId,
      type: 'activity',
      title: 'Transfer Received',
      description: `You received ${amount} ${token} from ${senderAddress}.`,
      txHash
    });
  }

  if (!items.length) return;
  if (session) {
    await Notification.insertMany(items, { session, ordered: true });
    return;
  }
  await Notification.insertMany(items, { ordered: true });
}

async function runInSession(work) {
  if (mongoose.connection.readyState !== 1) {
    return work(null);
  }
  const session = await mongoose.startSession();
  try {
    let output;
    await session.withTransaction(async () => {
      output = await work(session);
    });
    return output;
  } finally {
    await session.endSession();
  }
}

async function resolveWallet(userId, session) {
  const wallet = await WalletDAO.findOneByUserId(userId, session);
  if (!wallet) throw appError('Sender wallet not found.', 404);
  return wallet;
}

async function resolveReceiverWallet(receiverAddress, session) {
  const addr = String(receiverAddress || '').toLowerCase();
  let wallet = await WalletDAO.findByPublicAddress(addr, session);
  if (!wallet) wallet = await WalletDAO.findByLegacyAddress(addr, session);
  return wallet;
}

class TransactionService {
  // ─────────────────────────────────────────────────────────────────────
  // Feature B: Atomic Send Transaction
  // ─────────────────────────────────────────────────────────────────────
  static async executeTransfer(userId, payload) {
    const { receiverAddress, amount, tokenSymbol, feeAmount, idempotencyKey, memo } = payload || {};

    // Input validation
    const token = String(tokenSymbol || '').toUpperCase();
    const amountNum = parseFloat(amount);
    const feeNum = parseFloat(feeAmount || 0);

    if (!receiverAddress) throw appError('receiverAddress is required.', 400);
    if (!VALID_TOKENS.has(token)) throw appError(`tokenSymbol must be one of: ${[...VALID_TOKENS].join(', ')}.`, 400);
    if (!amountNum || amountNum <= 0) throw appError('amount must be greater than 0.', 400);

    return runInSession(async (session) => {
      const senderWallet = await resolveWallet(userId, session);
      const senderAddr = String(senderWallet.publicAddress || senderWallet.address || '').toLowerCase();
      const receiverAddr = String(receiverAddress || '').toLowerCase();

      if (senderAddr === receiverAddr) {
        throw appError('Sender and receiver addresses cannot be the same.', 400);
      }

      const receiverWallet = await resolveReceiverWallet(receiverAddr, session);
      if (!receiverWallet) throw appError('Receiver address not found in the system.', 404);

      // Check sender balance
      const senderAsset = await AssetDAO.findByWalletAndToken(senderWallet._id, token, session);
      const senderBalance = toNumber(senderAsset?.balance);
      const totalRequired = amountNum + feeNum;

      if (senderBalance < totalRequired) {
        const failedTxHash = generateTxHash(`FAILED:${senderAddr}:${receiverAddr}`);
        await TransactionDAO.create({
          txHash: failedTxHash,
          senderAddress: senderAddr,
          receiverAddress: receiverAddr,
          amount: decimal(amountNum),
          tokenSymbol: token,
          feeAmount: decimal(feeNum),
          feeToken: token,
          transactionType: 'SEND',
          status: 'FAILED',
          failureReason: `Insufficient balance. Required: ${totalRequired}, Available: ${senderBalance}`,
          userId,
          fromAddress: senderAddr,
          toAddress: receiverAddr,
          cryptoSymbol: token,
          blockchain: senderWallet.blockchain || 'ethereum',
          walletAddress: senderAddr,
          timestamp: new Date(),
          ...(idempotencyKey ? { idempotencyKey } : {}),
          metadata: { memo: memo || '', sourcePage: 'Send' }
        });
        throw appError(`Insufficient balance. Required: ${totalRequired} ${token}, Available: ${senderBalance} ${token}.`, 400);
      }

      // Deduct sender
      const newSenderBalance = decimal(senderBalance - totalRequired);
      await AssetDAO.upsertBalance(senderWallet._id, token, newSenderBalance, session);

      // Credit receiver (upsert if token row doesn't exist)
      const receiverAsset = await AssetDAO.findByWalletAndToken(receiverWallet._id, token, session);
      const receiverBalance = toNumber(receiverAsset?.balance);
      const newReceiverBalance = decimal(receiverBalance + amountNum);
      await AssetDAO.upsertBalance(receiverWallet._id, token, newReceiverBalance, session);

      // Also update legacy wallet balances array for backward compatibility
      const senderLegacy = (senderWallet.balances || []).find((b) => b.token === token);
      if (senderLegacy) senderLegacy.amount = senderBalance - totalRequired;
      await WalletDAO.save(senderWallet, session);

      const receiverLegacy = (receiverWallet.balances || []).find((b) => b.token === token);
      if (receiverLegacy) receiverLegacy.amount = receiverBalance + amountNum;
      await WalletDAO.save(receiverWallet, session);

      // Simulate network delay (3 seconds) for blockchain finality
      await new Promise(resolve => setTimeout(resolve, 3000));

      let txHash;
      try {
        // Send transaction to python blockchain mempool
        const BLOCKCHAIN_URL = process.env.BLOCKCHAIN_URL || 'http://localhost:5001';
        await axios.post(`${BLOCKCHAIN_URL}/transactions/new`, {
          sender: senderAddr,
          recipient: receiverAddr,
          amount: amountNum
        });

        // Mine a block to confirm the transaction and get a real hash
        const mineResponse = await axios.get(`${BLOCKCHAIN_URL}/mine`);
        const block = mineResponse.data;
        txHash = block.pow_hash || block.previous_hash;
      } catch (error) {
        console.error("Simple Blockchain error:", error.message);
        // Fallback to local hash if python server is offline
        txHash = generateTxHash(`${senderAddr}:${receiverAddr}:${token}:${amountNum}`);
      }
      const tx = await TransactionDAO.create({
        txHash,
        senderAddress: senderAddr,
        receiverAddress: receiverAddr,
        amount: decimal(amountNum),
        tokenSymbol: token,
        feeAmount: decimal(feeNum),
        feeToken: token,
        transactionType: 'SEND',
        status: 'SUCCESS',
        confirmations: 1,
        userId,
        fromAddress: senderAddr,
        toAddress: receiverAddr,
        cryptoSymbol: token,
        blockchain: senderWallet.blockchain || 'ethereum',
        walletAddress: senderAddr,
        timestamp: new Date(),
        ...(idempotencyKey ? { idempotencyKey } : {}),
        metadata: { memo: memo || '', sourcePage: 'Send' }
      }, session);

      await createTransferNotifications({
        senderUserId: userId,
        receiverUserId: receiverWallet.userId,
        senderAddress: senderAddr,
        receiverAddress: receiverAddr,
        amount: amountNum,
        token,
        txHash
      }, session);

      return {
        success: true,
        message: 'Transaction committed successfully.',
        txHash,
        transaction: tx
      };
    });
  }

  // ─────────────────────────────────────────────────────────────────────
  // Feature C: Atomic Token Swap
  // ─────────────────────────────────────────────────────────────────────
  static async executeSwap(userId, payload) {
    const { fromToken, toToken, amount, idempotencyKey, memo } = payload || {};

    const from = String(fromToken || '').toUpperCase();
    const to = String(toToken || '').toUpperCase();
    const amountNum = parseFloat(amount);

    if (!VALID_TOKENS.has(from)) throw appError(`fromToken must be one of: ${[...VALID_TOKENS].join(', ')}.`, 400);
    if (!VALID_TOKENS.has(to)) throw appError(`toToken must be one of: ${[...VALID_TOKENS].join(', ')}.`, 400);
    if (from === to) throw appError('fromToken and toToken must be different.', 400);
    if (!amountNum || amountNum <= 0) throw appError('amount must be greater than 0.', 400);

    const rate = AMM_RATE[from]?.[to];
    if (!rate) throw appError(`No exchange rate defined for ${from} → ${to}.`, 400);
    const convertedAmount = amountNum * rate;

    return runInSession(async (session) => {
      const wallet = await resolveWallet(userId, session);
      const walletAddr = String(wallet.publicAddress || wallet.address || '').toLowerCase();

      // Check from-token balance
      const fromAsset = await AssetDAO.findByWalletAndToken(wallet._id, from, session);
      const fromBalance = toNumber(fromAsset?.balance);

      if (fromBalance < amountNum) {
        throw appError(`Insufficient ${from} balance. Required: ${amountNum}, Available: ${fromBalance}.`, 400);
      }

      // Deduct fromToken
      await AssetDAO.upsertBalance(wallet._id, from, decimal(fromBalance - amountNum), session);

      // Credit toToken
      const toAsset = await AssetDAO.findByWalletAndToken(wallet._id, to, session);
      const toBalance = toNumber(toAsset?.balance);
      await AssetDAO.upsertBalance(wallet._id, to, decimal(toBalance + convertedAmount), session);

      // Update legacy wallet balances for existing controller compatibility
      const fromLegacy = (wallet.balances || []).find((b) => b.token === from);
      if (fromLegacy) fromLegacy.amount = fromBalance - amountNum;
      const toLegacy = (wallet.balances || []).find((b) => b.token === to);
      if (toLegacy) {
        toLegacy.amount = toBalance + convertedAmount;
      } else {
        wallet.balances.push({ token: to, amount: toBalance + convertedAmount });
      }
      await WalletDAO.save(wallet, session);

      // Log swap transaction
      const txHash = generateTxHash(`SWAP:${walletAddr}:${from}:${to}:${amountNum}`);
      const tx = await TransactionDAO.create({
        txHash,
        senderAddress: walletAddr,
        receiverAddress: walletAddr,
        amount: decimal(amountNum),
        tokenSymbol: from,
        feeAmount: decimal('0'),
        feeToken: from,
        transactionType: 'SWAP',
        status: 'SUCCESS',
        confirmations: 1,
        userId,
        fromAddress: walletAddr,
        toAddress: walletAddr,
        cryptoSymbol: from,
        blockchain: wallet.blockchain || 'ethereum',
        walletAddress: walletAddr,
        timestamp: new Date(),
        ...(idempotencyKey ? { idempotencyKey } : {}),
        metadata: { memo: memo || `Swapped ${amountNum} ${from} → ${convertedAmount.toFixed(8)} ${to}`, sourcePage: 'Swap' }
      }, session);

      return {
        success: true,
        message: `Swap complete: ${amountNum} ${from} → ${convertedAmount.toFixed(8)} ${to}`,
        txHash,
        exchangeRate: `1 ${from} = ${rate} ${to}`,
        fromAmount: amountNum,
        toAmount: convertedAmount,
        updatedBalances: {
          [from]: fromBalance - amountNum,
          [to]: toBalance + convertedAmount
        },
        transaction: tx
      };
    });
  }
}

module.exports = TransactionService;
