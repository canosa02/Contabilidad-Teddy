import React, { useState, useEffect } from 'react';
import { Loader2, Calendar, CreditCard, Power, Plus } from 'lucide-react';
import { fetchSubscriptions, toggleSubscriptionActive, toEuros } from '../api';
import QuickAdd from '../components/QuickAdd';

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchSubscriptions();
      setSubscriptions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (id, currentActive) => {
    try {
      await toggleSubscriptionActive(id, !currentActive);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to update subscription');
    }
  };

  const getMonthlyCost = (sub) => {
    let monthlyCents = sub.amount_cents;
    if (sub.recurrence === 'yearly') monthlyCents = Math.round(sub.amount_cents / 12);
    if (sub.recurrence === 'weekly') monthlyCents = Math.round(sub.amount_cents * 4.33);
    return monthlyCents;
  };

  const totalMonthlyCents = subscriptions
    .filter(s => s.active)
    .reduce((sum, s) => sum + getMonthlyCost(s), 0);
  const totalYearlyCents = totalMonthlyCents * 12;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <Loader2 className="animate-spin mb-4 text-indigo-500" size={40} />
        <p className="font-medium">Loading subscriptions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Subscriptions</h2>
          <p className="text-slate-500 text-sm mt-1">Manage your recurring expenses</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Add Subscription
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Calendar size={20} /></div>
            <span className="font-medium">Total Monthly Cost</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">€{toEuros(totalMonthlyCents)}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CreditCard size={20} /></div>
            <span className="font-medium">Total Annual Cost</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">€{toEuros(totalYearlyCents)}</p>
        </div>
      </div>

      {showAdd && (
        <div className="max-w-md mx-auto">
          <QuickAdd onAdd={() => { loadData(); setShowAdd(false); }} initialRecurrence="monthly" initialType="expense" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subscriptions.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-100">
            No subscriptions found. Click "Add Subscription" to add one.
          </div>
        ) : (
          subscriptions.map(sub => {
            const monthlyCents = getMonthlyCost(sub);
            const yearlyCents = monthlyCents * 12;

            return (
              <div 
                key={sub.id} 
                className={`bg-white p-6 rounded-2xl shadow-sm border transition-all ${sub.active ? 'border-slate-100' : 'border-slate-200 opacity-60 grayscale'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: `${sub.category_color}20` }}>
                      {sub.category_icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 line-clamp-1">{sub.description || 'Unknown'}</h3>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
                        {sub.recurrence}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleToggle(sub.id, sub.active)}
                    className={`p-2 rounded-full transition-colors ${sub.active ? 'text-indigo-600 hover:bg-indigo-50' : 'text-slate-400 hover:bg-slate-100'}`}
                    title={sub.active ? "Mark as inactive" : "Mark as active"}
                  >
                    <Power size={18} />
                  </button>
                </div>
                
                <div className="space-y-3 mt-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Monthly Cost</span>
                    <span className="font-semibold text-slate-800">€{toEuros(monthlyCents)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-3 border-t border-slate-100">
                    <span className="text-slate-500">Annual Cost</span>
                    <span className="font-medium text-slate-600">€{toEuros(yearlyCents)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Subscriptions;
