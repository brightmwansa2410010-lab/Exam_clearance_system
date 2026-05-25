-- PostgreSQL schema for Exam Clearance System

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'accounts', 'examiner')),
  student_id TEXT UNIQUE,
  passport_photo_url TEXT,
  nrc_front_url TEXT,
  nrc_back_url TEXT,
  profile_complete BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS requests (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  programme TEXT NOT NULL,
  semester TEXT NOT NULL,
  accounts_status TEXT NOT NULL DEFAULT 'pending',
  examiner_status TEXT NOT NULL DEFAULT 'pending',
  status TEXT NOT NULL DEFAULT 'pending'
);
