const mongoose = require('mongoose');

const YieldVaultSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['ALL', 'STABLECOINS', 'AGGRESSIVE', 'LENDING'], required: true },
  desc: { type: String, required: true },
  apy: { type: Number, required: true }, 
  tvl: { type: Number, required: true }, // Represented in raw integers (e.g. 42800000)
  risk: { type: Number, min: 1, max: 4, required: true },
  pair: { type: String, required: true },
  icon: { type: String, required: true },
  themeColor: { type: String, default: '#00e0ff' }
});

module.exports = mongoose.model('YieldVault', YieldVaultSchema);