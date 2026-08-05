const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected paths using our middleware token verification
router.post('/create', authMiddleware, walletController.createWallet);
router.get('/', authMiddleware, walletController.getWallets);
// Protected path for loading the live home dashboard metrics
router.get('/dashboard', authMiddleware, walletController.getDashboardData);
// Protected path for getting token assets breakdown matrices
router.get('/assets', authMiddleware, walletController.getUserAssets);
// Protected endpoint route for processing advanced tracking matrix charts
router.get('/analytics', authMiddleware, walletController.getAnalyticsData);
router.get('/receive', authMiddleware, walletController.getReceiveDetails);

router.get('/balances', authMiddleware, walletController.getWalletBalances);
router.post('/send', authMiddleware, walletController.sendTransaction);
router.post('/fund', authMiddleware, walletController.fundWallet);
module.exports = router;