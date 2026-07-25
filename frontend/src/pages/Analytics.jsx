import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import api from '../utils/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics = () => {
  const [dateRange, setDateRange] = useState('month');
  const [chartType, setChartType] = useState('category');

  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case 'week':
        return {
          startDate: format(subDays(now, 7), 'yyyy-MM-dd'),
          endDate: format(now, 'yyyy-MM-dd'),
        };
      case 'month':
        return {
          startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
        };
      case 'year':
        return {
          startDate: format(new Date(now.getFullYear(), 0, 1), 'yyyy-MM-dd'),
          endDate: format(now, 'yyyy-MM-dd'),
        };
      default:
        return {
          startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
        };
    }
  };

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics', dateRange],
    queryFn: async () => {
      // Use the existing summary endpoint with range parameter
      const response = await api.get(`/transactions/summary?range=${dateRange}`);
      return response.data.data;
    },
  });

  const { data: transactions } = useQuery({
    queryKey: ['transactions-analytics', dateRange],
    queryFn: async () => {
      const { startDate, endDate } = getDateRange();
      // Use the filter endpoint with proper date format
      const response = await api.get(`/transactions/filter?startDate=${startDate}&endDate=${endDate}`);
      return response.data.data;
    },
  });

  const getCategoryData = () => {
    if (!transactions) return { labels: [], datasets: [] };

    const categoryTotals = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + transaction.amount;
      });

    return {
      labels: Object.keys(categoryTotals),
      datasets: [
        {
          data: Object.values(categoryTotals),
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
            '#FF6384',
            '#C9CBCF',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const getMonthlyData = () => {
    if (!transactions) return { labels: [], datasets: [] };

    const monthlyData = {};
    transactions.forEach(transaction => {
      const month = format(new Date(transaction.date), 'MMM yyyy');
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expense: 0 };
      }
      monthlyData[month][transaction.type] += transaction.amount;
    });

    const labels = Object.keys(monthlyData).sort();
    
    return {
      labels,
      datasets: [
        {
          label: 'Income',
          data: labels.map(month => monthlyData[month].income),
          backgroundColor: '#10B981',
          borderColor: '#059669',
          borderWidth: 1,
        },
        {
          label: 'Expenses',
          data: labels.map(month => monthlyData[month].expense),
          backgroundColor: '#EF4444',
          borderColor: '#DC2626',
          borderWidth: 1,
        },
      ],
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        
        <div className="flex flex-wrap gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="category">By Category</option>
            <option value="monthly">Monthly Trend</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      {analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Total Balance
            </h3>
            <p className={`text-2xl font-bold mt-2 ${
              (analyticsData.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ${(analyticsData.balance || 0).toFixed(2)}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Total Income
            </h3>
            <p className="text-2xl font-bold text-green-600 mt-2">
              ${(analyticsData.totalIncome || 0).toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Income transactions
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Total Expenses
            </h3>
            <p className="text-2xl font-bold text-red-600 mt-2">
              ${(analyticsData.totalExpenses || 0).toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Expense transactions
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Transaction Count
            </h3>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {analyticsData.transactionCount || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Total transactions
            </p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {chartType === 'category' ? 'Expenses by Category' : 'Monthly Income vs Expenses'}
        </h2>
        
        <div className="h-96">
          {chartType === 'category' ? (
            <Doughnut
              data={getCategoryData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  },
                },
              }}
            />
          ) : (
            <Bar
              data={getMonthlyData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
