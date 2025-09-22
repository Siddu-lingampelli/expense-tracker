const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount'],
    min: [0.01, 'Amount must be greater than 0']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      // Income categories - Capitalized to match frontend
      'Salary', 'Freelance', 'Investments', 'Stocks', 'Bitcoin', 'Bank', 'YouTube', 'Other',
      // Expense categories
      'Food & Dining', 'Shopping', 'Housing', 'Transportation', 'Entertainment',
      'Healthcare', 'Education', 'Utilities', 'Insurance', 'Personal Care',
      'Gifts & Donations', 'Travel', 'Business'
    ]
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot be more than 200 characters'],
    trim: true
  },
  account: {
    type: String,
    default: 'Cash',
    enum: ['Cash', 'Bank Account', 'Credit Card', 'Digital Wallet']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add index for better query performance
transactionSchema.index({ user: 1, date: -1 });

transactionSchema.pre('save', function(next) {
  // Ensure amount is positive for both income and expense
  this.amount = Math.abs(this.amount);
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
