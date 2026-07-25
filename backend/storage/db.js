const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, '..', 'data', 'database.json');

const DEFAULT_DATA = {
  users: [],
  transactions: [],
  categories: []
};

class Database {
  constructor() {
    this.data = null;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        this.data = JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error loading database, starting fresh:', err.message);
    }
    if (!this.data || typeof this.data !== 'object') {
      this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
      this.persist();
    }
  }

  persist() {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  _matches(item, query) {
    if (!query || Object.keys(query).length === 0) return true;
    return Object.keys(query).every(key => {
      if (key === '$or') {
        return query.$or.some(clause => this._matches(item, clause));
      }
      if (key === '$and') {
        return query.$and.every(clause => this._matches(item, clause));
      }
      const qVal = query[key];
      const iVal = item[key];
      if (qVal !== null && typeof qVal === 'object' && !Array.isArray(qVal)) {
        return Object.keys(qVal).every(op => {
          switch (op) {
            case '$gte':
              if (iVal instanceof Date || typeof iVal === 'string' || typeof iVal === 'number') {
                return new Date(iVal).getTime() >= new Date(qVal[op]).getTime();
              }
              return false;
            case '$lte':
              if (iVal instanceof Date || typeof iVal === 'string' || typeof iVal === 'number') {
                return new Date(iVal).getTime() <= new Date(qVal[op]).getTime();
              }
              return false;
            case '$in':
              return Array.isArray(qVal[op]) && qVal[op].includes(iVal);
            case '$ne':
              return iVal !== qVal[op];
            default:
              return true;
          }
        });
      }
      if (qVal && typeof qVal === 'object' && qVal.$regex) {
        const flags = qVal.$options || '';
        try {
          return new RegExp(qVal.$regex, flags).test(String(iVal || ''));
        } catch {
          return false;
        }
      }
      if (key === 'user') {
        return String(iVal) === String(qVal);
      }
      return iVal === qVal;
    });
  }

  _now() {
    return new Date().toISOString();
  }

  _id() {
    return crypto.randomBytes(12).toString('hex');
  }

  findOne(collection, query) {
    const items = this.data[collection] || [];
    return items.find(item => this._matches(item, query)) || null;
  }

  find(collection, query = {}) {
    const items = this.data[collection] || [];
    let filtered = items.filter(item => this._matches(item, query));
    return filtered;
  }

  findById(collection, id) {
    const items = this.data[collection] || [];
    return items.find(item => item._id === id) || null;
  }

  create(collection, data) {
    const items = this.data[collection] || [];
    const now = this._now();
    const newItem = {
      _id: this._id(),
      ...data,
      createdAt: now,
      updatedAt: now
    };
    items.push(newItem);
    this.data[collection] = items;
    this.persist();
    return JSON.parse(JSON.stringify(newItem));
  }

  update(collection, id, data) {
    const items = this.data[collection] || [];
    const index = items.findIndex(item => item._id === id);
    if (index === -1) return null;
    const updated = {
      ...items[index],
      ...data,
      _id: id,
      updatedAt: this._now()
    };
    items[index] = updated;
    this.data[collection] = items;
    this.persist();
    return JSON.parse(JSON.stringify(updated));
  }

  deleteOne(collection, id) {
    const items = this.data[collection] || [];
    const index = items.findIndex(item => item._id === id);
    if (index === -1) return null;
    const deleted = items.splice(index, 1)[0];
    this.data[collection] = items;
    this.persist();
    return deleted;
  }

  deleteMany(collection, query) {
    const items = this.data[collection] || [];
    const toDelete = items.filter(item => this._matches(item, query));
    const ids = new Set(toDelete.map(i => i._id));
    this.data[collection] = items.filter(item => !ids.has(item._id));
    this.persist();
    return toDelete;
  }

  findWithOptions(collection, query = {}, options = {}) {
    let items = this.find(collection, query);

    if (options.sort) {
      const sortField = options.sort.replace(/^-/, '');
      const sortOrder = options.sort.startsWith('-') ? -1 : 1;
      items.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return aVal.localeCompare(bVal) * sortOrder;
        }
        if (aVal < bVal) return -1 * sortOrder;
        if (aVal > bVal) return 1 * sortOrder;
        return 0;
      });
    }

    if (options.select) {
      const fields = options.select.split(' ').filter(Boolean);
      const excludeMode = fields.some(f => f.startsWith('-'));
      if (excludeMode) {
        const exclude = new Set(fields.map(f => f.replace(/^-/, '')));
        items = items.map(item => {
          const result = {};
          Object.keys(item).forEach(k => {
            if (!exclude.has(k)) result[k] = item[k];
          });
          return result;
        });
      } else {
        items = items.map(item => {
          const result = {};
          fields.forEach(f => result[f] = item[f]);
          return result;
        });
      }
    }

    if (options.skip) {
      items = items.slice(options.skip);
    }

    if (options.limit) {
      items = items.slice(0, options.limit);
    }

    if (options.populate) {
      const populateArr = Array.isArray(options.populate) ? options.populate : [options.populate];
      items = items.map(item => {
        const result = { ...item };
        populateArr.forEach(pop => {
          const refField = typeof pop === 'string' ? pop : pop.path;
          const refId = result[refField];
          if (refId) {
            const refCollection = refField === 'user' ? 'users' : refField + 's';
            const refDoc = this.findById(refCollection, refId);
            if (refDoc) {
              const select = typeof pop === 'object' ? pop.select : null;
              if (select) {
                const fields = select.split(' ');
                const filtered = {};
                fields.forEach(f => { filtered[f] = refDoc[f]; });
                result[refField] = filtered;
              } else {
                result[refField] = refDoc;
              }
            }
          }
        });
        return result;
      });
    }

    return items;
  }

  count(collection, query = {}) {
    return this.find(collection, query).length;
  }
}

const instance = new Database();

module.exports = instance;
