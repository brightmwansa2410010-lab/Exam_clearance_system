import { useEffect, useState } from 'react';
import { apiFetch } from './services/api';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import AccountsDashboard from './pages/AccountsDashboard';
import ExaminerDashboard from './pages/ExaminerDashboard';

const LOCAL_STORAGE_KEY = 'exam_clearance_user';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const payload = parsed.token ? JSON.parse(atob(parsed.token.split('.')[1])) : null;
        if (payload && payload.exp * 1000 > Date.now()) {
          setUser(parsed.user);
          setToken(parsed.token);
        } else {
          window.localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      } catch {
        window.localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (!user || !token) return;
    loadRequests();
  }, [user, token]);

  const saveAuth = (auth) => {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(auth));
    setUser(auth.user);
    setToken(auth.token);
  };

  const logout = () => {
    window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    setUser(null);
    setToken('');
    setRequests([]);
    setError('');
  };

  const loadRequests = async () => {
    setLoading(true);
    const data = await apiFetch('/requests', token, { method: 'GET' });
    setLoading(false);
    if (data.expired) {
      logout();
    } else if (data.error) {
      setError(data.error);
    } else if (data.requests) {
      setRequests(data.requests);
      setError('');
    } else {
      setError('Unexpected response from server');
    }
  };

  const handleLogin = async (email, password, isRegister, name, role) => {
    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    const body = isRegister
      ? { name, email, password, role }
      : { email, password };
    const data = await apiFetch(endpoint, '', { method: 'POST', body });

    if (data.error) {
      setError(data.error);
      return false;
    }

    if (isRegister) {
      const loginData = await apiFetch('/auth/login', '', {
        method: 'POST',
        body: { email, password },
      });

      if (loginData.error) {
        setError(loginData.error);
        return false;
      }

      if (loginData.token && loginData.user) {
        saveAuth(loginData);
        setError('');
        return true;
      }
    }

    if (data.token && data.user) {
      saveAuth(data);
      setError('');
      return true;
    }

    setError('Unexpected login response');
    return false;
  };

  const handleRequestSubmit = async (programme, semester) => {
    const data = await apiFetch('/requests', token, {
      method: 'POST',
      body: { programme, semester },
    });
    if (data.error) return false;
    await loadRequests();
    return true;
  };

  const handleApproval = async (requestId, action) => {
    const data = await apiFetch('/requests/approve', token, {
      method: 'PATCH',
      body: { requestId, action },
    });
    if (data.error) return false;
    await loadRequests();
    return true;
  };

  const handleProfileSave = async (studentIdNumber, nrcNumber, studyMode, gender) => {
    const data = await apiFetch('/auth/profile', token, {
      method: 'PATCH',
      body: { student_id_number: studentIdNumber, nrc_number: nrcNumber, study_mode: studyMode, gender },
    });
    if (data.error) return false;

    const updatedUser = { ...user, student_id: studentIdNumber };
    setUser(updatedUser);
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ user: updatedUser, token }));
    return true;
  };

  if (!user) {
    return (
      <div className="app-shell">
        <Login onLogin={handleLogin} error={error} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="header-card">
        <div>
          <div className="header-title">Exam Clearance System</div>
          <div className="header-subtitle">Signed in as {user.name} <span className="role-badge">{user.role}</span></div>
        </div>
        <button className="button button-outline" onClick={logout}>
          Sign out
        </button>
      </header>

      {loading && <div className="alert">Loading requests...</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {user.role === 'student' && (
        <StudentDashboard requests={requests} onSubmit={handleRequestSubmit} onProfileSave={handleProfileSave} user={user} token={token} />
      )}
      {user.role === 'accounts' && (
        <AccountsDashboard requests={requests} onAction={handleApproval} />
      )}
      {user.role === 'examiner' && (
        <ExaminerDashboard requests={requests} onAction={handleApproval} />
      )}
    </div>
  );
}

export default App;
