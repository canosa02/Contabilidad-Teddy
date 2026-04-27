import React, { useState, useEffect } from 'react';
import { fetchCategories, createTransaction, toCents } from '../api';

const QuickAdd = ({ onAdd, initialType = 'expense', initialRecurrence = 'none' }) => {
  const [categories, setCategories] = useState([]);
  const [type, setType] = useState(initialType);
  const [recurrence, setRecurrence] = useState(initialRecurrence);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);

  const filteredCategories = categories.filter(c => c.type === type);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be greater than 0.');
      return;
    }
    if (!date) {
      setError('Date is required.');
      return;
    }
    if (!categoryId) {
      setError('Category is required.');
      return;
    }
    
    setLoading(true);
    try {
      await createTransaction({
        type,
        amount_cents: toCents(amount),
        date,
        description,
        category_id: parseInt(categoryId),
        recurrence
      });
      setAmount('');
      setDescription('');
      if (onAdd) onAdd();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="font-semibold text-lg mb-4 text-slate-800">Quick Add</h3>
      
      <div className="flex bg-slate-100 p-1 rounded-lg mb-4">
        <button 
          type="button"
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${type === 'expense' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => { setType('expense'); setCategoryId(''); }}
        >
          Expense
        </button>
        <button 
          type="button"
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${type === 'income' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => { setType('income'); setCategoryId(''); }}
        >
          Income
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-sm rounded-lg border border-rose-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-500 mb-1">Amount (€)</label>
            <input 
              type="number" 
              step="0.01"
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
            <input 
              type="date" 
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
          <select 
            required
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors bg-white"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="" disabled>Select category</option>
            {filteredCategories.map(c => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
          <input 
            type="text" 
            required
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            placeholder="What was this for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Recurrence</label>
          <select 
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors bg-white"
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value)}
          >
            <option value="none">One-time</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={`w-full py-2.5 rounded-lg text-white font-medium transition-colors ${type === 'expense' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'} disabled:opacity-50`}
        >
          {loading ? 'Adding...' : `Add ${type === 'expense' ? 'Expense' : 'Income'}`}
        </button>
      </form>
    </div>
  );
};

export default QuickAdd;
