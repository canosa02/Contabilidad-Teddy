import React, { useState, useEffect } from 'react';
import { Loader2, Plus, CreditCard, Banknote, CalendarDays, CheckCircle2 } from 'lucide-react';
import { fetchDebts, createDebt, registerDebtPayment, toEuros, toCents } from '../api';

const Debts = () => {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState('personal');
  const [totalAmount, setTotalAmount] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [interestRate, setInterestRate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchDebts();
      setDebts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!name || !totalAmount || !monthlyPayment || !startDate) return;
    
    setSubmitting(true);
    try {
      await createDebt({
        name,
        category,
        total_amount_cents: toCents(totalAmount),
        monthly_payment_cents: toCents(monthlyPayment),
        start_date: startDate,
        interest_rate: parseFloat(interestRate) || 0,
        notes
      });
      setShowAdd(false);
      setName('');
      setTotalAmount('');
      setMonthlyPayment('');
      setInterestRate('');
      setNotes('');
      loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to add debt');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = async (id) => {
    if (!window.confirm('Register a monthly payment for this debt? This will create an expense transaction.')) return;
    
    try {
      await registerDebtPayment(id);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to register payment');
    }
  };

  const activeDebts = debts.filter(d => d.active === 1);
  const totalMonthlyLoad = activeDebts.reduce((sum, d) => sum + d.monthly_payment_cents, 0);
  const totalRemaining = activeDebts.reduce((sum, d) => sum + d.remaining_amount_cents, 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <Loader2 className="animate-spin mb-4 text-indigo-500" size={40} />
        <p className="font-medium">Loading debts...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Debts & Loans</h2>
          <p className="text-slate-500 text-sm mt-1">Track your progress to financial freedom</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Add Debt
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><CalendarDays size={20} /></div>
            <span className="font-medium">Total Monthly Payments</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">€{toEuros(totalMonthlyLoad)}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Banknote size={20} /></div>
            <span className="font-medium">Total Remaining Debt</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">€{toEuros(totalRemaining)}</p>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-2xl mx-auto">
          <h3 className="font-semibold text-lg mb-4 text-slate-800">Add New Debt</h3>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Name</label>
                <input required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Car Loan" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white" value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="mortgage">Mortgage</option>
                  <option value="personal">Personal Loan</option>
                  <option value="card">Credit Card</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Total Amount (€)</label>
                <input required type="number" step="0.01" min="0.01" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} placeholder="0.00" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Monthly Payment (€)</label>
                <input required type="number" step="0.01" min="0.01" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" value={monthlyPayment} onChange={e => setMonthlyPayment(e.target.value)} placeholder="0.00" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Start Date</label>
                <input required type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Interest Rate (%)</label>
                <input type="number" step="0.01" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" value={interestRate} onChange={e => setInterestRate(e.target.value)} placeholder="0.0" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1">Notes</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
              <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                {submitting ? 'Adding...' : 'Add Debt'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {debts.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-100">
            No debts found. Click "Add Debt" to get started.
          </div>
        ) : (
          debts.map(debt => {
            const percentPaid = Math.min(100, Math.max(0, ((debt.total_amount_cents - debt.remaining_amount_cents) / debt.total_amount_cents) * 100));
            const isPaidOff = debt.remaining_amount_cents <= 0 || debt.active === 0;

            return (
              <div key={debt.id} className={`bg-white p-6 rounded-2xl shadow-sm border transition-all ${isPaidOff ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${isPaidOff ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {isPaidOff ? <CheckCircle2 size={24} /> : <CreditCard size={24} />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 line-clamp-1">{debt.name}</h3>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
                        {debt.category}
                      </span>
                    </div>
                  </div>
                  {debt.interest_rate > 0 && (
                    <div className="text-right">
                      <span className="text-xs font-medium text-slate-500 uppercase">Interest</span>
                      <p className="font-semibold text-slate-700">{debt.interest_rate}%</p>
                    </div>
                  )}
                </div>

                <div className="mb-5">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-slate-700">{percentPaid.toFixed(1)}% Paid</span>
                    <span className="text-slate-500">
                      €{toEuros(debt.remaining_amount_cents)} / €{toEuros(debt.total_amount_cents)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-500 ${isPaidOff ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                      style={{ width: `${percentPaid}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Monthly Payment</p>
                    <p className="font-semibold text-slate-800">€{toEuros(debt.monthly_payment_cents)}</p>
                  </div>
                  
                  {!isPaidOff && (
                    <button 
                      onClick={() => handlePayment(debt.id)}
                      className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-medium text-sm transition-colors"
                    >
                      Registrar pago
                    </button>
                  )}
                  {isPaidOff && (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                      Paid Off
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Debts;
