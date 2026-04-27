const express = require('express');
const cors = require('cors');

const db = require('./db/database');
const categoriesRouter = require('./routes/categories');
const transactionsRouter = require('./routes/transactions');
const summaryRouter = require('./routes/summary');
const subscriptionsRouter = require('./routes/subscriptions');
const debtsRouter = require('./routes/debts');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/categories', categoriesRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/summary', summaryRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/debts', debtsRouter);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
