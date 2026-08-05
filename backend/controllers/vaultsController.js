const Vault = require('../models/Vault');
const crypto = require('crypto');

// Fetch user vaults along with simulated live activity data
exports.getVaultsAndActivity = async (req, res) => {
  try {
    const vaults = await Vault.find({ user: req.user.userId });
    
    // Fallback Mock data injection if database collection is empty for first-time use
    if (vaults.length === 0) {
      const defaultVaults = await Vault.create([
        { user: req.user.userId, name: 'Main Vault', address: '0x71C23a4b998a4b277c', tag: 'PRIMARY', tagClass: 'primaryTag', worth: 1248390.42, dotColor: '#a64dff' },
        { user: req.user.userId, name: 'DeFi Hot Wallet', address: '0x1F2cc778c8a14bd32', worth: 42109.85, dotColor: '#00e0ff' }
      ]);
      return res.status(200).json({ success: true, vaults: defaultVaults });
    }

    res.status(200).json({ success: true, vaults });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create and assign a randomized hexadecimal crypto address block
exports.addNewVault = async (req, res) => {
  try {
    const { name, tag } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Vault naming field required.' });

    // Generate simulated address hash properties
    const pseudoAddress = '0x' + crypto.randomBytes(20).toString('hex').substring(0, 16) + '...';
    const tagClass = tag === 'HARDWARE' ? 'hardwareTag' : tag === 'PRIMARY' ? 'primaryTag' : '';

    const newVault = new Vault({
      user: req.user.userId,
      name,
      address: pseudoAddress,
      tag: tag || null,
      tagClass,
      worth: Math.floor(Math.random() * 50000), // assign randomized baseline asset testing pool value
      dotColor: ['#a64dff', '#ff4d6d', '#00e0ff', '#ffab00'][Math.floor(Math.random() * 4)]
    });

    await newVault.save();
    res.status(201).json({ success: true, vault: newVault });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};