// models/Vault.js
const mongoose = require('mongoose');

const VaultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  address: { type: String, required: true, unique: true },
  tag: { type: String }, // PRIMARY, HARDWARE, etc.
  tagClass: { type: String }, // primaryTag, hardwareTag
  worth: { type: Number, default: 0 }, // Plain number instead of hardcoded strings
  dotColor: { type: String, default: '#00e0ff' }
});

module.exports = mongoose.model('Vault', VaultSchema);