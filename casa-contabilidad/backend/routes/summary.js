const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.get('/', (req, res) => {
  const { month } = req.query; // YYYY-MM

  if (!month) {
    return res.status(400).json({ error: 'month parameter (YYYY-MM) is required' });
  }

  try {
    // Totals for the month
    const totalsRow = db.prepare(`
      SELECT 
        SUM(CASE WHEN type = 'expense' THEN amount_cents ELSE 0 END) as total_expense,
        SUM(CASE WHEN type = 'income' THEN amount_cents ELSE 0 END) as total_income
      FROM transactions
      WHERE strftime('%Y-%m', date) = ?
    `).get(month);

    const totals = {
      total_expense: totalsRow.total_expense || 0,
      total_income: totalsRow.total_income || 0
    };

    // By Category (Expenses only) for the month
    const byCategory = db.prepare(`
      SELECT c.name, c.color, c.icon, c.budget_cents, SUM(t.amount_cents) as total
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE strftime('%Y-%m', t.date) = ? AND t.type = 'expense'
      GROUP BY c.id
      ORDER BY total DESC
    `).all(month);

    // Monthly totals for the last 6 months (including the requested month)
    const monthlyQuery = db.prepare(`
      SELECT 
        strftime('%Y-%m', date) as month,
        SUM(CASE WHEN type = 'expense' THEN amount_cents ELSE 0 END) as expenses,
        SUM(CASE WHEN type = 'income' THEN amount_cents ELSE 0 END) as incomes
      FROM transactions
      WHERE date >= date(?, '-5 months', 'start of month') AND date <= date(?, 'start of month', '+1 month', '-1 day')
      GROUP BY month
      ORDER BY month ASC
    `).all(month + '-01', month + '-01');

    const monthlyMap = {};
    for (let i = 5; i >= 0; i--) {
      // Use UTC to avoid timezone issues when parsing and formatting
      const [y, m] = month.split('-');
      const d = new Date(Date.UTC(parseInt(y), parseInt(m) - 1, 1));
      d.setUTCMonth(d.getUTCMonth() - i);
      const mStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      monthlyMap[mStr] = { month: mStr, expenses: 0, incomes: 0 };
    }

    monthlyQuery.forEach(row => {
      if (monthlyMap[row.month]) {
        monthlyMap[row.month] = {
          month: row.month,
          expenses: row.expenses,
          incomes: row.incomes
        };
      }
    });

    res.json({
      totals,
      byCategory,
      monthly: Object.values(monthlyMap)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
