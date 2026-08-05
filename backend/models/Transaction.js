const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  // Canonical Phase 2 fields
  txHash: { type: String, required: true, unique: true },
  senderAddress: { type: String, required: true, index: true, lowercase: true },
  receiverAddress: { type: String, required: true, index: true, lowercase: true },
  chainId: { type: Number, default: 1, index: true },
  network: { type: String, default: 'ethereum', trim: true },
  amount: { type: mongoose.Schema.Types.Decimal128, required: true },
  tokenSymbol: { type: String, required: true, uppercase: true, trim: true },
  feeAmount: { type: mongoose.Schema.Types.Decimal128, required: true, default: '0.0' },
  feeToken: { type: String, uppercase: true, trim: true },
  nonce: { type: Number },
  blockNumber: { type: Number, index: true },
  confirmations: { type: Number, default: 0 },
  transactionType: { type: String, enum: ['SEND', 'RECEIVE', 'SWAP'], required: true, default: 'SEND' },
  status: { type: String, enum: ['SUCCESS', 'FAILED', 'PENDING'], default: 'PENDING' },
  failureReason: { type: String },
  idempotencyKey: { type: String, trim: true },
  metadata: {
    memo: { type: String },
    sourcePage: { type: String },
    clientVersion: { type: String }
  },
  timestamp: { type: Date, default: Date.now },

  // Compatibility fields kept during migration
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  walletAddress: { type: String, lowercase: true },
  blockchain: { type: String },
  fromAddress: { type: String, lowercase: true },
  toAddress: { type: String, lowercase: true },
  cryptoSymbol: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  txType: { type: String },
  title: { type: String },
  subtitle: { type: String },
  assetProtocol: { type: String },
  amountSub: { type: String },
  amountColor: { type: String },
  impact: { type: String },
  impactSub: { type: String }
}, { timestamps: true });

TransactionSchema.pre('validate', async function() {
  if (!this.senderAddress && this.fromAddress) {
    this.senderAddress = this.fromAddress;
  }
  if (!this.receiverAddress && this.toAddress) {
    this.receiverAddress = this.toAddress;
  }
  if (!this.tokenSymbol && this.cryptoSymbol) {
    this.tokenSymbol = this.cryptoSymbol;
  }
  if (!this.user && this.userId) {
    this.user = this.userId;
  }
  if (!this.txType && this.transactionType) {
    this.txType = this.transactionType.toLowerCase();
  }
  if (!this.assetProtocol && this.tokenSymbol) {
    this.assetProtocol = this.tokenSymbol;
  }
  if (!this.feeToken && this.tokenSymbol) {
    this.feeToken = this.tokenSymbol;
  }

  // Normalize incoming legacy statuses into canonical values.
  const normalizedStatus = String(this.status || '').toLowerCase();
  if (normalizedStatus === 'confirmed' || normalizedStatus === 'completed' || normalizedStatus === 'success') {
    this.status = 'SUCCESS';
  } else if (normalizedStatus === 'pending') {
    this.status = 'PENDING';
  } else if (normalizedStatus === 'failed' || normalizedStatus === 'error') {
    this.status = 'FAILED';
  }

  if (!this.transactionType) {
    this.transactionType = 'SEND';
  }

  // Ensure compound unique index { userId, idempotencyKey } never receives null idempotencyKey.
  if (this.userId && !this.idempotencyKey) {
    this.idempotencyKey = this.txHash || new mongoose.Types.ObjectId().toString();
  }
});

TransactionSchema.index({ userId: 1, idempotencyKey: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Transaction', TransactionSchema);