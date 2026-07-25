import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import api from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Analytics = () => {
  const [dateRange, setDateRange] = useState('month');
  const [chartType, setChartType] = useState('category');

  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case 'week': return { startDate: format(subDays(now, 7), 'yyyy-MM-dd'), endDate: format(now, 'yyyy-MM-dd') };
      case 'month': return { startDate: format(startOfMonth(now), 'yyyy-MM-dd'), endDate: format(endOfMonth(now), 'yyyy-MM-dd') };
      case 'year': return { startDate: format(new Date(now.getFullYear(), 0, 1), 'yyyy-MM-dd'), endDate: format(now, 'yyyy-MM-dd') };
      default: return { startDate: format(startOfMonth(now), 'yyyy-MM-dd'), endDate: format(endOfMonth(now), 'yyyy-MM-dd') };
    }
  };

  const { data: summary } = useQuery({
    queryKey: ['analytics', dateRange],
    queryFn: async () => { const r = await api.get(`/transactions/summary?range=${dateRange}`); return r.data.data; },
  });

  const { data: transactions } = useQuery({
    queryKey: ['analytics-tx', dateRange],
    queryFn: async () => { const { startDate, endDate } = getDateRange(); const r = await api.get(`/transactions/filter?startDate=${startDate}&endDate=${endDate}`); return r.data.data; },
  });

  const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(v);

  const getCategoryData = () => {
    if (!transactions) return null;
    const cats = {};
    transactions.filter(t => t.type === 'expense').forEach(t => { cats[t.category] = (cats[t.category] || 0) + t.amount; });
    const labels = Object.keys(cats);
    return labels.length ? { labels, datasets: [{ data: Object.values(cats), backgroundColor: ['#16A34A', '#2563EB', '#D97706', '#7C3AED', '#0891B2', '#DB2777', '#65A30D', '#0D9488'], borderWidth: 0 }] } : null;
  };

  const getMonthlyData = () => {
    if (!transactions) return null;
    const md = {};
    transactions.forEach(t => { const m = format(new Date(t.date), 'MMM yyyy'); if (!md[m]) md[m] = { income: 0, expense: 0 }; md[m][t.type] += t.amount; });
    const labels = Object.keys(md).sort();
    return labels.length ? { labels, datasets: [
      { label: 'Income', data: labels.map(m => md[m].income), backgroundColor: '#16A34A', borderRadius: 2 },
      { label: 'Expenses', data: labels.map(m => md[m].expense), backgroundColor: '#DC2626', borderRadius: 2 },
    ] } : null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-medium text-foreground">Analytics</h1>
          <p className="text-xs text-secondary-foreground mt-0.5">Insights into your spending</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="text-xs rounded-md border border-input bg-background px-2 py-1.5 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <option value="week">Last 7 days</option>
            <option value="month">This month</option>
            <option value="year">This year</option>
          </select>
          <select value={chartType} onChange={(e) => setChartType(e.target.value)} className="text-xs rounded-md border border-input bg-background px-2 py-1.5 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <option value="category">By category</option>
            <option value="monthly">Monthly trend</option>
          </select>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Balance', value: fmt(summary.balance || 0), color: (summary.balance || 0) >= 0 ? 'text-success' : 'text-destructive' },
            { label: 'Income', value: fmt(summary.totalIncome || 0), color: 'text-success' },
            { label: 'Expenses', value: fmt(Math.abs(summary.totalExpenses) || 0), color: 'text-destructive' },
            { label: 'Transactions', value: String(summary.transactionCount || 0), color: '' },
          ].map(s => (
            <div key={s.label} className="border border-border rounded-md p-4">
              <p className="text-xs text-secondary-foreground">{s.label}</p>
              <p className={`text-lg font-medium mt-1 tabular-nums ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="border border-border rounded-md p-4">
        <h2 className="text-xs font-medium text-foreground mb-4">
          {chartType === 'category' ? 'Expenses by Category' : 'Monthly Income vs Expenses'}
        </h2>
        <div className="h-80">
          {chartType === 'category' ? (
            getCategoryData() ? <Doughnut data={getCategoryData()} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 8, padding: 12, font: { size: 11 } } } } }} />
              : <div className="flex items-center justify-center h-full text-xs text-muted-foreground">No data</div>
          ) : (
            getMonthlyData() ? <Bar data={getMonthlyData()} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { boxWidth: 8, font: { size: 11 } } } }, scales: { x: { grid: { display: false } }, y: { grid: { color: '#EBEBEB' }, beginAtZero: true, ticks: { callback: (v) => '$' + v } } } }} />
              : <div className="flex items-center justify-center h-full text-xs text-muted-foreground">No data</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
