import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { Plus, Trash2, Receipt, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import clsx from 'clsx';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    description: '',
    is_recurring: false
  });

  const fetchTransactions = async () => {
    try {
      const res = await client.get('/api/transactions');
      setTransactions(res.data.sort((a, b) => b.id - a.id));
    } catch (error) {
      console.error("Failed to fetch transactions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await client.delete(`/api/transactions/${id}`);
        fetchTransactions();
      } catch (error) {
        console.error("Failed to delete", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await client.post('/api/transactions', {
        ...formData,
        amount: parseFloat(formData.amount)
      });
      setShowModal(false);
      setFormData({ amount: '', type: 'expense', category: '', description: '', is_recurring: false });
      fetchTransactions();
    } catch (error) {
      console.error("Failed to create transaction", error);
      alert('Failed to create transaction');
    }
  };

  const categories = formData.type === 'expense' 
    ? ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Rent', 'Other']
    : ['Salary', 'Freelance', 'Investments', 'Gift', 'Other'];

  if (loading) return <div>Loading transactions...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold font-serif tracking-wide">Transactions</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Add Transaction
        </button>
      </div>

      <div className="glass-card overflow-hidden border border-slate-700">
        {transactions.length > 0 ? (
          <div className="divide-y divide-slate-800">
            {transactions.map((t) => (
              <div key={t.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={clsx(
                    "p-3 rounded-xl border",
                    t.type === 'income' ? "bg-slate-800 text-slate-200 border-slate-600" : "bg-slate-900 text-slate-500 border-slate-800"
                  )}>
                    {t.type === 'income' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="font-semibold font-serif text-lg text-slate-200">{t.category}</h4>
                    <p className="text-sm text-slate-400">
                      {t.description || 'No description'} 
                      {t.is_recurring && <span className="ml-2 px-2 py-0.5 rounded-full border border-slate-600 text-slate-400 text-xs uppercase tracking-wider">Recurring</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className={clsx(
                    "font-bold font-serif text-lg",
                    t.type === 'income' ? "text-[#d4af37]" : "text-slate-500"
                  )}>
                    {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                  </div>
                  <button onClick={() => handleDelete(t.id)} className="text-slate-600 hover:text-white transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <Receipt className="w-16 h-16 mb-4 opacity-30" />
            <p className="font-serif">No transactions yet. Add one to get started!</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200 border border-slate-600">
            <h2 className="text-2xl font-bold font-serif mb-6 text-white">New Transaction</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-slate-900 p-1 rounded-xl mb-4 border border-slate-800">
                <button
                  type="button"
                  className={clsx("py-2 rounded-lg font-bold uppercase tracking-wider text-sm transition-all", formData.type === 'expense' ? 'bg-slate-200 text-black shadow-md' : 'text-slate-500 hover:text-slate-300')}
                  onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
                >
                  Expense
                </button>
                <button
                  type="button"
                  className={clsx("py-2 rounded-lg font-bold uppercase tracking-wider text-sm transition-all", formData.type === 'income' ? 'bg-slate-200 text-black shadow-md' : 'text-slate-500 hover:text-slate-300')}
                  onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
                >
                  Income
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1 uppercase tracking-widest text-xs">Amount ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required 
                  className="input-field text-xl font-serif" 
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
              </div>

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
                <label className="block text-sm font-medium text-slate-400 mb-1 uppercase tracking-widest text-xs">Description (Optional)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="What was this for?"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input 
                  type="checkbox" 
                  id="recurring"
                  className="w-4 h-4 rounded text-slate-500 focus:ring-slate-500 bg-slate-900 border-slate-700"
                  checked={formData.is_recurring}
                  onChange={(e) => setFormData({...formData, is_recurring: e.target.checked})}
                />
                <label htmlFor="recurring" className="text-sm text-slate-400">This is a recurring monthly transaction</label>
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
