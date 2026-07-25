const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../storage/db');

const COLLECTION = 'users';

function attachMethods(user) {
  if (!user) return null;
  return {
    ...user,
    matchPassword: async function (enteredPassword) {
      return bcrypt.compare(enteredPassword, this.password);
    },
    getSignedJwtToken: function () {
      return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d',
      });
    },
    save: async function () {
      if (this.password) {
        const salt = bcrypt.genSaltSync(10);
        this.password = bcrypt.hashSync(this.password, salt);
      }
      const updateData = { ...this };
      delete updateData._id;
      delete updateData.createdAt;
      delete updateData.updatedAt;
      delete updateData.matchPassword;
      delete updateData.getSignedJwtToken;
      delete updateData.save;
      return db.update(COLLECTION, this._id, updateData);
    }
  };
}

const User = {
  findById(id) {
    const user = db.findById(COLLECTION, id);
    if (!user) return null;
    const { password, ...safe } = user;
    return attachMethods(safe);
  },

  findOne(query) {
    const user = db.findOne(COLLECTION, query);
    if (!user) return null;
    const { password, ...safe } = user;
    return attachMethods(safe);
  },

  create(data) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(data.password, salt);
    const created = db.create(COLLECTION, {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      theme: 'light',
      currency: 'USD'
    });
    const { password, ...safe } = created;
    return attachMethods(safe);
  },

  findByIdAndUpdate(id, data, options = {}) {
    const updateData = { ...data };
    if (updateData.password) {
      const salt = bcrypt.genSaltSync(10);
      updateData.password = bcrypt.hashSync(updateData.password, salt);
    }
    if (updateData._id) delete updateData._id;
    const updated = db.update(COLLECTION, id, updateData);
    if (!updated) return null;
    const { password, ...safe } = updated;
    return attachMethods(safe);
  },

  findByIdAndDelete(id) {
    const deleted = db.deleteOne(COLLECTION, id);
    if (!deleted) return null;
    const { password, ...safe } = deleted;
    return safe;
  },

  findByEmailWithPassword(email) {
    const user = db.findOne(COLLECTION, { email });
    if (!user) return null;
    return attachMethods(user);
  }
};

module.exports = User;
