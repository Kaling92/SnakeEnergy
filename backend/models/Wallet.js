const mongoose = require('mongoose');

const balanceEntrySchema = new mongoose.Schema({
  token: { type: String, required: true, uppercase: true, trim: true },
  amount: { type: Number, default: 0 }
}, { _id: false });

const WalletSchema = new mongoose.Schema({
  // Canonical Phase 2 fields
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  publicAddress: {
    type: String,
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    match: /^0x[a-f0-9]{16,}$/
  },
  encryptedPrivateKey: { type: String, required: true, default: 'LEGACY_UNSET' },
  seedPhrase: {
    type: String,
    required: true,
    default: 'legacy seed phrase placeholder words for compatibility only mode'
  },
  status: { type: String, enum: ['ACTIVE', 'LOCKED'], default: 'ACTIVE' },

  // Compatibility fields kept during migration
  blockchain: { type: String, enum: ['ethereum', 'bitcoin', 'solana'], default: 'ethereum' },
  address: { type: String, unique: true, sparse: true, lowercase: true },
  label: { type: String, default: 'Main Wallet' },
  balances: [balanceEntrySchema],
  createdAt: { type: Date, default: Date.now }
});

WalletSchema.pre('validate', async function() {
  if (!this.publicAddress && this.address) {
    this.publicAddress = this.address;
  }
  if (!this.address && this.publicAddress) {
    this.address = this.publicAddress;
  }
});

WalletSchema.index({ userId: 1 });

module.exports = mongoose.model('Wallet', WalletSchema);