const db = require('../storage/db');

const COLLECTION = 'transactions';

class QueryBuilder {
  constructor(query) {
    this._query = query;
    this._sort = null;
    this._select = null;
    this._skip = null;
    this._limit = null;
    this._populate = null;
  }

  sort(sortStr) {
    this._sort = sortStr;
    return this;
  }

  select(fields) {
    this._select = fields;
    return this;
  }

  skip(n) {
    this._skip = n;
    return this;
  }

  limit(n) {
    this._limit = n;
    return this;
  }

  populate(path) {
    this._populate = path;
    return this;
  }

  async exec() {
    return db.findWithOptions(COLLECTION, this._query, {
      sort: this._sort,
      select: this._select,
      skip: this._skip,
      limit: this._limit,
      populate: this._populate
    });
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }
}

const Transaction = {
  modelName: 'Transaction',

  find(query = {}) {
    return new QueryBuilder(query);
  },

  findOne(query) {
    const item = db.findOne(COLLECTION, query);
    if (!item) return null;
    return attachMethods(item);
  },

  findById(id) {
    const item = db.findById(COLLECTION, id);
    if (!item) return null;
    return attachMethods(item);
  },

  create(data) {
    const normalized = { ...data };
    if (normalized.amount) {
      normalized.amount = Math.abs(Number(normalized.amount));
    }
    if (normalized.date && typeof normalized.date === 'string') {
      normalized.date = new Date(normalized.date).toISOString();
    }
    return attachMethods(db.create(COLLECTION, normalized));
  },

  findByIdAndUpdate(id, data, options = {}) {
    const updateData = { ...data };
    if (updateData._id) delete updateData._id;
    if (updateData.amount !== undefined) {
      updateData.amount = Math.abs(Number(updateData.amount));
    }
    if (updateData.date && typeof updateData.date === 'string') {
      updateData.date = new Date(updateData.date).toISOString();
    }
    const updated = db.update(COLLECTION, id, updateData);
    if (!updated) return null;
    return attachMethods(updated);
  },

  deleteMany(query) {
    return db.deleteMany(COLLECTION, query);
  },

  countDocuments(query = {}) {
    return db.count(COLLECTION, query);
  }
};

function attachMethods(item) {
  if (!item) return null;
  const doc = {
    ...item,
    deleteOne: async function () {
      return db.deleteOne(COLLECTION, this._id);
    }
  };
  return doc;
}

module.exports = Transaction;
