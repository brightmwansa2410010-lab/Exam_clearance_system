function validateRegisterInput(req, res, next) {
  const { name, email, password, role } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters.' });
  }
  if (!password || typeof password !== 'string' || password.length < 8 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters with uppercase, lowercase, and a number.' });
  }
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: 'A valid email is required.' });
  }
  if (!['student', 'accounts', 'examiner'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role.' });
  }

  next();
}

function validateLoginInput(req, res, next) {
  const { email, password } = req.body;

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Password is required.' });
  }
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: 'A valid email is required.' });
  }

  next();
}

function validateRequestInput(req, res, next) {
  const { programme, semester, intake, year_of_study } = req.body;

  if (!programme || typeof programme !== 'string' || programme.trim().length < 2) {
    return res.status(400).json({ error: 'Programme is required (min 2 characters).' });
  }
  if (!semester || typeof semester !== 'string' || semester.trim().length < 2) {
    return res.status(400).json({ error: 'Semester is required.' });
  }
  if (intake && (typeof intake !== 'string' || intake.trim().length < 1)) {
    return res.status(400).json({ error: 'Invalid intake value.' });
  }
  if (year_of_study && (typeof year_of_study !== 'string' || year_of_study.trim().length < 1)) {
    return res.status(400).json({ error: 'Invalid year of study.' });
  }

  next();
}

function validateApprovalInput(req, res, next) {
  const { requestId, action } = req.body;

  if (!requestId || typeof requestId !== 'number') {
    return res.status(400).json({ error: 'Valid requestId is required.' });
  }
  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'Action must be "approve" or "reject".' });
  }

  next();
}

module.exports = { validateRegisterInput, validateLoginInput, validateRequestInput, validateApprovalInput };