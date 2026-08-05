const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  walletEncryptionKey: process.env.WALLET_ENCRYPTION_KEY || ''
};

function logEnvWarnings(logger) {
  if (!env.jwtSecret) {
    logger.warn('JWT_SECRET is not set. Auth token verification may fail.');
  }
  if (!env.mongoUri) {
    logger.warn('MONGO_URI is not set. Server will run without database connection.');
  }
  if (!env.walletEncryptionKey) {
    logger.warn('WALLET_ENCRYPTION_KEY is not set. Wallet encryption features are not yet enabled.');
  }
}

module.exports = {
  env,
  logEnvWarnings
};
