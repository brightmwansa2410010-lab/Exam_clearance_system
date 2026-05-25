function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function validateRegisterInput(req, res, next) {
  const { name, email, password, role, student_id } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters.' });
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: 'A valid email is required.' });
  }
  const validRoles = ['student', 'accounts', 'examiner'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role.' });
  }
  if (role === 'student' && (!student_id || typeof student_id !== 'string' || student_id.trim().length < 1)) {
    return res.status(400).json({ error: 'Student ID is required for students.' });
  }

  req.body.name = sanitize(name);
  req.body.email = sanitize(email);
  req.body.student_id = student_id ? sanitize(student_id) : null;
  next();
}

function validateLoginInput(req, res, next) {
  const { email, student_id, password } = req.body;

  if (!password || typeof password !== 'string' || password.length < 1) {
    return res.status(400).json({ error: 'Password is required.' });
  }
  if (!email && !student_id) {
    return res.status(400).json({ error: 'Email or Student ID is required.' });
  }
  if (email && (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  if (email) req.body.email = sanitize(email);
  if (student_id) req.body.student_id = sanitize(student_id);
  next();
}

function validateRequestInput(req, res, next) {
  const { programme, semester } = req.body;

  if (!programme || typeof programme !== 'string' || programme.trim().length < 2) {
    return res.status(400).json({ error: 'Programme is required (min 2 characters).' });
  }
  if (!semester || typeof semester !== 'string' || semester.trim().length < 2) {
    return res.status(400).json({ error: 'Semester is required.' });
  }

  req.body.programme = sanitize(programme);
  req.body.semester = sanitize(semester);
  next();
}

function validateApprovalInput(req, res, next) {
  const { requestId, action } = req.body;

  if (!requestId || !Number.isInteger(requestId)) {
    return res.status(400).json({ error: 'Valid requestId is required.' });
  }
  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'Action must be "approve" or "reject".' });
  }

  next();
}

module.exports = { validateRegisterInput, validateLoginInput, validateRequestInput, validateApprovalInput };
