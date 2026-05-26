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
                u.passport_photo_url, u.nrc_front_url, u.nrc_back_url
         FROM requests r
         JOIN users u ON r.student_id = u.id
         WHERE r.student_id = $1
         ORDER BY r.id DESC`,
        [id]
      );
    } else if (role === 'accounts') {
      result = await db.query(
        `SELECT r.*, u.name AS student_name, u.student_id AS student_number,
                u.passport_photo_url, u.nrc_front_url, u.nrc_back_url
         FROM requests r
         JOIN users u ON r.student_id = u.id
         ORDER BY r.id DESC`
      );
    } else if (role === 'examiner') {
      result = await db.query(
        `SELECT r.*, u.name AS student_name, u.student_id AS student_number,
                u.passport_photo_url, u.nrc_front_url, u.nrc_back_url
         FROM requests r
         JOIN users u ON r.student_id = u.id
         WHERE r.accounts_status = 'approved'
         ORDER BY r.id DESC`
      );
    } else {
      return res.status(403).json({ error: 'Unknown role.' });
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

    const { programme, semester } = req.body;

    const existing = await db.query(
      'SELECT id FROM requests WHERE student_id = $1',
      [req.user.id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'You already have a clearance request on file.' });
    }

    const result = await db.query(
      `INSERT INTO requests (student_id, programme, semester)
       VALUES ($1, $2, $3) RETURNING *`,
      [req.user.id, programme, semester]
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
      `SELECT r.*, u.name AS student_name, u.student_id AS student_number
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

    const pageW = doc.page.width;
    const pageH = doc.page.height;
    const darkGreen = '#0f4c0f';
    const cream = '#f9f5e8';
    const beige = '#e8e0cc';
    const white = '#ffffff';
    const dark = '#1a1a1a';
    const muted = '#666666';

    doc.rect(0, 0, pageW, pageH).fill(cream);

    doc.rect(0, 0, pageW, 85).fill(darkGreen);
    doc.fillColor(white).font('Times-Bold').fontSize(32).text('ZUCT', 50, 18);
    doc.fillColor('#c8e6c9').font('Times-Roman').fontSize(9).text('ZAMBIA UNIVERSITY COLLEGE OF TECHNOLOGY', 50, 56);

    doc.fillColor(white).font('Helvetica-Bold').fontSize(14).text('CLEARED', pageW - 120, 30);

    doc.rect(0, 85, pageW, 33).fill(beige);
    doc.fillColor(dark).font('Helvetica-Bold').fontSize(11).text('EXAM CLEARANCE SLIP', 50, 93);
    doc.fillColor(dark).font('Helvetica').fontSize(9).text(request.semester, pageW - 170, 93, { width: 120, align: 'right' });
    doc.strokeColor('#c0b8a0').lineWidth(0.5).moveTo(50, 117).lineTo(pageW - 50, 117).stroke();

    const cardX = 50;
    const cardY = 138;
    const cardW = pageW - cardX * 2;
    const cardH = 210;
    doc.fillColor(white);
    doc.roundedRect(cardX, cardY, cardW, cardH, 10).fill();

    const avatarX = cardX + 42;
    const avatarY = cardY + 42;
    const avatarR = 30;
    doc.fillColor(darkGreen);
    doc.circle(avatarX, avatarY, avatarR).fill();
    const initials = request.student_name
      ? request.student_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
      : 'ST';
    doc.fillColor(white).font('Times-Bold').fontSize(16).text(initials, avatarX - 12, avatarY - 10);

    const nameX = avatarX + avatarR + 20;
    doc.fillColor(dark).font('Times-Bold').fontSize(16).text(request.student_name, nameX, avatarY - 18);
    doc.fillColor(muted).font('Courier').fontSize(10).text(`ID:  ${request.student_number || 'N/A'}`, nameX, avatarY + 6);
    doc.fillColor(muted).font('Courier').fontSize(10).text(`PGM: ${request.programme}`, nameX, avatarY + 22);

    doc.strokeColor('#ddd').lineWidth(0.5);
    doc.moveTo(cardX + 30, avatarY + 55).lineTo(cardX + cardW - 30, avatarY + 55).stroke();

    const rowX = cardX + 30;
    let rowY = avatarY + 78;
    const lineH = 32;

    const rows = [
      { label: 'Accounts', value: request.accounts_status, color: request.accounts_status === 'approved' ? darkGreen : '#e6a23c' },
      { label: 'Examiner', value: request.examiner_status, color: request.examiner_status === 'approved' ? darkGreen : '#e6a23c' },
    ];

    rows.forEach((r) => {
      doc.fillColor(muted).font('Courier').fontSize(10).text(r.label, rowX, rowY + 4);
      const badgeW = 110;
      doc.fillColor(r.color);
      doc.roundedRect(cardX + cardW - 30 - badgeW, rowY, badgeW, 24, 6).fill();
      doc.fillColor(white).font('Helvetica-Bold').fontSize(9).text(
        r.value === 'approved' ? 'APPROVED' : r.value.toUpperCase(),
        cardX + cardW - 30 - badgeW + 12, rowY + 6
      );
      rowY += lineH;
    });

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    doc.fillColor(muted).font('Courier').fontSize(8).text(`Issued: ${dateStr} at ${timeStr}`, 50, pageH - 40, { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('GET /requests/:id/slip error:', error);
    res.status(500).json({ error: 'Server error while generating slip.' });
  }
});

module.exports = router;
