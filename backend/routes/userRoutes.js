const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);

router.get('/settings/advanced', authMiddleware, userController.getAdvancedSettings);
router.put('/settings/advanced', authMiddleware, userController.updateAdvancedSettings);

module.exports = router;