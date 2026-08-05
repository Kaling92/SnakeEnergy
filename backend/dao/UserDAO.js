const User = require('../models/User');

class UserDAO {
  static async create(data, session) {
    const [created] = await User.create([data], session ? { session } : undefined);
    return created;
  }

  static async findById(id, projection, session) {
    return User.findById(id, projection || null, session ? { session } : undefined);
  }

  static async findByUsername(username, session) {
    return User.findOne({ username }, null, session ? { session } : undefined);
  }

  static async findByUsernameOrEmail(identity, session) {
    return User.findOne(
      {
        $or: [{ username: identity }, { email: identity }]
      },
      null,
      session ? { session } : undefined
    );
  }

  static async findByFullName(identity, session) {
    return User.findOne(
      {
        fullName: { $regex: `^${String(identity || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
      },
      null,
      session ? { session } : undefined
    );
  }

  static async findByEmailLocalPart(identity, session) {
    const local = String(identity || '').trim().toLowerCase();
    if (!local || local.includes('@')) return null;
    return User.findOne(
      {
        email: { $regex: `^${local}@`, $options: 'i' }
      },
      null,
      session ? { session } : undefined
    );
  }

  static async updateById(id, updates, session) {
    return User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, ...(session ? { session } : {}) }
    );
  }
}

module.exports = UserDAO;
