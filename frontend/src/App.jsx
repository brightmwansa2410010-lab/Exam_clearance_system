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

  const handleRequestSubmit = async (programme, semester, intake, year_of_study) => {
    const data = await apiFetch('/requests', token, {
      method: 'POST',
      body: { programme, semester, intake, year_of_study },
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

    const updatedUser = { ...user, student_id: studentIdNumber, nrc_number: nrcNumber, study_mode: studyMode, gender };
    setUser(updatedUser);
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ user: updatedUser, token }));
    return true;
  };

  if (!user) {
    return <Login onLogin={handleLogin} error={error} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full h-[72px] bg-surface/80 backdrop-blur-md border-b border-white/10 shadow-[0_0_20px_rgba(192,193,255,0.1)] z-50">
        <div className="flex justify-between items-center h-full px-margin-desktop max-w-container-max mx-auto">
          <div className="text-headline-md font-headline-md font-bold tracking-tight text-primary">Exam Clearance System</div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 text-on-surface-variant text-label-md font-label-md">
              <span className="text-primary border-b-2 border-primary pb-1">Dashboard</span>
            </div>
            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
              <div className="text-right">
                <p className="text-label-md font-label-md text-on-surface leading-none">{user.name}</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">{user.role === 'accounts' ? 'Accounts Officer' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm border border-primary/30">
                {user.name?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'U'}
              </div>
              <button onClick={logout} className="text-on-surface-variant hover:text-error transition-colors ml-2">
                <span className="material-symbols-outlined">logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {loading && <div className="fixed top-[88px] left-1/2 -translate-x-1/2 z-40 bg-primary/20 text-primary text-label-md px-4 py-2 rounded-full border border-primary/30 backdrop-blur-md">Loading requests...</div>}
      {error && <div className="fixed top-[88px] left-1/2 -translate-x-1/2 z-40 bg-error-container/20 text-error text-label-md px-4 py-2 rounded-full border border-error/30 backdrop-blur-md">{error}</div>}

      {user.role === 'student' && (
        <StudentDashboard requests={requests} onSubmit={handleRequestSubmit} onProfileSave={handleProfileSave} user={user} token={token} onLogout={logout} />
      )}
      {user.role === 'accounts' && (
        <AccountsDashboard requests={requests} onAction={handleApproval} user={user} />
      )}
      {user.role === 'examiner' && (
        <ExaminerDashboard requests={requests} onAction={handleApproval} user={user} />
      )}
    </div>
  );
}

export default App;
