const express = require('express');
const db = require('../db');
const PDFDocument = require('pdfkit');
const { authenticate } = require('../middleware/auth');
const { validateRequestInput, validateApprovalInput } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { id, role } = req.user;
    let result;

      if (role === 'student') {
        result = await db.query(
          `SELECT r.*, u.name AS student_name, u.student_id AS student_number,
                  u.nrc_number, u.study_mode, u.gender
           FROM requests r
           JOIN users u ON r.student_id = u.id
           WHERE r.student_id = $1
           ORDER BY r.id DESC`,
          [id]
        );
      } else if (role === 'accounts') {
        result = await db.query(
          `SELECT r.*, u.name AS student_name, u.student_id AS student_number,
                  u.nrc_number, u.study_mode, u.gender
           FROM requests r
           JOIN users u ON r.student_id = u.id
           ORDER BY r.id DESC`
        );
      } else if (role === 'examiner') {
        result = await db.query(
          `SELECT r.*, u.name AS student_name, u.student_id AS student_number,
                  u.nrc_number, u.study_mode, u.gender
           FROM requests r
           JOIN users u ON r.student_id = u.id
           WHERE r.accounts_status = 'approved'
           ORDER BY r.id DESC`
        );
      }

    res.json({ requests: result.rows });
  } catch (error) {
    console.error('GET /requests error:', error);
    res.status(500).json({ error: 'Server error while fetching requests.' });
  }
});

router.post('/', validateRequestInput, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can submit requests.' });
    }

    const { programme, semester, intake, year_of_study } = req.body;

    const existing = await db.query(
      'SELECT id FROM requests WHERE student_id = $1',
      [req.user.id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'You already have a clearance request on file.' });
    }

    const result = await db.query(
      `INSERT INTO requests (student_id, programme, semester, intake, year_of_study)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, programme, semester, intake || null, year_of_study || null]
    );

    res.status(201).json({ message: 'Request submitted!', request: result.rows[0] });
  } catch (error) {
    console.error('POST /requests error:', error);
    res.status(500).json({ error: 'Server error while submitting request.' });
  }
});

function computeStatus(accounts_status, examiner_status) {
  if (accounts_status === 'rejected' || examiner_status === 'rejected') return 'rejected';
  if (accounts_status === 'approved' && examiner_status === 'approved') return 'approved';
  return 'pending';
}

router.patch('/approve', validateApprovalInput, async (req, res) => {
  try {
    const { role } = req.user;
    const { requestId, action } = req.body;

    const existing = await db.query('SELECT * FROM requests WHERE id = $1', [requestId]);

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    const request = existing.rows[0];
    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    if (role === 'accounts') {
      if (request.accounts_status !== 'pending') {
        return res.status(400).json({ error: 'This request has already been processed by accounts.' });
      }

      const overall = computeStatus(newStatus, request.examiner_status);

      const result = await db.query(
        'UPDATE requests SET accounts_status = $1, status = $2 WHERE id = $3 RETURNING *',
        [newStatus, overall, requestId]
      );

      res.json({ message: `Request ${newStatus} by accounts.`, request: result.rows[0] });

    } else if (role === 'examiner') {
      if (request.accounts_status !== 'approved') {
        return res.status(400).json({ error: 'Accounts must approve first.' });
      }
      if (request.examiner_status !== 'pending') {
        return res.status(400).json({ error: 'This request has already been processed by examiner.' });
      }

      const overall = computeStatus(request.accounts_status, newStatus);

      const result = await db.query(
        'UPDATE requests SET examiner_status = $1, status = $2 WHERE id = $3 RETURNING *',
        [newStatus, overall, requestId]
      );

      res.json({ message: `Request ${newStatus} by examiner.`, request: result.rows[0] });

    } else {
      return res.status(403).json({ error: 'Only accounts officers and examiners can approve requests.' });
    }
  } catch (error) {
    console.error('PATCH /requests/approve error:', error);
    res.status(500).json({ error: 'Server error during approval.' });
  }
});

router.get('/:id/slip', async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: 'Invalid request ID.' });
    }

    const result = await db.query(
      `SELECT r.*, u.name AS student_name, u.student_id AS student_number,
              u.nrc_number, u.study_mode, u.gender
       FROM requests r
       JOIN users u ON r.student_id = u.id
       WHERE r.id = $1`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Request not found.' });

    const request = result.rows[0];

    if (user.role === 'student' && user.id !== request.student_id) {
      return res.status(403).json({ error: 'Forbidden.' });
    }

    if (request.status !== 'approved') {
      return res.status(400).json({ error: 'Exam slip available only after approval.' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=exam-slip-${request.id}.pdf`);

    const doc = new PDFDocument({ size: 'A4', margin: 0 });
    doc.pipe(res);

    const pw = doc.page.width;
    const ph = doc.page.height;
    const system = {
      primary: '#c0c1ff',
      secondary: '#89ceff',
      tertiary: '#ffb783',
      error: '#ffb4ab',
      surface: '#1c1b1b',
      onSurface: '#e5e2e1',
      onSurfaceVariant: '#c7c4d7',
      bg: '#131313',
      white: '#ffffff',
      muted: '#908fa0',
    };

    doc.rect(0, 0, pw, ph).fill(system.bg);

    const gradTop = '#c0c1ff';
    const gradBot = '#89ceff';
    for (let y = 0; y < 90; y++) {
      const t = y / 90;
      const r = Math.round(parseInt(gradTop.slice(1, 3), 16) * (1 - t) + parseInt(gradBot.slice(1, 3), 16) * t);
      const g = Math.round(parseInt(gradTop.slice(3, 5), 16) * (1 - t) + parseInt(gradBot.slice(3, 5), 16) * t);
      const b = Math.round(parseInt(gradTop.slice(5, 7), 16) * (1 - t) + parseInt(gradBot.slice(5, 7), 16) * t);
      const hex = '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
      doc.rect(0, y, pw, 1).fill(hex);
    }

    doc.fillColor('#0d0096').font('Helvetica-Bold').fontSize(30).text('ZUCT', 50, 18);
    doc.fillColor('#07006c').font('Helvetica').fontSize(9).text('ZAMBIA UNIVERSITY COLLEGE OF TECHNOLOGY', 50, 56);

    doc.fillColor('#0d0096').font('Helvetica-Bold').fontSize(13).text('CLEARED', pw - 125, 32);

    doc.rect(0, 90, pw, 38).fill(system.surface);
    doc.fillColor(system.primary).font('Helvetica-Bold').fontSize(12).text('EXAM CLEARANCE SLIP', 50, 101);
    doc.fillColor(system.onSurfaceVariant).font('Helvetica').fontSize(9).text(`Period: ${request.semester}`, pw - 170, 101, { width: 160, align: 'right' });
    doc.strokeColor(system.muted).lineWidth(0.3).moveTo(50, 127).lineTo(pw - 50, 127).stroke();

    const cx = 50;
    const cy = 148;
    const cw = pw - cx * 2;
    const ch = 252;
    doc.fillColor(system.surface);
    doc.roundedRect(cx, cy, cw, ch, 12).fill();
    doc.opacity(0.08).strokeColor('#ffffff').lineWidth(1).roundedRect(cx, cy, cw, ch, 12).stroke().opacity(1);

    const ax = cx + 42;
    const ay = cy + 42;
    const ar = 30;
    const gy = ay - ar;
    for (let dy = 0; dy < ar * 2; dy++) {
      const t = dy / (ar * 2);
      const r = Math.round(parseInt(gradTop.slice(1, 3), 16) * (1 - t) + parseInt(gradBot.slice(1, 3), 16) * t);
      const g = Math.round(parseInt(gradTop.slice(3, 5), 16) * (1 - t) + parseInt(gradBot.slice(3, 5), 16) * t);
      const b = Math.round(parseInt(gradTop.slice(5, 7), 16) * (1 - t) + parseInt(gradBot.slice(5, 7), 16) * t);
      const hex = '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
      const yOff = gy + dy;
      const chord = Math.sqrt(Math.max(0, ar * ar - (dy - ar) * (dy - ar)));
      doc.fillColor(hex).rect(ax - chord, yOff, chord * 2, 1).fill();
    }
    const initials = request.student_name
      ? request.student_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
      : 'ST';
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(16).text(initials, ax - 12, ay - 10);

    const nx = ax + ar + 20;
    doc.fillColor(system.onSurface).font('Helvetica-Bold').fontSize(16).text(request.student_name, nx, ay - 18);
    doc.fillColor(system.onSurfaceVariant).font('Courier').fontSize(10).text(`ID:  ${request.student_number || 'N/A'}`, nx, ay + 6);
    doc.fillColor(system.onSurfaceVariant).font('Courier').fontSize(10).text(`PGM: ${request.programme}`, nx, ay + 22);
    doc.fillColor(system.onSurfaceVariant).font('Courier').fontSize(10).text(`MODE: ${request.study_mode || 'N/A'}`, nx, ay + 38);
    doc.fillColor(system.onSurfaceVariant).font('Courier').fontSize(10).text(`GENDER: ${request.gender || 'N/A'}`, nx, ay + 54);
    doc.fillColor(system.onSurfaceVariant).font('Courier').fontSize(10).text(`NRC:   ${request.nrc_number || 'N/A'}`, nx, ay + 70);
    doc.fillColor(system.onSurfaceVariant).font('Courier').fontSize(10).text(`INTAKE: ${request.intake || 'N/A'}`, nx, ay + 86);
    doc.fillColor(system.onSurfaceVariant).font('Courier').fontSize(10).text(`YEAR:  ${request.year_of_study || 'N/A'}`, nx, ay + 102);

    doc.opacity(0.06).strokeColor('#ffffff').lineWidth(0.5);
    doc.moveTo(cx + 30, ay + 124).lineTo(cx + cw - 30, ay + 124).stroke().opacity(1);

    const rx = cx + 30;
    let ry = ay + 127;
    const lh = 32;

    function badgeColor(status) {
      if (status === 'approved') return system.secondary;
      if (status === 'rejected') return system.error;
      return system.tertiary;
    }

    const rows = [
      { label: 'Accounts', value: request.accounts_status },
      { label: 'Examiner', value: request.examiner_status },
    ];

    rows.forEach((r) => {
      doc.fillColor(system.onSurfaceVariant).font('Courier').fontSize(10).text(r.label, rx, ry + 4);
      const bw = 110;
      doc.fillColor(badgeColor(r.value));
      doc.roundedRect(cx + cw - 30 - bw, ry, bw, 24, 6).fill();
      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(9).text(
        r.value === 'approved' ? 'APPROVED' : r.value.toUpperCase(),
        cx + cw - 30 - bw + 12, ry + 6
      );
      ry += lh;
    });

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    doc.fillColor(system.muted).font('Courier').fontSize(8).text(`Issued: ${dateStr} at ${timeStr}`, 50, ph - 40, { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('GET /requests/:id/slip error:', error);
    res.status(500).json({ error: 'Server error while generating slip.' });
  }
});

module.exports = router;
