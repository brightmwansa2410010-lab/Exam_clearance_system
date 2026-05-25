const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');
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
  try {
    const { name, email, password, role, student_id } = req.body;

    if (student_id) {
      const existing = await db.query('SELECT id FROM users WHERE student_id = $1', [student_id]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Student ID already registered' });
      }
    }
    if (email) {
      const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Email already registered' });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO users (name, email, password, role, student_id) VALUES ($1, $2, $3, $4, $5)',
      [name, email, passwordHash, role, student_id || null]
    );

    res.status(201).json({ message: 'Registration successful' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', validateLoginInput, async (req, res) => {
  try {
    const { email, password, student_id } = req.body;

    let result;
    if (student_id) {
      result = await db.query(
        'SELECT id, name, email, password, role, student_id FROM users WHERE student_id = $1',
        [student_id]
      );
    } else {
      result = await db.query(
        'SELECT id, name, email, password, role, student_id FROM users WHERE email = $1',
        [email]
      );
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
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/profile', authenticate, upload.fields([
  { name: 'passport_photo', maxCount: 1 },
  { name: 'nrc_front', maxCount: 1 },
  { name: 'nrc_back', maxCount: 1 },
]), async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can update profiles.' });
    }

    const student_id_number = req.body.student_id_number;
    if (!student_id_number || typeof student_id_number !== 'string' || student_id_number.trim().length < 1) {
      return res.status(400).json({ error: 'Student ID Number is required.' });
    }

    if (!req.files || !req.files.passport_photo || !req.files.nrc_front || !req.files.nrc_back) {
      return res.status(400).json({ error: 'All three files (passport photo, NRC front, NRC back) are required.' });
    }

    const passportUrl = '/uploads/' + req.files.passport_photo[0].filename;
    const nrcFrontUrl = '/uploads/' + req.files.nrc_front[0].filename;
    const nrcBackUrl = '/uploads/' + req.files.nrc_back[0].filename;

    await db.query(
      `UPDATE users
       SET student_id = $1,
           passport_photo_url = $2,
           nrc_front_url = $3,
           nrc_back_url = $4,
           profile_complete = true
       WHERE id = $5`,
      [student_id_number.trim(), passportUrl, nrcFrontUrl, nrcBackUrl, req.user.id]
    );

    res.json({ message: 'Profile updated successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
