const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.get('/', (req, res) => {
  const { month, type, category_id } = req.query;
  
  let query = `
    SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (month) {
    query += ` AND strftime('%Y-%m', t.date) = ?`;
    params.push(month);
  }
  if (type) {
    query += ` AND t.type = ?`;
    params.push(type);
  }
  if (category_id) {
    query += ` AND t.category_id = ?`;
    params.push(category_id);
  }

  query += ` ORDER BY t.date DESC, t.id DESC`;

  try {
    const transactions = db.prepare(query).all(...params);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  const { type, amount_cents, date, description, category_id, recurrence, notes } = req.body;
  
  try {
    const stmt = db.prepare(`
      INSERT INTO transactions (type, amount_cents, date, description, category_id, recurrence, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const info = stmt.run(
      type, 
      amount_cents, 
      date, 
      description, 
      category_id, 
      recurrence || 'none', 
      notes
    );
    
    res.json({ id: info.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { type, amount_cents, date, description, category_id, recurrence, notes } = req.body;
  
  try {
    const stmt = db.prepare(`
      UPDATE transactions 
      SET type = ?, amount_cents = ?, date = ?, description = ?, category_id = ?, recurrence = ?, notes = ?
      WHERE id = ?
    `);
    
    stmt.run(
      type, 
      amount_cents, 
      date, 
      description, 
      category_id, 
      recurrence || 'none', 
      notes,
      id
    );
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  try {
    const stmt = db.prepare('DELETE FROM transactions WHERE id = ?');
    stmt.run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
