export const toCents = (euros) => Math.round(parseFloat(euros) * 100);
export const toEuros = (cents) => (cents / 100).toFixed(2);

export const fetchSummary = async (month) => {
  const res = await fetch(`/api/summary?month=${month}`);
  if (!res.ok) throw new Error('Failed to fetch summary');
  return res.json();
};

export const fetchTransactions = async ({ month, type, category_id } = {}) => {
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  if (type) params.append('type', type);
  if (category_id) params.append('category_id', category_id);

  const res = await fetch(`/api/transactions?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
};

export const fetchCategories = async () => {
  const res = await fetch('/api/categories');
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
};

export const createTransaction = async (data) => {
  const res = await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create transaction');
  return res.json();
};

export const updateTransaction = async (id, data) => {
  const res = await fetch(`/api/transactions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update transaction');
  return res.json();
};

export const deleteTransaction = async (id) => {
  const res = await fetch(`/api/transactions/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete transaction');
  return res.json();
};

export const fetchSubscriptions = async () => {
  const res = await fetch('/api/subscriptions');
  if (!res.ok) throw new Error('Failed to fetch subscriptions');
  return res.json();
};

export const toggleSubscriptionActive = async (id, active) => {
  const res = await fetch(`/api/subscriptions/${id}/toggle`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ active }),
  });
  if (!res.ok) throw new Error('Failed to update subscription');
  return res.json();
};

export const fetchDebts = async () => {
  const res = await fetch('/api/debts');
  if (!res.ok) throw new Error('Failed to fetch debts');
  return res.json();
};

export const createDebt = async (data) => {
  const res = await fetch('/api/debts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create debt');
  return res.json();
};

export const registerDebtPayment = async (id) => {
  const res = await fetch(`/api/debts/${id}/payment`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to register payment');
  return res.json();
};
