const db = require('../storage/db');

const COLLECTION = 'categories';

class CategoryQueryBuilder {
  constructor(query) {
    this._query = query;
    this._sort = null;
  }

  sort(sortStr) {
    this._sort = sortStr;
    return this;
  }

  async exec() {
    let items = db.find(COLLECTION, this._query);
    if (this._sort) {
      const field = this._sort.replace(/^-/, '');
      const order = this._sort.startsWith('-') ? -1 : 1;
      items.sort((a, b) => {
        if (a[field] < b[field]) return -1 * order;
        if (a[field] > b[field]) return 1 * order;
        return 0;
      });
    }
    return items;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }
}

function attachMethods(item) {
  if (!item) return null;
  return {
    ...item,
    deleteOne: async function () {
      return db.deleteOne(COLLECTION, this._id);
    },
    toString: function () {
      return this._id;
    }
  };
}

const Category = {
  find(query = {}) {
    return new CategoryQueryBuilder(query);
  },

  findOne(query) {
    return db.findOne(COLLECTION, query);
  },

  findById(id) {
    return attachMethods(db.findById(COLLECTION, id));
  },

  create(data) {
    return db.create(COLLECTION, data);
  },

  findByIdAndUpdate(id, data, options = {}) {
    const updateData = { ...data };
    if (updateData._id) delete updateData._id;
    return db.update(COLLECTION, id, updateData);
  },

  deleteOne(query) {
    if (typeof query === 'string') {
      return db.deleteOne(COLLECTION, query);
    }
    const item = db.findOne(COLLECTION, query);
    if (!item) return null;
    return db.deleteOne(COLLECTION, item._id);
  }
};

module.exports = Category;
