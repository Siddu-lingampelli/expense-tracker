const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Backend server is working!' });
});

// Dashboard test route
app.get('/api/transactions/summary', (req, res) => {
  res.json({
    success: true,
    data: {
      balance: 1000,
      totalIncome: 5000,
      totalExpenses: 4000,
      transactionCount: 10,
      categories: [
        { name: 'Food', amount: 500 },
        { name: 'Transport', amount: 300 }
      ],
      monthlySummary: [
        { month: 'Jan 2025', income: 1000, expenses: 800 },
        { month: 'Feb 2025', income: 1200, expenses: 900 }
      ],
      recentTransactions: [
        {
          _id: '1',
          description: 'Grocery shopping',
          category: 'Food',
          amount: -50,
          date: new Date().toISOString()
        }
      ]
    }
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
