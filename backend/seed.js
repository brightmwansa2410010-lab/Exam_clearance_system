require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('./db');

async function seed() {
  const password = await bcrypt.hash('password123', 10);

  await pool.query('DELETE FROM requests');
  await pool.query('DELETE FROM users');

  const accounts = await pool.query(
    `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id`,
    ['Alice Banda', 'accounts@example.com', password, 'accounts']
  );

  const examiner = await pool.query(
    `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id`,
    ['Dr. Brian Mwansa', 'examiner@example.com', password, 'examiner']
  );

  const students = [];
  const studentData = [
    { name: 'Chilufya Mulenga', email: 'chilufya@example.com', student_id: 'ZUCT-2024-001', nrc: '314368/71/1', mode: 'Full-time', gender: 'Male' },
    { name: 'Mary Zulu', email: 'mary@example.com', student_id: 'ZUCT-2024-002', nrc: '415279/62/2', mode: 'Full-time', gender: 'Female' },
    { name: 'John Phiri', email: 'john@example.com', student_id: 'ZUCT-2024-003', nrc: '518394/73/1', mode: 'Part-time', gender: 'Male' },
    { name: 'Grace Banda', email: 'grace@example.com', student_id: 'ZUCT-2024-004', nrc: '612485/84/3', mode: 'Distance Learning', gender: 'Female' },
  ];

  for (const s of studentData) {
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, student_id, nrc_number, profile_complete, study_mode, gender)
       VALUES ($1, $2, $3, 'student', $4, $5, true, $6, $7) RETURNING id`,
      [s.name, s.email, password, s.student_id, s.nrc, s.mode, s.gender]
    );
    students.push(result.rows[0].id);
  }

  const programmes = ['BSc in Computer Science', 'BSc in Business Administration', 'Diploma in Education'];
  const semesters = ['Semester 1 — 2025/2026', 'Semester 2 — 2025/2026'];

  const statuses = ['pending', 'approved', 'rejected'];

  for (let i = 0; i < students.length; i++) {
    const count = [2, 3, 2, 4][i];
    for (let j = 0; j < count; j++) {
      const programme = programmes[(i + j) % programmes.length];
      const semester = semesters[j % semesters.length];
      let accounts_status = 'pending';
      let examiner_status = 'pending';
      let status = 'pending';

      if (j > 0) {
        accounts_status = statuses[(i + j) % statuses.length];
        examiner_status = accounts_status === 'pending' ? 'pending' : statuses[(i + j + 1) % statuses.length];
        if (accounts_status === 'rejected' || examiner_status === 'rejected') status = 'rejected';
        else if (accounts_status === 'approved' && examiner_status === 'approved') status = 'approved';
      }

      const intakes = ['January 2025', 'May 2025', 'September 2025'];
      const intake = intakes[(i + j) % intakes.length];
      const years = ['Year 1', 'Year 2', 'Year 3', 'Year 4'];
      const year_of_study = years[(i + j) % years.length];

      await pool.query(
        `INSERT INTO requests (student_id, programme, semester, intake, year_of_study, accounts_status, examiner_status, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [students[i], programme, semester, intake, year_of_study, accounts_status, examiner_status, status]
      );
    }
  }

  console.log('Demo data seeded successfully!\n');
  console.log('Login credentials (all use password: password123):');
  console.log('  Accounts: accounts@example.com');
  console.log('  Examiner: examiner@example.com');
  console.log('  Students: chilufya@example.com, mary@example.com, john@example.com, grace@example.com');

  await pool.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
