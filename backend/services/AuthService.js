const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { env } = require('../config/env');
const { UserDAO, WalletDAO, AssetDAO } = require('../dao');

const DEV_FALLBACK_JWT_SECRET = 'dev-insecure-jwt-secret';
const DEV_FALLBACK_ENCRYPTION_KEY = 'dev-wallet-encryption-key';

const WORD_POOL = [
  'alpha', 'amber', 'anchor', 'apex', 'aster', 'atlas', 'beacon', 'blaze', 'bloom', 'canyon',
  'celestial', 'cipher', 'comet', 'crystal', 'delta', 'drift', 'echo', 'ember', 'flux', 'frost',
  'galaxy', 'glint', 'grove', 'harbor', 'horizon', 'jade', 'keystone', 'lagoon', 'lumen', 'matrix',
  'mist', 'nebula', 'nova', 'onyx', 'orbit', 'phoenix', 'plasma', 'quartz', 'raven', 'rift',
  'sable', 'shadow', 'solstice', 'spark', 'terra', 'titan', 'umbra', 'vector', 'vortex', 'zenith'
];

function jwtSecret() {
  return env.jwtSecret || DEV_FALLBACK_JWT_SECRET;
}

function encryptionKey() {
  return env.walletEncryptionKey || DEV_FALLBACK_ENCRYPTION_KEY;
}

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function generateSeedPhrase() {
  const words = [];
  for (let i = 0; i < 12; i += 1) {
    words.push(WORD_POOL[randomInt(WORD_POOL.length)]);
  }
  return words.join(' ');
}

function deriveMockPrivateKey(seedPhrase) {
  return crypto.createHash('sha256').update(`${seedPhrase}:${Date.now()}:${crypto.randomBytes(16).toString('hex')}`).digest('hex');
}

function generatePublicAddress() {
  return `0x${crypto.randomBytes(20).toString('hex')}`;
}

function encryptPrivateKey(privateKey) {
  const keyMaterial = crypto.createHash('sha256').update(encryptionKey()).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', keyMaterial, iv);

  const encrypted = Buffer.concat([cipher.update(privateKey, 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

async function runInTransactionIfPossible(work) {
  if (mongoose.connection.readyState !== 1) {
    return work(null);
  }

  const session = await mongoose.startSession();
  try {
    let output;
    await session.withTransaction(async () => {
      output = await work(session);
    });
    return output;
  } finally {
    await session.endSession();
  }
}

function decimal(value) {
  return mongoose.Types.Decimal128.fromString(String(value));
}

class AuthService {
  static async register(payload) {
    const usernameRaw = String(payload?.username || '').trim();
    const passwordRaw = String(payload?.password || '');
    const fullNameRaw = String(payload?.fullName || '').trim();

    if (!usernameRaw || !passwordRaw) {
      const err = new Error('Username and password are required.');
      err.statusCode = 400;
      throw err;
    }

    const existing = await UserDAO.findByUsernameOrEmail(usernameRaw);
    if (existing) {
      const err = new Error('Identity key or email already synchronized.');
      err.statusCode = 400;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(passwordRaw, 10);
    const seedPhrase = generateSeedPhrase();
    const privateKey = deriveMockPrivateKey(seedPhrase);
    const encryptedPrivateKey = encryptPrivateKey(privateKey);

    const result = await runInTransactionIfPossible(async (session) => {
      const user = await UserDAO.create({
        username: usernameRaw,
        email: usernameRaw,
        fullName: fullNameRaw || undefined,
        passwordHash: hashedPassword,
        password: hashedPassword
      }, session);

      const wallet = await WalletDAO.create({
        userId: user._id,
        publicAddress: generatePublicAddress(),
        encryptedPrivateKey,
        seedPhrase,
        status: 'ACTIVE',

        // Compatibility fields used by existing controllers/pages
        blockchain: 'ethereum',
        address: undefined,
        label: 'ETHEREUM Primary Wallet',
        balances: [
          { token: 'ETH', amount: 1.5 },
          { token: 'BNB', amount: 100 }
        ]
      }, session);

      // Keep legacy address in sync for old controller lookups.
      wallet.address = wallet.publicAddress;
      await WalletDAO.save(wallet, session);

      await AssetDAO.upsertBalance(wallet._id, 'ETH', decimal('1.5'), session);
      await AssetDAO.upsertBalance(wallet._id, 'BNB', decimal('100'), session);
      await AssetDAO.upsertBalance(wallet._id, 'BTC', decimal('0'), session);
      await AssetDAO.upsertBalance(wallet._id, 'SOL', decimal('0'), session);

      return {
        user,
        wallet
      };
    });

    return {
      success: true,
      message: 'User registered successfully!',
      user: {
        id: result.user._id,
        username: result.user.username,
        email: result.user.email
      },
      wallet: {
        address: result.wallet.publicAddress,
        status: result.wallet.status
      }
    };
  }

  static async login(payload) {
    const usernameRaw = String(payload?.username || '').trim();
    const passwordRaw = String(payload?.password || '');

    if (!usernameRaw || !passwordRaw) {
      const err = new Error('Username and password are required.');
      err.statusCode = 400;
      throw err;
    }

    let user = await UserDAO.findByUsernameOrEmail(usernameRaw);
    if (!user) {
      user = await UserDAO.findByFullName(usernameRaw);
    }
    if (!user) {
      user = await UserDAO.findByEmailLocalPart(usernameRaw);
    }
    if (!user) {
      const err = new Error('Invalid identity identifier or access key.');
      err.statusCode = 400;
      throw err;
    }

    const storedHash = user.passwordHash || user.password;
    const isMatch = await bcrypt.compare(passwordRaw, storedHash);
    if (!isMatch) {
      const err = new Error('Invalid identity identifier or access key.');
      err.statusCode = 400;
      throw err;
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret(), { expiresIn: '24h' });

    return {
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    };
  }
}

module.exports = AuthService;
