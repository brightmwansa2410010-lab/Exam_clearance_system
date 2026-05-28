-- PostgreSQL schema for Exam Clearance System

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'accounts', 'examiner')),
  student_id TEXT UNIQUE,
  nrc_number TEXT UNIQUE,
  profile_complete BOOLEAN DEFAULT FALSE,
  study_mode TEXT,
  gender TEXT
);

CREATE TABLE IF NOT EXISTS requests (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  programme TEXT NOT NULL,
  semester TEXT NOT NULL,
  intake TEXT,
  year_of_study TEXT,
  accounts_status TEXT NOT NULL DEFAULT 'pending',
  examiner_status TEXT NOT NULL DEFAULT 'pending',
  status TEXT NOT NULL DEFAULT 'pending'
);
