const Transaction = require('../models/Transaction');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
exports.getTransaction = asyncHandler(async (req, res, next) => {
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!transaction) {
    return next(
      new ErrorResponse(`No transaction with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: transaction
  });
});

// @desc    Add transaction
// @route   POST /api/transactions
// @access  Private
exports.addTransaction = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  const transaction = await Transaction.create(req.body);

  res.status(201).json({
    success: true,
    data: transaction
  });
});

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
exports.updateTransaction = asyncHandler(async (req, res, next) => {
  let transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    return next(
      new ErrorResponse(`No transaction with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is transaction owner
  if (transaction.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this transaction`,
        401
      )
    );
  }

  transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: transaction
  });
});

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
exports.deleteTransaction = asyncHandler(async (req, res, next) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    return next(
      new ErrorResponse(`No transaction with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is transaction owner
  if (transaction.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this transaction`,
        401
      )
    );
  }

  await transaction.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get transactions summary
// @route   GET /api/transactions/summary
// @access  Private
exports.getTransactionsSummary = asyncHandler(async (req, res, next) => {
  const { range = 'month' } = req.query;
  
  // Calculate date range based on range parameter
  let startDate, endDate = new Date();
  
  switch (range) {
    case 'week':
      startDate = new Date(new Date().setDate(new Date().getDate() - 7));
      break;
    case 'year':
      startDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
      break;
    default: // month
      startDate = new Date(new Date().setMonth(new Date().getMonth() - 1));
  }

  // Get all transactions for the user in the date range
  const transactions = await Transaction.find({
    user: req.user.id,
    date: { $gte: startDate, $lte: endDate }
  }).sort('-date');

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const balance = totalIncome - totalExpenses;

  // Group by categories for expenses
  const expenseCategories = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      if (!expenseCategories[t.category]) {
        expenseCategories[t.category] = 0;
      }
      expenseCategories[t.category] += Math.abs(t.amount);
    });

  const categories = Object.entries(expenseCategories).map(([name, amount]) => ({
    name,
    amount
  }));

  // Monthly summary for charts (last 6 months)
  const monthlySummary = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - i);
    monthStart.setDate(1);
    
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setDate(0);

    const monthTransactions = transactions.filter(t => 
      t.date >= monthStart && t.date <= monthEnd
    );

    const monthIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const monthExpenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    monthlySummary.push({
      month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      income: monthIncome,
      expenses: monthExpenses
    });
  }

  // Recent transactions (last 5)
  const recentTransactions = transactions.slice(0, 5);

  res.status(200).json({
    success: true,
    data: {
      balance,
      totalIncome,
      totalExpenses,
      transactionCount: transactions.length,
      categories,
      monthlySummary,
      recentTransactions
    }
  });
});

// @desc    Get transactions by date range
// @route   GET /api/transactions/filter
// @access  Private
exports.getTransactionsByDateRange = asyncHandler(async (req, res, next) => {
  const { startDate, endDate, type, category } = req.query;
  
  let query = { user: req.user.id };
  
  // Date range filter
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  // Type filter (income/expense)
  if (type) {
    query.type = type;
  }
  
  // Category filter
  if (category) {
    query.category = category;
  }

  // Execute query
  const transactions = await Transaction.find(query)
    .sort('-date')
    .populate('user', 'name email');

  res.status(200).json({
    success: true,
    count: transactions.length,
    data: transactions
  });
});

// @desc    Bulk delete transactions
// @route   DELETE /api/transactions
// @access  Private
exports.bulkDeleteTransactions = asyncHandler(async (req, res, next) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return next(new ErrorResponse('Please provide transaction IDs to delete', 400));
  }

  // Find transactions to ensure they belong to the user
  const transactions = await Transaction.find({
    _id: { $in: ids },
    user: req.user.id
  });

  if (transactions.length !== ids.length) {
    return next(new ErrorResponse('Some transactions not found or unauthorized', 404));
  }

  // Delete the transactions
  await Transaction.deleteMany({
    _id: { $in: ids },
    user: req.user.id
  });

  res.status(200).json({
    success: true,
    data: {},
    message: `${transactions.length} transactions deleted successfully`
  });
});
