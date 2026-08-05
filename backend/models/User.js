const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // Canonical Phase 2 fields
  username: { type: String, required: true, unique: true, index: true, trim: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },

  // Compatibility fields kept during migration
  fullName: { type: String, trim: true },
  email: { type: String, unique: true, sparse: true, trim: true },
  password: { type: String },
  publicIdentity: { type: String },
  displayCurrency: { type: String },
  language: { type: String },
  motionProfile: { type: String },
  infoDensity: { type: String },
  blurStrength: { type: Number },
  slippageTolerance: { type: Number },
  anonymousRpc: { type: Boolean },
  hideZeroBalances: { type: Boolean },
  telemetry: { type: Boolean }
});

UserSchema.pre('validate', async function() {
  if (!this.passwordHash && this.password) {
    this.passwordHash = this.password;
  }
  if (!this.password && this.passwordHash) {
    this.password = this.passwordHash;
  }
});

module.exports = mongoose.model('User', UserSchema);
