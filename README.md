# Exam Clearance System

A full-stack web application for managing university exam clearance. Students submit clearance requests, Accounts Officers approve/reject finances, and Examiners give final approval.

## Architecture

```
frontend/  (React + Vite)  ──HTTP──>  backend/  (Express + pg)  ──SQL──>  PostgreSQL
```

- **Frontend**: React 18, Vite, vanilla CSS (dark theme)
- **Backend**: Express.js, PostgreSQL (via `pg`), JWT auth, PDFKit
- **Auth**: JWT tokens (8h expiry), stored in localStorage

## Roles

| Role | Capabilities |
|---|---|
| **Student** | Register, complete profile (student ID, NRC, study mode, gender), submit clearance requests, download exam slip PDF |
| **Accounts Officer** | View all requests, approve/reject at the accounts level |
| **Examiner** | View accounts-approved requests, approve/reject at final level, export exam list PDF |

## Workflow

```
Student submits request  ──>  Accounts Officer approves  ──>  Examiner approves  ──>  Slip available
```

If either Accounts or Examiner rejects, the request is rejected.

## Database Schema

### `users`

| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| name | TEXT NOT NULL | |
| email | TEXT UNIQUE NOT NULL | |
| password | TEXT NOT NULL | bcrypt hashed |
| role | TEXT NOT NULL | `student`, `accounts`, `examiner` |
| student_id | TEXT UNIQUE | student number |
| nrc_number | TEXT UNIQUE | NRC number |
| profile_complete | BOOLEAN | defaults to false |
| study_mode | TEXT | Full-time, Part-time, etc. |
| gender | TEXT | |

### `requests`

| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| student_id | INTEGER FK | references users(id) |
| programme | TEXT NOT NULL | |
| semester | TEXT NOT NULL | |
| accounts_status | TEXT | `pending`, `approved`, `rejected` |
| examiner_status | TEXT | `pending`, `approved`, `rejected` |
| status | TEXT | computed: `pending`, `approved`, `rejected` |

## API Endpoints

### Auth (`/api/auth`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /register | No | Register new user |
| POST | /login | No | Login, returns JWT |
| PATCH | /profile | Student | Save student profile (ID, NRC, study mode, gender) |

### Requests (`/api/requests`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | / | All roles | List requests (filtered by role) |
| POST | / | Student | Submit clearance request |
| PATCH | /approve | Accounts/Examiner | Approve or reject |
| GET | /:id/slip | All roles | Download exam slip PDF |

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL running on localhost:5432

### Backend

```bash
cd backend
cp .env.example .env        # edit DATABASE_URL and JWT_SECRET
npm install
node setup-db.js            # create database and tables
node seed.js                # (optional) populate demo data
npm start                   # starts on port 4000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                 # starts on port 5173
```

## Demo Credentials

After running `node seed.js`:

| Role | Email | Password |
|---|---|---|
| Accounts Officer | accounts@example.com | password123 |
| Examiner | examiner@example.com | password123 |
| Student | chilufya@example.com | password123 |
| Student | mary@example.com | password123 |
| Student | john@example.com | password123 |
| Student | grace@example.com | password123 |

## Tech Stack

- **Backend**: Express, pg, bcryptjs, jsonwebtoken, pdfkit, cors, dotenv
- **Frontend**: React 18, Vite, jspdf
- **Database**: PostgreSQL
