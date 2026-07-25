import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiPlus } from 'react-icons/fi';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { useInView } from '../hooks/useInView';
import api from '../utils/api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const timeRanges = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
];

function AnimatedCard({ children, className = '', delay = '' }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={`${inView ? `animate-fade-up ${delay}` : 'opacity-0'} ${className}`}>
      {children}
    </div>
  );
}

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('month');

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', timeRange],
    queryFn: async () => { const { data } = await api.get(`/transactions/summary?range=${timeRange}`); return data.data; },
  });

  const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(v);

  const barData = data ? {
    labels: data.monthlySummary?.map(i => i.month) || [],
    datasets: [
      { label: 'Income', data: data.monthlySummary?.map(i => i.income) || [], backgroundColor: '#16A34A', borderRadius: 2 },
      { label: 'Expenses', data: data.monthlySummary?.map(i => Math.abs(i.expenses)) || [], backgroundColor: '#DC2626', borderRadius: 2 },
    ],
  } : null;

  const doughnutData = data ? {
    labels: data.categories?.map(c => c.name) || [],
    datasets: [{ data: data.categories?.map(c => Math.abs(c.amount)) || [], backgroundColor: ['#16A34A', '#2563EB', '#D97706', '#7C3AED', '#0891B2', '#DB2777', '#65A30D', '#0D9488'], borderWidth: 0 }],
  } : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-xs text-destructive animate-fade-in">Failed to load dashboard.</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-medium text-foreground">Dashboard</h1>
          <p className="text-xs text-secondary-foreground mt-0.5">Your financial summary</p>
        </div>
        <div className="flex items-center gap-0.5 border border-border rounded-md p-0.5">
          {timeRanges.map((r) => (
            <button
              key={r.value}
              onClick={() => setTimeRange(r.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-all duration-150 ${
                timeRange === r.value ? 'bg-primary text-primary-foreground' : 'text-secondary-foreground hover:text-foreground'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Balance', value: fmt(data?.balance || 0), color: '' },
          { label: 'Income', value: fmt(data?.totalIncome || 0), color: 'text-success' },
          { label: 'Expenses', value: fmt(Math.abs(data?.totalExpenses) || 0), color: 'text-destructive' },
          { label: 'Transactions', value: String(data?.transactionCount || 0), color: '' },
        ].map((stat, i) => (
          <AnimatedCard key={stat.label} delay={`stagger-${i + 1}`}>
            <div className="border border-border rounded-md p-4 group hover:border-primary/20 hover:shadow-sm transition-all duration-200">
              <p className="text-xs text-secondary-foreground">{stat.label}</p>
              <p className={`text-lg font-medium mt-1 tabular-nums ${stat.color}`}>{stat.value}</p>
            </div>
          </AnimatedCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatedCard delay="stagger-3">
          <div className="border border-border rounded-md p-4 group hover:border-primary/20 hover:shadow-sm transition-all duration-200">
            <h3 className="text-xs font-medium text-foreground mb-4">Income vs Expenses</h3>
            <div className="h-64">
              {barData && <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: '#EBEBEB' }, ticks: { callback: (v) => '$' + v } } } }} />}
            </div>
          </div>
        </AnimatedCard>
        <AnimatedCard delay="stagger-4">
          <div className="border border-border rounded-md p-4 group hover:border-primary/20 hover:shadow-sm transition-all duration-200">
            <h3 className="text-xs font-medium text-foreground mb-4">Expense Categories</h3>
            <div className="h-64 flex items-center justify-center">
              {doughnutData && doughnutData.labels.length > 0 ? (
                <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 8, padding: 12, font: { size: 11 } } } } }} />
              ) : (
                <p className="text-xs text-muted-foreground">No data yet</p>
              )}
            </div>
          </div>
        </AnimatedCard>
      </div>

      <AnimatedCard delay="stagger-5">
        <div className="border border-border rounded-md overflow-hidden group hover:border-primary/20 hover:shadow-sm transition-all duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div>
              <h3 className="text-xs font-medium text-foreground">Recent Transactions</h3>
              <p className="text-2xs text-secondary-foreground mt-0.5">Your most recent transactions</p>
            </div>
            <Link
              to="/dashboard/transactions/new"
              className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md px-3 py-1.5 hover:opacity-90 active:scale-[0.97] transition-all duration-150"
            >
              <FiPlus className="h-3 w-3" /> Add
            </Link>
          </div>
          {data?.recentTransactions?.length > 0 ? (
            <div>
              {data.recentTransactions.map((t, i) => (
                <div key={t._id} className={`flex items-center justify-between px-4 py-3 border-b border-border last:border-b-0 hover:bg-secondary/40 transition-colors duration-150 ${i === 0 ? 'animate-slide-up stagger-1' : ''}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.type === 'income' ? 'bg-success' : 'bg-destructive'}`} />
                    <div className="min-w-0">
                      <p className="text-sm text-foreground truncate">{t.description}</p>
                      <p className="text-2xs text-secondary-foreground">{t.category} &middot; {new Date(t.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`text-sm tabular-nums flex-shrink-0 ml-4 ${t.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                    {t.type === 'income' ? '+' : '-'}{fmt(Math.abs(t.amount))}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center animate-fade-in">
              <p className="text-xs text-muted-foreground">No transactions yet.</p>
              <Link to="/dashboard/transactions/new" className="text-xs text-foreground underline underline-offset-2 mt-1 inline-block hover:no-underline transition-all">Add your first</Link>
            </div>
          )}
          {data?.recentTransactions?.length > 0 && (
            <div className="px-4 py-2.5 border-t border-border">
              <Link to="/dashboard/transactions" className="text-xs text-secondary-foreground hover:text-foreground transition-colors">View all &rarr;</Link>
            </div>
          )}
        </div>
      </AnimatedCard>
    </div>
  );
};

export default Dashboard;
