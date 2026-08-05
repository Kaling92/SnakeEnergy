const Transaction = require('../models/Transaction');

class TransactionDAO {
  static async create(data, session) {
    const [created] = await Transaction.create([data], session ? { session } : undefined);
    return created;
  }

  static async findById(id, session) {
    return Transaction.findById(id, null, session ? { session } : undefined);
  }

  static async findByHash(txHash, session) {
    return Transaction.findOne({ txHash }, null, session ? { session } : undefined);
  }

  static async findByUser(userId, options, session) {
    const query = Transaction.find({ userId }, null, session ? { session } : undefined)
      .sort(options?.sort || { timestamp: -1 });

    if (options?.skip) {
      query.skip(options.skip);
    }
    if (options?.limit) {
      query.limit(options.limit);
    }

    return query;
  }

  static async countByUser(userId, session) {
    return Transaction.countDocuments({ userId }, session ? { session } : undefined);
  }

  static async findByFilter(filter, options, session) {
    const query = Transaction.find(filter || {}, null, session ? { session } : undefined)
      .sort(options?.sort || { timestamp: -1 });

    if (options?.skip) {
      query.skip(options.skip);
    }
    if (options?.limit) {
      query.limit(options.limit);
    }

    return query;
  }
}

module.exports = TransactionDAO;
