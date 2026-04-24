import React, { useState } from 'react';
import { Pencil, Trash2, ReceiptText, AlertTriangle, X } from 'lucide-react';
import { toEuros, deleteTransaction } from '../api';

const TransactionList = ({ transactions, onUpdate }) => {
  const [deleteId, setDeleteId] = useState(null);

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <ReceiptText className="text-slate-300" size={32} />
        </div>
        <h3 className="text-lg font-medium text-slate-800 mb-1">No transactions found</h3>
        <p className="text-slate-500 max-w-sm">There are no transactions for this period. Try adjusting your filters or add a new transaction to get started.</p>
      </div>
    );
  }

  // Group by date
  const grouped = transactions.reduce((acc, t) => {
    if (!acc[t.date]) acc[t.date] = [];
    acc[t.date].push(t);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTransaction(deleteId);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error(err);
      alert('Failed to delete transaction');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      {sortedDates.map(date => {
        const dateObj = new Date(date);
        const dateStr = dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        
        return (
          <div key={date}>
            <h4 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">{dateStr}</h4>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              {grouped[date].map((t, index) => (
                <div 
                  key={t.id} 
                  className={`group flex items-center p-4 hover:bg-slate-50 transition-colors ${index !== grouped[date].length - 1 ? 'border-b border-slate-100' : ''}`}
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 mr-4"
                    style={{ backgroundColor: `${t.category_color}20` }}
                  >
                    {t.category_icon}
                  </div>
                  
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="font-medium text-slate-800 truncate">{t.description}</p>
                    <p className="text-xs font-medium mt-0.5" style={{ color: t.category_color }}>{t.category_name}</p>
                  </div>
                  
                  <div className="text-right mr-4">
                    <p className={`font-semibold ${t.type === 'expense' ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {t.type === 'expense' ? '-' : '+'}€{toEuros(t.amount_cents)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDelete(t.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {deleteId && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="p-2 bg-rose-50 rounded-full">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Delete Transaction</h3>
              </div>
              <button onClick={() => setDeleteId(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <p className="text-slate-600 mb-6 pl-2">Are you sure you want to delete this transaction? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
