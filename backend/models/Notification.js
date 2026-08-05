const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['critical', 'activity', 'news'], 
    required: true 
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  txHash: { type: String, default: null }, // Optional transaction reference hash
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);