const User = require('../models/User');

// Fetch authenticated profile state
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User profile missing.' });
    
    res.status(200).json({ 
      success: true, 
      username: user.username,
      publicIdentity: user.publicIdentity || 'snake.eth',
      displayCurrency: user.displayCurrency || 'USD ($)'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Save edited metadata updates
exports.updateProfile = async (req, res) => {
  try {
    const { publicIdentity, displayCurrency } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: { publicIdentity, displayCurrency } },
      { new: true }
    );
    res.status(200).json({ success: true, message: 'Profile configuration synchronized.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Fetch complete system preferences and live network parameters
exports.getAdvancedSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User engine matrix not found.' });

    res.status(200).json({
      success: true,
      settings: {
        language: user.language || 'English (Universal)',
        currency: user.displayCurrency || 'USD ($)',
        motionProfile: user.motionProfile || 'Kinetic',
        infoDensity: user.infoDensity || 'STANDARD',
        blurStrength: user.blurStrength ?? 70,
        slippageTolerance: user.slippageTolerance ?? 0.5,
        anonymousRpc: user.anonymousRpc ?? true,
        hideZeroBalances: user.hideZeroBalances ?? false,
        telemetry: user.telemetry ?? false
      },
      networkTelemetry: {
        latency: '24ms',
        blockHeight: '18,442,109'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update advanced engine parameters
exports.updateAdvancedSettings = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json({ success: true, message: 'System configurations applied.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
