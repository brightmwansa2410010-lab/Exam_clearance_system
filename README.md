# Exam Clearance System

A simple full-stack web app for exam clearance using React, Express, and PostgreSQL.

## Structure

- `backend/` - Express API server
- `frontend/` - React app built with Vite
- `backend/migrations/schema.sql` - PostgreSQL schema

## Backend setup

1. Copy `.env.example` to `.env` in `backend/`.
2. Update `DATABASE_URL` and `JWT_SECRET`.
3. Create the PostgreSQL database and tables:
   - `psql -d your_database -f backend/migrations/schema.sql`
4. Install dependencies:
   - `cd backend && npm install`
5. Start backend:
   - `npm start`

## Frontend setup

1. Install dependencies:
   - `cd frontend && npm install`
2. Start frontend:
   - `npm run dev`
3. Open the browser at the URL shown by Vite.

## Usage

- Register as a student, accounts officer, or examiner.
- Students submit exam clearance requests.
- Accounts officer approves or rejects student requests.
- Examiner reviews requests after accounts approval and gives final approval.

## Notes

- The backend uses JWT for simple auth.
- The frontend stores login state in localStorage.
- The system is designed to be easy to explain and extend.
