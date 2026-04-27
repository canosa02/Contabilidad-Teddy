import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Wallet, ArrowDownRight, ArrowUpRight, Loader2 } from 'lucide-react';
import { fetchSummary, fetchTransactions, toEuros } from '../api';
import QuickAdd from '../components/QuickAdd';
import { ExpenseDonutChart, MonthlyLineChart } from '../components/Charts';
import TransactionList from '../components/TransactionList';

// Helper to get YYYY-MM
const formatMonth = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

const Dashboard = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [summary, setSummary] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const monthStr = formatMonth(currentDate);
    try {
      const sumData = await fetchSummary(monthStr);
      setSummary(sumData);
      
      const transData = await fetchTransactions({ month: monthStr });
      setRecentTransactions(transData.slice(0, 5)); // Last 5 transactions
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentDate]);

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const monthName = currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  
  if (loading && !summary) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
      <Loader2 className="animate-spin mb-4 text-indigo-500" size={40} />
      <p className="font-medium">Loading dashboard...</p>
    </div>
  );

  const totals = summary?.totals || { total_expense: 0, total_income: 0 };
  const balance = totals.total_income - totals.total_expense;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800">Overview</h2>
        <div className="flex items-center gap-4">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
            <ChevronLeft size={20} />
          </button>
          <span className="font-semibold text-slate-800 w-32 text-center capitalize">{monthName}</span>
          <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><ArrowUpRight size={20} /></div>
            <span className="font-medium">Total Income</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">€{toEuros(totals.total_income)}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><ArrowDownRight size={20} /></div>
            <span className="font-medium">Total Expenses</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">€{toEuros(totals.total_expense)}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <div className={`p-2 rounded-lg ${balance >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
              <Wallet size={20} />
            </div>
            <span className="font-medium">Balance</span>
          </div>
          <p className={`text-3xl font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {balance >= 0 ? '+' : ''}{balance < 0 ? '-' : ''}€{toEuros(Math.abs(balance))}
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Charts) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-semibold text-lg mb-6 text-slate-800">6-Month History</h3>
            <MonthlyLineChart data={summary?.monthly} />
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg text-slate-800">Recent Transactions</h3>
            </div>
            <TransactionList transactions={recentTransactions} onUpdate={loadData} />
          </div>
        </div>

        {/* Right Column (Quick Add & Donut) */}
        <div className="space-y-6">
          <QuickAdd onAdd={loadData} />
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-semibold text-lg mb-6 text-slate-800">Expenses by Category</h3>
            <ExpenseDonutChart data={summary?.byCategory} />
            
            {summary?.byCategory?.length > 0 && (
              <div className="mt-6 space-y-3">
                {summary.byCategory.map(c => (
                  <div key={c.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: c.color }}></div>
                      <span className="text-slate-600">{c.icon} {c.name}</span>
                    </div>
                    <span className="font-medium text-slate-800">€{toEuros(c.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
