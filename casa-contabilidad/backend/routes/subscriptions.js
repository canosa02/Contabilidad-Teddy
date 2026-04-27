const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/subscriptions
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.recurrence != 'none'
      GROUP BY t.description
      ORDER BY t.amount_cents DESC
    `);

    const subscriptions = stmt.all();
    res.json(subscriptions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// PUT /api/subscriptions/:id/toggle
router.put('/:id/toggle', (req, res) => {
  try {
    const { active } = req.body;
    
    const getStmt = db.prepare('SELECT description FROM transactions WHERE id = ?');
    const trans = getStmt.get(req.params.id);
    
    if (!trans) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const stmt = db.prepare(`
      UPDATE transactions 
      SET active = ? 
      WHERE description = ? AND recurrence != 'none'
    `);
    
    stmt.run(active ? 1 : 0, trans.description);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

module.exports = router;
