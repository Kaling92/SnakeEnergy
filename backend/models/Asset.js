const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
  walletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true, index: true },
  tokenSymbol: {
    type: String,
    required: true,
    enum: ['BTC', 'ETH', 'BNB', 'SOL'],
    uppercase: true,
    trim: true
  },
  chainId: { type: Number, default: 1, index: true },
  network: { type: String, default: 'ethereum', trim: true },
  contractAddress: { type: String, lowercase: true, trim: true, sparse: true },
  decimals: { type: Number, default: 18, min: 0, max: 36 },
  balance: { type: mongoose.Schema.Types.Decimal128, required: true, default: '0.0' },
  availableBalance: { type: mongoose.Schema.Types.Decimal128, required: true, default: '0.0' },
  lockedBalance: { type: mongoose.Schema.Types.Decimal128, required: true, default: '0.0' },
  lastSyncedAt: { type: Date, default: Date.now },
  source: { type: String, enum: ['ONCHAIN', 'INTERNAL', 'MANUAL'], default: 'INTERNAL' },
  metadata: { type: mongoose.Schema.Types.Mixed },
  updatedAt: { type: Date, default: Date.now }
});

AssetSchema.pre('validate', async function() {
  if (!this.availableBalance && this.balance) {
    this.availableBalance = this.balance;
  }
  if (!this.balance && this.availableBalance) {
    this.balance = this.availableBalance;
  }
});

AssetSchema.pre('save', async function() {
  this.updatedAt = new Date();
});

AssetSchema.index({ walletId: 1, tokenSymbol: 1 }, { unique: true });
AssetSchema.index({ walletId: 1, contractAddress: 1 }, { sparse: true });

module.exports = mongoose.model('Asset', AssetSchema);
