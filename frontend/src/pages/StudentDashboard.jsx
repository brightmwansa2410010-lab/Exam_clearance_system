import { useState } from 'react';
import { API_URL } from '../services/api';

function StudentDashboard({ requests, onSubmit, onProfileSave, user, token }) {
  const [programme, setProgramme] = useState('');
  const [semester, setSemester] = useState('Semester 1 — 2025/2026');
  const [message, setMessage] = useState('');

  const [studentId, setStudentId] = useState(user?.student_id || '');
  const [nrcNumber, setNrcNumber] = useState('');
  const [studyMode, setStudyMode] = useState('');
  const [gender, setGender] = useState('');
  const [profileMessage, setProfileMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const success = await onSubmit(programme, semester);
    if (success) {
      setMessage('Request saved. Wait for approvals.');
      setProgramme('');
    }
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    if (!studentId) { setProfileMessage('Student ID is required.'); return; }
    if (!nrcNumber) { setProfileMessage('NRC Number is required.'); return; }
    const success = await onProfileSave(studentId, nrcNumber, studyMode, gender);
    setProfileMessage(success ? '✅ Profile saved!' : 'Failed to save profile.');
    if (success) setTimeout(() => setProfileMessage(''), 3000);
  };

  return (
    <div>
      <div className="grid-row">
        <div className="stat-card">
          <div className="stat-label">Status</div>
          <div className="stat-value">{requests.length === 0 ? 'No request' : requests[requests.length - 1].status}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Accounts</div>
          <div className="stat-value">{requests.length === 0 ? '—' : requests[requests.length - 1].accounts_status}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Examiner</div>
          <div className="stat-value">{requests.length === 0 ? '—' : requests[requests.length - 1].examiner_status}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Complete your profile</div>
        <form className="form" onSubmit={handleSaveProfile}>
          <label className="field">
            <span>Student ID</span>
            <input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="e.g. 2024001" required />
          </label>
          <label className="field">
            <span>Study Mode</span>
            <select value={studyMode} onChange={(e) => setStudyMode(e.target.value)}>
              <option value="">-- Select Study Mode --</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Distance Learning">Distance Learning</option>
              <option value="Evening">Evening</option>
              <option value="Weekend">Weekend</option>
            </select>
          </label>
          <label className="field">
            <span>Gender</span>
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">-- Select Gender --</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <label className="field">
            <span>NRC Number</span>
            <input value={nrcNumber} onChange={(e) => setNrcNumber(e.target.value)} placeholder="e.g. 314368/71/1" required />
          </label>
          <button className="button button-success button-large" type="submit">Save profile</button>
          {profileMessage && <div className={`alert ${profileMessage.includes('✅') ? 'alert-success' : 'alert-error'}`}>{profileMessage}</div>}
        </form>
      </div>

      <div className="card">
        <div className="card-title">New Clearance Request</div>
        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Programme</span>
            <input value={programme} onChange={(e) => setProgramme(e.target.value)} placeholder="e.g. BSc in Computer Science" required />
          </label>
          <label className="field">
            <span>Semester</span>
            <select value={semester} onChange={(e) => setSemester(e.target.value)}>
              <option value="Semester 1 — 2025/2026">Semester 1 — 2025/2026</option>
              <option value="Semester 2 — 2025/2026">Semester 2 — 2025/2026</option>
            </select>
          </label>
          <button className="button button-primary button-large" type="submit">Submit request</button>
          {message && <div className="alert alert-success">{message}</div>}
        </form>
      </div>

      <div className="card">
        <div className="card-title">Your requests</div>
        {requests.length === 0 ? (
          <p>No requests yet.</p>
        ) : (
          <div className="table">
            <div className="table-row table-header">
              <div>Programme</div>
              <div>Semester</div>
              <div>Accounts</div>
              <div>Examiner</div>
              <div>Status</div>
              <div>Slip</div>
            </div>
            {requests.map((request) => (
              <div className="table-row" key={request.id}>
                <div>{request.programme}</div>
                <div>{request.semester}</div>
                <div><span className={`badge badge-${request.accounts_status}`}>{request.accounts_status}</span></div>
                <div><span className={`badge badge-${request.examiner_status}`}>{request.examiner_status}</span></div>
                <div><span className={`badge badge-${request.status}`}>{request.status}</span></div>
                <div>
                  {request.status === 'approved' ? (
                    <button className="button button-sm button-success" onClick={async () => {
                      try {
                        const res = await fetch(`${API_URL}/requests/${request.id}/slip`, {
                          headers: { Authorization: `Bearer ${token}` },
                        });
                        if (!res.ok) throw new Error(await res.text());
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url; a.download = `exam-slip-${request.id}.pdf`;
                        a.click(); URL.revokeObjectURL(url);
                      } catch (err) {
                        alert('Download failed: ' + err.message);
                      }
                    }}>Download</button>
                  ) : <span style={{ color: '#777' }}>—</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;
