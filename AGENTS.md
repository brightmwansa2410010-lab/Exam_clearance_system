# Exam Clearance System — Agent Guide

## Quick start

```bash
# Backend (CJS)
cd backend && cp .env.example .env && npm install
node setup-db.js       # creates DB "exam_clearance" + runs schema + ALTER TABLE migrations
node seed.js           # optional demo data (password123 for all)
npm start              # port 4000

# Frontend (ESM, Vite)
cd frontend && npm install && npm run dev   # port 5173
```

No lint, test, or typecheck commands exist.

## Architecture

```
frontend/ (React 18 + Vite) → HTTP/JSON → backend/ (Express + pg) → PostgreSQL
```

- **No React Router** — role-based conditional rendering in `App.jsx` (`backend/routes/requests.js` guards on role too)
- **Auth**: JWT (8h expiry) stored in localStorage key `exam_clearance_user`
- **Module systems**: backend = CommonJS (`require`), frontend = ESM (`import`)
- **Deployment**: Cloudflare Workers via `wrangler.jsonc` — serves `frontend/` as static assets

## Database gotchas

- Schema is split across **two files** that both run during `node setup-db.js`:
  1. `backend/migrations/schema.sql` — CREATE TABLE statements
  2. `backend/setup-db.js` lines 19-34 — ALTER TABLE ADD COLUMN IF NOT EXISTS (for columns added after initial deploy)
- If you add a column, add it to **both** `schema.sql` AND the ALTER TABLE block in `setup-db.js`
- Unique indexes on `users(student_id)` and `users(nrc_number)` are also in setup-db.js, not schema.sql

## API

| Route | Method | Auth | Notes |
|---|---|---|---|
| `/api/auth/register` | POST | No | Rate-limited: 20 req/15min |
| `/api/auth/login` | POST | No | Returns JWT + user object |
| `/api/auth/profile` | PATCH | Student | Updates `student_id`, `nrc_number`, `study_mode`, `gender` |
| `/api/requests` | GET | All | Role-filtered: student=own, accounts=all, examiner=accounts-approved only |
| `/api/requests` | POST | Student | One request per student (enforced server-side) |
| `/api/requests/approve` | PATCH | Accounts/Examiner | Body: `{ requestId, action: "approve"|"reject" }` |
| `/api/requests/:id/slip` | GET | All | PDF — only when `status === "approved"` |

Status computation (`backend/routes/requests.js:82-86`):
- `accounts_status === 'rejected' || examiner_status === 'rejected'` → `rejected`
- Both `approved` → `approved`
- Otherwise → `pending`

## PDF generation quirks

- **Exam slip** (`backend/routes/requests.js`) uses **PDFKit** — gradients are simulated with 1px horizontal rect strips since PDFKit has no gradient API
- **Exam list** (`frontend/src/pages/ExaminerDashboard.jsx`) uses **jsPDF** (client-side)
- The exam slip query **must** SELECT user columns (`u.nrc_number`, `u.study_mode`, `u.gender`, `u.name`, `u.student_id`) — they're on the `users` table, not `requests`

## Frontend conventions

- API calls go through `frontend/src/services/api.js` which wraps `fetch` with JWT Bearer header, JSON content-type, and 401/403 → `{ expired: true }`
- `VITE_API_URL` defaults to `http://localhost:4000/api`
- All requests data is fetched once in `App.jsx` via `loadRequests()` and passed as props — no per-component fetching
- Profile save responds `{ message }` not the updated user — frontend patches the user object client-side
