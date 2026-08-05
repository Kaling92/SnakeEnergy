const express = require('express');
const router = express.Router();
const txController = require('../controllers/txController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateBody, validateQuery } = require('../middleware/validate');
const { validateSendBody, validateTransactionsQuery } = require('../validators/transactionValidators');

router.get('/', authMiddleware, validateQuery(validateTransactionsQuery), txController.getUserTransactions);
router.post('/send', authMiddleware, validateBody(validateSendBody), txController.sendTransaction);

module.exports = router;
