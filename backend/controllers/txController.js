// controllers/txController.js
const Transaction = require('../models/Transactions');
const TransactionService = require('../services/TransactionService');
const { ok, fail } = require('../utils/http');

exports.sendTransaction = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await TransactionService.executeTransfer(userId, req.body);
    return ok(res, result, 200);
  } catch (err) {
    return fail(res, err.message, err.statusCode || 500);
  }
};

exports.getUserTransactions = async (req, res) => {
  try {
    const { txType, horizon, asset, page = 1, limit = 5 } = req.query;
    const query = { user: req.user.userId };

    // Apply Filter Matrices
    if (txType && txType !== 'All Activities') {
      const normalizedType = txType.toLowerCase();
      query.$or = [
        { txType: normalizedType },
        { transactionType: normalizedType.toUpperCase() }
      ];
    }
    if (asset && asset !== 'All Assets') {
      query.$and = [
        ...(query.$and || []),
        {
          $or: [
            { assetProtocol: asset },
            { tokenSymbol: asset }
          ]
        }
      ];
    }
    if (horizon && horizon === 'Last 30 Days') {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - 30);
      query.timestamp = { $gte: targetDate };
    }

    const totalCount = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort({ timestamp: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    // Compile summary panel calculations
    const allUserTx = await Transaction.find({ user: req.user.userId });
    const completedCount = allUserTx.filter((t) => {
      const value = String(t.status || '').toUpperCase();
      return value === 'COMPLETED' || value === 'CONFIRMED' || value === 'SUCCESS';
    }).length;
    const pendingCount = allUserTx.filter((t) => {
      const value = String(t.status || '').toUpperCase();
      return value === 'PENDING';
    }).length;

    return ok(res, {
      transactions,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page),
      summary: {
        completed: completedCount,
        pending: pendingCount,
        totalVolume30D: "$124,592.80" // Fetch aggregated USD amounts here
      }
    }, 200);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};