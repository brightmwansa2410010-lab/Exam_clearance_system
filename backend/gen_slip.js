const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({ size: 'A4', margin: 0 });
doc.pipe(fs.createWriteStream('/tmp/exam_slip.pdf'));

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

const stampX = pageW - 80;
const stampY = 15;
const stampR = 28;
doc.fillColor(white);
doc.circle(stampX, stampY + stampR, stampR).fill();
doc.fillColor(darkGreen);
doc.circle(stampX, stampY + stampR, stampR - 3).fill();
doc.fillColor(white).font('Times-Bold').fontSize(16).text('✔', stampX - 8, stampY + stampR - 12);
doc.fillColor(white).font('Helvetica-Bold').fontSize(6.5).text('CLEARED', stampX - 17, stampY + stampR + 12);

doc.rect(0, 85, pageW, 33).fill(beige);
doc.fillColor(dark).font('Helvetica-Bold').fontSize(11).text('EXAM CLEARANCE SLIP', 50, 93);
doc.fillColor(dark).font('Helvetica').fontSize(9).text('SEM 1 — 2025/2026', pageW - 170, 93, { width: 120, align: 'right' });
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
const initials = 'CM';
doc.fillColor(white).font('Times-Bold').fontSize(16).text(initials, avatarX - 12, avatarY - 10);

const nameX = avatarX + avatarR + 20;
doc.fillColor(dark).font('Times-Bold').fontSize(16).text('Chilufya Mulenga', nameX, avatarY - 18);
doc.fillColor(muted).font('Courier').fontSize(10).text('ID:  ZUCT-2024-072', nameX, avatarY + 6);
doc.fillColor(muted).font('Courier').fontSize(10).text('PGM: BSc in Computer Science', nameX, avatarY + 22);

doc.strokeColor('#ddd').lineWidth(0.5);
doc.moveTo(cardX + 30, avatarY + 55).lineTo(cardX + cardW - 30, avatarY + 55).stroke();

const rowX = cardX + 30;
let rowY = avatarY + 78;
const lineH = 32;

const rows = [
  { label: 'Accounts', value: 'approved', color: darkGreen },
  { label: 'Examiner', value: 'approved', color: darkGreen },
];

rows.forEach((r) => {
  doc.fillColor(muted).font('Courier').fontSize(10).text(r.label, rowX, rowY + 4);
  const badgeW = 110;
  doc.fillColor(r.color);
  doc.roundedRect(cardX + cardW - 30 - badgeW, rowY, badgeW, 24, 6).fill();
  doc.fillColor(white).font('Helvetica-Bold').fontSize(9).text(
    r.value === 'approved' ? '✓ APPROVED' : r.value.toUpperCase(),
    cardX + cardW - 30 - badgeW + 12, rowY + 6
  );
  rowY += lineH;
});

doc.end();
console.log('PDF written to /tmp/exam_slip.pdf');
