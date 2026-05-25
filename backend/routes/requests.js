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
        `SELECT r.*, u.name AS student_name, u.student_id AS student_number
         FROM requests r
         JOIN users u ON r.student_id = u.id
         WHERE r.student_id = $1
         ORDER BY r.id DESC`,
        [id]
      );
    } else if (role === 'accounts') {
      result = await db.query(
        `SELECT r.*, u.name AS student_name, u.student_id AS student_number
         FROM requests r
         JOIN users u ON r.student_id = u.id
         ORDER BY r.id DESC`
      );
    } else if (role === 'examiner') {
      result = await db.query(
        `SELECT r.*, u.name AS student_name, u.student_id AS student_number
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

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    doc.pipe(res);

    const green = '#1d7f1d';
    const darkBg = '#2d2d2d';
    const muted = '#a9a9a9';
    const accent = '#ffffff';

    doc.rect(0, 0, doc.page.width, 100).fill(green);
    doc.fillColor('white').font('Helvetica-Bold').fontSize(22).text('✔ Cleared for exam', 50, 30);
    doc.font('Helvetica').fontSize(12).fillColor('#e6f5e6').text('Both approvals confirmed', 50, 60);

    const cardY = 120;
    const cardX = 50;
    const cardW = doc.page.width - cardX * 2;
    const cardH = 330;
    doc.roundedRect(cardX, cardY, cardW, cardH, 12).fill(darkBg);

    const avatarX = cardX + 45;
    const avatarY = cardY + 45;
    const avatarR = 35;
    doc.circle(avatarX, avatarY, avatarR).fill('#3f5a82');
    const initials = request.student_name
      ? request.student_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
      : 'ST';
    doc.fillColor('white').font('Helvetica-Bold').fontSize(18).text(initials, avatarX - 13, avatarY - 10);

    const nameX = avatarX + avatarR + 22;
    doc.fillColor(accent).font('Helvetica-Bold').fontSize(20).text(request.student_name, nameX, avatarY - 20);
    doc.fillColor(muted).font('Helvetica').fontSize(12).text(`Student ID: ${request.student_number || 'N/A'}`, nameX, avatarY + 6);

    doc.strokeColor('#444').lineWidth(1).moveTo(cardX + 30, avatarY + 55).lineTo(cardX + cardW - 30, avatarY + 55).stroke();

    const labelX = cardX + 40;
    const valueX = cardX + cardW - 180;
    let rowY = avatarY + 80;
    const lineHeight = 30;

    doc.fillColor(muted).font('Helvetica').fontSize(12).text('Programme', labelX, rowY);
    doc.fillColor(accent).font('Helvetica-Bold').fontSize(12).text(request.programme, valueX, rowY, { width: 140, align: 'right' });
    rowY += lineHeight;

    doc.fillColor(muted).font('Helvetica').fontSize(12).text('Semester', labelX, rowY);
    doc.fillColor(accent).font('Helvetica-Bold').fontSize(12).text(request.semester, valueX, rowY, { width: 140, align: 'right' });
    rowY += lineHeight;

    const badgeColor = request.accounts_status === 'approved' ? green : '#e6a23c';
    const badgeColor2 = request.examiner_status === 'approved' ? green : '#e6a23c';

    doc.fillColor(muted).font('Helvetica').fontSize(12).text('Accounts', labelX, rowY);
    doc.roundedRect(valueX, rowY - 4, 92, 24, 8).fill(badgeColor);
    doc.fillColor('white').font('Helvetica-Bold').fontSize(10).text(
      request.accounts_status === 'approved' ? 'Approved' : request.accounts_status,
      valueX + 10, rowY - 1
    );
    rowY += lineHeight;

    doc.fillColor(muted).font('Helvetica').fontSize(12).text('Examiner', labelX, rowY);
    doc.roundedRect(valueX, rowY - 4, 92, 24, 8).fill(badgeColor2);
    doc.fillColor('white').font('Helvetica-Bold').fontSize(10).text(
      request.examiner_status === 'approved' ? 'Approved' : request.examiner_status,
      valueX + 10, rowY - 1
    );

    const scannedDate = new Date();
    const timeString = scannedDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const dateString = scannedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const scannedText = `Scanned at ${timeString} · ${dateString}`;
    doc.fillColor(muted).font('Helvetica').fontSize(10).text(scannedText, cardX + 20, cardY + cardH + 20, { width: cardW - 40, align: 'center' });

    doc.end();
  } catch (error) {
    console.error('GET /requests/:id/slip error:', error);
    res.status(500).json({ error: 'Server error while generating slip.' });
  }
});

module.exports = router;
