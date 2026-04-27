import React, { useState, useEffect } from 'react';
import { Filter, Loader2, Download } from 'lucide-react';
import { fetchTransactions, fetchCategories } from '../api';
import TransactionList from '../components/TransactionList';
import QuickAdd from '../components/QuickAdd';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterMonth, setFilterMonth] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const cats = await fetchCategories();
      setCategories(cats);
      
      const params = {};
      if (filterMonth) params.month = filterMonth;
      if (filterType !== 'all') params.type = filterType;
      if (filterCategory) params.category_id = filterCategory;
      
      const trans = await fetchTransactions(params);
      setTransactions(trans);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!transactions.length) return;

    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount (EUR)', 'Recurrence'];
    
    const rows = transactions.map(t => [
      t.date,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${(t.category_name || '').replace(/"/g, '""')}"`,
      t.type,
      (t.amount_cents / 100).toFixed(2),
      t.recurrence
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    const dateObj = new Date();
    const currentMonth = filterMonth || `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', `transacciones-${currentMonth}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    loadData();
  }, [filterMonth, filterType, filterCategory]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center justify-between w-full xl:w-auto">
          <h2 className="text-2xl font-bold text-slate-800">All Transactions</h2>
          <button 
            onClick={handleExportCSV}
            disabled={transactions.length === 0}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-4"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-slate-500 mr-2">
            <Filter size={18} />
            <span className="text-sm font-medium">Filter</span>
          </div>
          
          <input 
            type="month" 
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          />
          
          <select 
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setFilterCategory(''); // reset category on type change
            }}
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses</option>
            <option value="income">Incomes</option>
          </select>
          
          <select 
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories
              .filter(c => filterType === 'all' || c.type === filterType)
              .map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))
            }
          </select>
          
          {(filterMonth || filterType !== 'all' || filterCategory) && (
            <button 
              onClick={() => {
                setFilterMonth('');
                setFilterType('all');
                setFilterCategory('');
              }}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium px-2"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <Loader2 className="animate-spin mb-4 text-indigo-500" size={40} />
              <p className="font-medium">Loading transactions...</p>
            </div>
          ) : (
            <TransactionList transactions={transactions} onUpdate={loadData} />
          )}
        </div>
        
        <div className="space-y-6">
          <QuickAdd onAdd={loadData} />
        </div>
      </div>
    </div>
  );
};

export default Transactions;
