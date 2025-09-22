const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Transaction = require('../models/Transaction');
const {
  getTransactions,
  getTransaction,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsSummary,
  getTransactionsByDateRange,
  bulkDeleteTransactions
} = require('../controllers/transactions');

// All routes below are protected
router.use(protect);

router
  .route('/')
  .get(advancedResults(Transaction), getTransactions)
  .post(addTransaction)
  .delete(bulkDeleteTransactions);

router
  .route('/summary')
  .get(getTransactionsSummary);

router
  .route('/filter')
  .get(getTransactionsByDateRange);

router
  .route('/:id')
  .get(getTransaction)
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;
