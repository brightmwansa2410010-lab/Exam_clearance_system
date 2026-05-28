# Exam Clearance System — UI Documentation

## Overview

The UI is a single-page application (no React Router) with role-based conditional rendering. The root `App` component manages all state and renders the appropriate dashboard based on the logged-in user's role.

---

## Pages

### Login Page (`Login.jsx`)

The entry point for all users. Features a toggle between **Sign in** and **Register** modes.

**Sign in mode:**
- Email input
- Password input
- Sign in button

**Register mode** (additional fields):
- Name input
- Role dropdown (Student, Accounts Officer, Examiner)
- Register button

On successful registration, the user is automatically logged in.

---

## Student Dashboard (`StudentDashboard.jsx`)

### 1. Stats Cards
Shows the status of the student's most recent clearance request:
- **Status** — overall status (pending/approved/rejected)
- **Accounts** — accounts approval status
- **Examiner** — examiner approval status

### 2. Profile Form
Fields:
- **Student ID** — text input (e.g. ZUCT-2024-001)
- **Study Mode** — dropdown (Full-time, Part-time, Distance Learning, Evening, Weekend)
- **Gender** — dropdown (Male, Female, Other)
- **NRC Number** — text input (e.g. 314368/71/1)
- **Save profile** button

### 3. New Clearance Request Form
Fields:
- **Programme** — text input (e.g. BSc in Computer Science)
- **Semester** — dropdown (Semester 1 — 2025/2026, Semester 2 — 2025/2026)
- **Submit request** button

### 4. Requests Table
Lists all submitted requests with columns:
- Programme
- Semester
- Accounts — status badge (pending/approved/rejected)
- Examiner — status badge
- Status — overall badge
- Slip — **Download** button (only when status is `approved`)

---

## Accounts Dashboard (`AccountsDashboard.jsx`)

### Header
- Title: "Accounts officer"
- **Pending count badge** — number of requests awaiting accounts approval

### Requests Table
Columns:
- **Student ID**
- **Name**
- **Programme**
- **Status** — `pending`, `approved`, or `rejected` badge
- **Action** — Approve / Reject buttons (shown only for pending requests; shows "Done" once processed)

---

## Examiner Dashboard (`ExaminerDashboard.jsx`)

### Header
- Title: "Examiner"
- **Export exam list** button — generates a PDF of all accounts-approved students

### Stats Grid
- **Awaiting** — number of requests pending examiner review
- **Approved** — number approved by examiner
- **Rejected** — number rejected by examiner

### Requests Table
Only shows requests where **Accounts** has already approved.
Columns:
- **Student ID**
- **Name**
- **Accounts** — shows `approved` badge
- **Status** — examiner status badge
- **Action** — Approve / Reject buttons (for pending; shows "Done" once processed)

### PDF Export
Generates a PDF with columns: Student ID, Name, Programme, Semester, Accounts status, Examiner status. Auto-paginates when content exceeds one page.

---

## Common UI Elements

### Header (shown on all authenticated pages)
- System title: "Exam Clearance System"
- Subtitle: "Signed in as {name} [role badge]"
- **Sign out** button

### Loading & Error States
- Loading indicator shown when fetching requests
- Error messages displayed in styled alert boxes

### Status Badges
- `pending` — gold/yellow
- `approved` — green
- `rejected` — red

### Design
- Dark theme (`#121212` background, `#eef2ff` text)
- Cards with semi-transparent dark backgrounds
- Responsive layout (single column on screens < 760px)
- Gradient background effect

---

## Navigation Flow

```
Login ──> Student Dashboard
        ├── Profile form
        ├── Submit request
        └── View requests / Download slip

Login ──> Accounts Dashboard
        └── View all requests / Approve-Reject

Login ──> Examiner Dashboard
        ├── View accounts-approved requests / Approve-Reject
        └── Export exam list PDF
```

All dashboards include a **Sign out** button in the header. No browser URL routing — the UI is entirely state-driven.
