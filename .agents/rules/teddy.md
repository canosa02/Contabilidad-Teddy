---
trigger: always_on
---

PROJECT CONTEXT — Casa Contabilidad

- All monetary values in the database are stored as INTEGER CENTS (e.g. 1250 = €12.50). Never use floats for money.
- The database file is backend/db/casa.db and is auto-created. Never delete it during development — it contains real data.
- Default categories are seeded with INSERT OR IGNORE, so re-running the server never duplicates them.
- The frontend talks to the backend exclusively through /api/* routes proxied by Vite. Never hardcode http://localhost:3001 in frontend components — use relative paths like /api/transactions.
- Chart colors come from the category.color field in the database. Do not hardcode chart colors.
- The app is for a single user — no authentication, no sessions, no user table.
- Stack: Node.js + Express + better-sqlite3 | React + Vite + Recharts + Tailwind CSS