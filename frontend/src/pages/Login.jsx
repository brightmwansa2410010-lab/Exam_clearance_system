import { useState } from 'react';

const roles = [
  { value: 'student', label: 'Student' },
  { value: 'accounts', label: 'Accounts Officer' },
  { value: 'examiner', label: 'Examiner' },
];

function Login({ onLogin, error }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [studentId, setStudentId] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onLogin(email, password, isRegister, name, role, studentId);
  };

  return (
    <div className="card auth-card">
      <div className="card-header">
        <div className="title">Exam clearance system</div>
        <div className="subtitle">Sign in to your account</div>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        {isRegister && (
          <label className="field">
            <span>Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </label>
        )}

        {isRegister && role === 'student' && (
          <label className="field">
            <span>Student ID</span>
            <input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="e.g. 2024001 or Acc12345" />
          </label>
        )}

        <label className="field">
          <span>Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@example.com" />
        </label>

        <label className="field">
          <span>Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
        </label>

        {isRegister && (
          <label className="field">
            <span>Role</span>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              {roles.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        <button className="button button-primary" type="submit">
          {isRegister ? 'Register' : 'Sign in'}
        </button>

        <button
          type="button"
          className="button button-outline"
          onClick={() => {
            setIsRegister(!isRegister);
            setName('');
            setEmail('');
            setPassword('');
            setStudentId('');
            setRole('student');
          }}
        >
          {isRegister ? 'Have an account? Log in' : 'Register new account'}
        </button>
      </form>
    </div>
  );
}

export default Login;
