const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const { validateRegisterInput, validateLoginInput } = require('../middleware/validate');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many attempts. Please try again later.' },
});

router.use(authLimiter);

router.post('/register', validateRegisterInput, async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { name, email, password, role, student_id } = req.body;

    await client.query('BEGIN');

    if (student_id) {
      const existing = await client.query('SELECT id FROM users WHERE student_id = $1', [student_id]);
      if (existing.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Student ID already registered' });
      }
    }
    if (email) {
      const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Email already registered' });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await client.query(
      'INSERT INTO users (name, email, password, role, student_id) VALUES ($1, $2, $3, $4, $5)',
      [name, email, passwordHash, role, student_id || null]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: 'Registration successful' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

router.post('/login', validateLoginInput, async (req, res) => {
  try {
    const { email, password } = req.body;

    let result;
    if (email) {
      result = await db.query(
        'SELECT id, name, email, password, role, student_id, nrc_number, study_mode, gender, profile_complete FROM users WHERE email = $1',
        [email]
      );
    } else {
      // This case shouldn't happen due to validation, but keep for safety
      return res.status(400).json({ error: 'Email is required.' });
    }

    const user = result.rows[0];
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        student_id: user.student_id,
        nrc_number: user.nrc_number,
        study_mode: user.study_mode,
        gender: user.gender,
        profile_complete: user.profile_complete,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/profile', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can update profiles.' });
    }

    const { student_id_number, nrc_number, study_mode, gender } = req.body;

    if (!student_id_number || typeof student_id_number !== 'string' || student_id_number.trim().length < 1) {
      return res.status(400).json({ error: 'Student ID Number is required.' });
    }
    if (!nrc_number || typeof nrc_number !== 'string' || nrc_number.trim().length < 1) {
      return res.status(400).json({ error: 'NRC Number is required.' });
    }

    await db.query(
      `UPDATE users
       SET student_id = $1,
           nrc_number = $2,
           study_mode = $3,
           gender = $4,
           profile_complete = true
       WHERE id = $5`,
      [student_id_number.trim(), nrc_number.trim(), study_mode || null, gender || null, req.user.id]
    );

    res.json({ message: 'Profile updated successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
