const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/debts
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM debts ORDER BY active DESC, created_at DESC');
    res.json(stmt.all());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch debts' });
  }
});

// POST /api/debts
router.post('/', (req, res) => {
  try {
    const { name, category, total_amount_cents, monthly_payment_cents, start_date, end_date, interest_rate, notes } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO debts (
        name, category, total_amount_cents, remaining_amount_cents, 
        monthly_payment_cents, start_date, end_date, interest_rate, notes, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);
    
    const info = stmt.run(
      name, 
      category || 'personal', 
      total_amount_cents, 
      total_amount_cents, // remaining initially equals total
      monthly_payment_cents, 
      start_date, 
      end_date || null, 
      interest_rate || 0, 
      notes || null
    );
    
    res.status(201).json({ id: info.lastInsertRowid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create debt' });
  }
});

// PUT /api/debts/:id
router.put('/:id', (req, res) => {
  try {
    const { name, category, total_amount_cents, remaining_amount_cents, monthly_payment_cents, start_date, end_date, interest_rate, notes, active } = req.body;
    
    const stmt = db.prepare(`
      UPDATE debts SET 
        name = COALESCE(?, name),
        category = COALESCE(?, category),
        total_amount_cents = COALESCE(?, total_amount_cents),
        remaining_amount_cents = COALESCE(?, remaining_amount_cents),
        monthly_payment_cents = COALESCE(?, monthly_payment_cents),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date),
        interest_rate = COALESCE(?, interest_rate),
        notes = COALESCE(?, notes),
        active = COALESCE(?, active)
      WHERE id = ?
    `);
    
    stmt.run(name, category, total_amount_cents, remaining_amount_cents, monthly_payment_cents, start_date, end_date, interest_rate, notes, active, req.params.id);
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update debt' });
  }
});

// DELETE /api/debts/:id
router.delete('/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM debts WHERE id = ?');
    stmt.run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete debt' });
  }
});

// POST /api/debts/:id/payment
router.post('/:id/payment', (req, res) => {
  const transaction = db.transaction(() => {
    // 1. Get debt details
    const debt = db.prepare('SELECT * FROM debts WHERE id = ?').get(req.params.id);
    if (!debt) throw new Error('Debt not found');
    
    // 2. Find "Deudas" category
    let cat = db.prepare('SELECT id FROM categories WHERE name = ?').get('Deudas');
    if (!cat) {
       const info = db.prepare("INSERT INTO categories (name, type, color, icon) VALUES ('Deudas', 'expense', '#ef4444', '💳')").run();
       cat = { id: info.lastInsertRowid };
    }

    const today = new Date().toISOString().split('T')[0];

    // 3. Create transaction
    const insertTrans = db.prepare(`
      INSERT INTO transactions (type, amount_cents, date, description, category_id, recurrence, active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);
    insertTrans.run('expense', debt.monthly_payment_cents, today, `Pago: ${debt.name}`, cat.id, 'monthly');

    // 4. Decrease remaining amount
    const newRemaining = Math.max(0, debt.remaining_amount_cents - debt.monthly_payment_cents);
    const newActive = newRemaining > 0 ? 1 : 0;

    const updateDebt = db.prepare('UPDATE debts SET remaining_amount_cents = ?, active = ? WHERE id = ?');
    updateDebt.run(newRemaining, newActive, debt.id);
    
    return { remaining: newRemaining, active: newActive };
  });

  try {
    const result = transaction();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to register payment' });
  }
});

module.exports = router;
