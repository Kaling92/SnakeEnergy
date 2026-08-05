const Asset = require('../models/Asset');

class AssetDAO {
  static async create(data, session) {
    const [created] = await Asset.create([data], session ? { session } : undefined);
    return created;
  }

  static async findById(id, session) {
    return Asset.findById(id, null, session ? { session } : undefined);
  }

  static async findByWalletId(walletId, session) {
    return Asset.find({ walletId }, null, session ? { session } : undefined);
  }

  static async findByWalletAndToken(walletId, tokenSymbol, session) {
    return Asset.findOne(
      { walletId, tokenSymbol: String(tokenSymbol || '').toUpperCase() },
      null,
      session ? { session } : undefined
    );
  }

  static async upsertBalance(walletId, tokenSymbol, balance, session) {
    return Asset.findOneAndUpdate(
      { walletId, tokenSymbol: String(tokenSymbol || '').toUpperCase() },
      {
        $set: {
          tokenSymbol: String(tokenSymbol || '').toUpperCase(),
          balance,
          availableBalance: balance,
          updatedAt: new Date(),
          lastSyncedAt: new Date()
        },
        $setOnInsert: {
          walletId
        }
      },
      {
        new: true,
        upsert: true,
        ...(session ? { session } : {})
      }
    );
  }

  static async save(assetDoc, session) {
    return assetDoc.save(session ? { session } : undefined);
  }
}

module.exports = AssetDAO;
