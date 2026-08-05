const express = require('express');
const router = express.Router();
const nftController = require('../controllers/nftController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, nftController.getUserNFTs);
router.post('/mint', authMiddleware, nftController.mintNFT);
router.post('/transfer', authMiddleware, nftController.transferNFT);
router.put('/:id/status', authMiddleware, nftController.updateNFTStatus);
router.get('/:id', authMiddleware, nftController.getNFTDetails);

module.exports = router;