const Notification = require('../models/Notification');

// Fetch user notifications separated by status types
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const items = await Notification.find({ userId }).sort({ createdAt: -1 });

    // Fallback seed entries for newly registered empty dashboard view setups
    if (items.length === 0) {
      const fallbackItems = [
        { _id: 'mock1', type: 'critical', title: 'Liquidation Warning', description: 'Your ETH/USDT position on Snake Margin is nearing the liquidation threshold (Price: $2,420).', isRead: false, createdAt: new Date() },
        { _id: 'mock2', type: 'critical', title: 'New Login Detected', description: 'A new login was recorded from IP address 192.168.1.45 (Tokyo, JP).', isRead: false, createdAt: new Date(Date.now() - 3600000) },
        { _id: 'mock3', type: 'activity', title: 'Swap Executed', description: 'Successfully swapped 1.5 ETH for 3,600 USDT via Snake Router v2.', txHash: '0x5f1...12ae', isRead: true, createdAt: new Date(Date.now() - 7200000) }
      ];
      return res.status(200).json({ success: true, notifications: fallbackItems });
    }

    res.status(200).json({ success: true, notifications: items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Batch update: Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    await Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
    res.status(200).json({ success: true, message: 'All items matched and marked read.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};