const express = require('express');
const router = express.Router();
const vaultController = require('../controllers/vaultsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, vaultController.getVaultsAndActivity);
router.post('/add', authMiddleware, vaultController.addNewVault);

module.exports = router;