const Wallet = require('../models/Wallet');

class WalletDAO {
  static async create(data, session) {
    const [created] = await Wallet.create([data], session ? { session } : undefined);
    return created;
  }

  static async findById(id, session) {
    return Wallet.findById(id, null, session ? { session } : undefined);
  }

  static async findByUserId(userId, session) {
    return Wallet.find({ userId }, null, session ? { session } : undefined);
  }

  static async findOneByUserId(userId, session) {
    return Wallet.findOne({ userId }, null, session ? { session } : undefined);
  }

  static async findByPublicAddress(publicAddress, session) {
    return Wallet.findOne({ publicAddress: String(publicAddress || '').toLowerCase() }, null, session ? { session } : undefined);
  }

  static async findByLegacyAddress(address, session) {
    return Wallet.findOne({ address: String(address || '').toLowerCase() }, null, session ? { session } : undefined);
  }

  static async findOneByUserAndBlockchain(userId, blockchain, session) {
    return Wallet.findOne({ userId, blockchain }, null, session ? { session } : undefined);
  }

  static async save(walletDoc, session) {
    return walletDoc.save(session ? { session } : undefined);
  }
}

module.exports = WalletDAO;
