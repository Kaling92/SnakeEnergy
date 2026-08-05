const express = require('express');
const router = express.Router();
const swapController = require('../controllers/swapController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateBody, validateQuery } = require('../middleware/validate');
const { validateSwapBody, validateSwapQuoteQuery } = require('../validators/transactionValidators');

router.get('/quote', authMiddleware, validateQuery(validateSwapQuoteQuery), swapController.getSwapQuote);
router.post('/execute', authMiddleware, validateBody(validateSwapBody), swapController.executeSwapTransaction);

module.exports = router;