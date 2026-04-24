import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, Repeat, CreditCard } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Subscriptions from './pages/Subscriptions';
import Debts from './pages/Debts';

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 px-4 py-6 flex flex-col">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            C
          </div>
          <h1 className="font-bold text-xl text-slate-800 tracking-tight">Casa Contabilidad</h1>
        </div>
        
        <nav className="flex flex-col gap-2">
          <Link 
            to="/" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location.pathname === '/' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link 
            to="/transactions" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location.pathname === '/transactions' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <ReceiptText size={20} />
            Transactions
          </Link>
          <Link 
            to="/subscriptions" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location.pathname === '/subscriptions' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Repeat size={20} />
            Subscriptions
          </Link>
          <Link 
            to="/debts" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location.pathname === '/debts' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <CreditCard size={20} />
            Debts
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-50">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/debts" element={<Debts />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
