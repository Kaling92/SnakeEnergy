const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { env, logEnvWarnings } = require('./config/env');
const logger = require('./utils/logger');

const authRoutes = require('./routes/authRoutes');
const walletRoutes = require('./routes/walletRoutes');
const nftRoutes = require('./routes/nftRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const swapRoutes = require('./routes/swapRoutes');
const userRoutes = require('./routes/userRoutes');
const vaultRoutes = require('./routes/vaultRoutes');
const yieldRoutes = require('./routes/yieldRoutes');
const txRoutes = require('./routes/txRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const walletController = require('./controllers/walletController');

const app = express();

// Global Middleware
app.use(express.json({ limit: '100kb' }));
app.use(cors());

// Database Hook
logEnvWarnings(logger);
if (env.mongoUri) {
  mongoose.connect(env.mongoUri)
    .then(() => logger.info('MongoDB connected successfully.'))
    .catch((err) => logger.error('MongoDB connection error.', { error: err.message }));
}

// Route Mounting
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/wallets', walletRoutes);
app.get('/api/assets', authMiddleware, walletController.getUserAssets); // canonical polling endpoint for WalletContext
app.use('/api/nfts', nftRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/swap', swapRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vaults', vaultRoutes);
app.use('/api/yield', yieldRoutes);
app.use('/api/transactions', txRoutes);

app.get('/', (req, res) => {
  res.send('Crypto Wallet API status: Online');
});

const PORT = env.port;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

const authController = require('./controllers/authController');

app.post('/api/login', authController.login);
app.post('/api/signup', authController.signup);