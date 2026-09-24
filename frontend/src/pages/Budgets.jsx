import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { Target, Plus } from 'lucide-react';
import clsx from 'clsx';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ category: '', limit_amount: '' });

  const fetchData = async () => {
    try {
      const [budgetsRes, transRes] = await Promise.all([
        client.get('/api/budgets'),
        client.get('/api/transactions')
      ]);
      setBudgets(budgetsRes.data);
      setTransactions(transRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const today = new Date();
      await client.post('/api/budgets', {
        ...formData,
        limit_amount: parseFloat(formData.limit_amount),
        month: today.getMonth() + 1,
        year: today.getFullYear()
      });
      setShowModal(false);
      setFormData({ category: '', limit_amount: '' });
      fetchData();
    } catch (error) {
      console.error("Failed to create budget", error);
      alert('Failed to create budget');
    }
  };

  const getSpentAmount = (category) => {
    return transactions
      .filter(t => t.type === 'expense' && t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Rent', 'Other'];

  if (loading) return <div>Loading budgets...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold font-serif tracking-wide">Category Budgets</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Set Budget
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.length > 0 ? (
          budgets.map(budget => {
            const spent = getSpentAmount(budget.category);
            const percentage = Math.min((spent / budget.limit_amount) * 100, 100);
            const isOver = spent > budget.limit_amount;
            
            return (
              <div key={budget.id} className="glass-card p-6 border border-slate-700 hover:border-slate-500 transition-all">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-slate-800 border border-slate-700 p-2 rounded-xl text-slate-300">
                      <Target className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold font-serif">{budget.category}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-200 font-serif">${spent.toFixed(0)} <span className="text-sm text-slate-500 font-normal">/ ${budget.limit_amount}</span></p>
                  </div>
                </div>

                <div className="w-full bg-slate-900 rounded-full h-3 mb-2 overflow-hidden border border-slate-800">
                  <div 
                    className={clsx(
                      "h-3 rounded-full transition-all duration-500 ease-out",
                      percentage < 75 ? "bg-slate-400" : percentage < 100 ? "bg-slate-600" : "bg-red-900"
                    )}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                
                <p className={clsx("text-sm", isOver ? "text-red-500 font-bold" : "text-slate-400")}>
                  {isOver 
                    ? `Over budget by $${(spent - budget.limit_amount).toFixed(2)}` 
                    : `$${(budget.limit_amount - spent).toFixed(2)} remaining`}
                </p>
              </div>
            )
          })
        ) : (
          <div className="col-span-full glass-card p-12 text-center text-slate-500 flex flex-col items-center">
            <Target className="w-16 h-16 mb-4 opacity-30" />
            <p className="font-serif">No budgets set up. Set a limit for a category to track your spending!</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200 border border-slate-600">
            <h2 className="text-2xl font-bold font-serif mb-6 text-white">Set Category Budget</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1 uppercase tracking-widest text-xs">Category</label>
                <select 
                  required
                  className="input-field"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1 uppercase tracking-widest text-xs">Monthly Limit ($)</label>
                <input 
                  type="number" 
                  step="1"
                  required 
                  className="input-field text-xl font-serif" 
                  placeholder="0"
                  value={formData.limit_amount}
                  onChange={(e) => setFormData({...formData, limit_amount: e.target.value})}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Budget</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;
