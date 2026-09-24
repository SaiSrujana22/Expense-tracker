import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await client.get('/api/analytics/summary');
        setSummary(res.data);
      } catch (error) {
        console.error("Failed to fetch summary", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <div className="animate-pulse flex space-x-4">Loading dashboard...</div>;
  if (!summary) return <div>Failed to load data.</div>;

  const COLORS = ['#d4af37', '#a3a3a3', '#525252', '#737373', '#262626', '#171717'];

  const isOveruse = summary.total_expense > 0 && summary.net_income > 0 && summary.net_income < 1000;
  const isInDebt = summary.net_income <= 0 && summary.total_expense > 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold font-serif tracking-wide">Dashboard</h1>
        <p className="text-slate-400 uppercase tracking-widest text-xs">Welcome, <span className="text-white font-bold">{user?.username}</span></p>
      </div>

      {isInDebt && (
        <div className="bg-red-900/20 border border-red-900 p-4 rounded-xl flex items-center space-x-3 text-red-500 animate-pulse">
          <AlertTriangle className="w-6 h-6 flex-shrink-0" />
          <div>
            <h3 className="font-bold font-serif">Critical Warning: In Debt</h3>
            <p className="text-sm text-red-400">Your expenses have exceeded your income. Review transactions.</p>
          </div>
        </div>
      )}

      {isOveruse && !isInDebt && (
        <div className="bg-amber-900/20 border border-amber-900/50 p-4 rounded-xl flex items-center space-x-3 text-amber-500">
          <AlertTriangle className="w-6 h-6 flex-shrink-0" />
          <div>
            <h3 className="font-bold font-serif">Warning: Nearing Overuse</h3>
            <p className="text-sm text-amber-400/80">Your net income has dropped below $1,000.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex flex-col justify-between hover:border-slate-500 transition-all">
          <div className="flex items-center space-x-3 text-slate-300">
            <div className="bg-slate-800 p-2 rounded-lg border border-slate-700"><TrendingUp className="w-5 h-5 text-slate-400" /></div>
            <h3 className="font-serif tracking-wide text-lg text-slate-200">Total Income</h3>
          </div>
          <p className="text-4xl font-bold mt-4 font-serif">${summary.total_income.toFixed(2)}</p>
        </div>
        
        <div className="glass-card p-6 flex flex-col justify-between hover:border-slate-500 transition-all">
          <div className="flex items-center space-x-3 text-slate-300">
            <div className="bg-slate-800 p-2 rounded-lg border border-slate-700"><TrendingDown className="w-5 h-5 text-slate-400" /></div>
            <h3 className="font-serif tracking-wide text-lg text-slate-200">Total Expense</h3>
          </div>
          <p className="text-4xl font-bold mt-4 font-serif">${summary.total_expense.toFixed(2)}</p>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between hover:border-slate-500 transition-all">
          <div className="flex items-center space-x-3 text-slate-300">
            <div className="bg-slate-800 p-2 rounded-lg border border-slate-700"><DollarSign className="w-5 h-5 text-slate-400" /></div>
            <h3 className="font-serif tracking-wide text-lg text-slate-200">Net Income</h3>
          </div>
          <p className="text-4xl font-bold mt-4 font-serif text-[#d4af37]">${summary.net_income.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-6 font-serif">Expense Breakdown</h2>
          {summary.category_breakdown.length > 0 ? (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.category_breakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {summary.category_breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-slate-500">
              No expense data available to visualize.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
