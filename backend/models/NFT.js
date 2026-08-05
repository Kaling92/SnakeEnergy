const mongoose = require('mongoose');

const NFTSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerAddress: { type: String, lowercase: true, index: true },
  name: { type: String, required: true },
  description: { type: String },
  collectionName: { type: String, required: true }, // e.g., 'Neon Vipers'
  badge: { type: String, required: true },          // e.g., 'RARE #042'
  badgeClass: { type: String, default: 'cyan' },    // cyan, pink, purple, gray
  label: { type: String, default: 'FLOOR PRICE' }, // FLOOR PRICE or CURRENT BID
  price: { type: String, required: true },         // e.g., '4.20 ETH'
  status: { type: String, enum: ['On Sale', 'Auction', 'Bidded', 'Hidden'], default: 'On Sale' },
  imageUrl: { type: String, required: true },       // IPFS or hosting asset URL
  mintDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NFT', NFTSchema);