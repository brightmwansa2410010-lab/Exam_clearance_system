import { useState } from 'react';

function StudentDashboard({ requests, onSubmit, onProfileSave, user }) {
  const [programme, setProgramme] = useState('');
  const [semester, setSemester] = useState('Semester 1 — 2025/2026');
  const [message, setMessage] = useState('');
  
  // Profile completion state
  const [studentId, setStudentId] = useState(user?.student_id || '');
  const [passportPhoto, setPassportPhoto] = useState(null);
  const [nrcFront, setNrcFront] = useState(null);
  const [nrcBack, setNrcBack] = useState(null);
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
    
    if (!studentId) {
      setProfileMessage('Student ID is required.');
      return;
    }
    
    if (!passportPhoto || !nrcFront || !nrcBack) {
      setProfileMessage('All documents are required.');
      return;
    }
    
    const success = await onProfileSave(studentId, passportPhoto, nrcFront, nrcBack);
    if (success) {
      setProfileMessage('✅ Profile saved successfully!');
      setTimeout(() => setProfileMessage(''), 3000);
    } else {
      setProfileMessage('Failed to save profile. Please try again.');
    }
  };

  return (
    <div>
      <div className="grid-row">
        <div className="stat-card">
          <div className="stat-label">Clearance status</div>
          <div className="stat-value">{requests.length === 0 ? 'No request' : requests[requests.length - 1].status}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Accounts</div>
          <div className="stat-value">{requests.length === 0 ? 'Awaiting' : requests[requests.length - 1].accounts_status}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Examiner</div>
          <div className="stat-value">{requests.length === 0 ? 'Not yet' : requests[requests.length - 1].examiner_status}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Complete your profile</div>
        <div className="subtitle">Required before submitting a clearance request</div>
        <form className="form" onSubmit={handleSaveProfile}>
          <label className="field">
            <span>Student ID</span>
            <input 
              value={studentId} 
              onChange={(e) => setStudentId(e.target.value)} 
              placeholder="e.g. 2024001" 
              required
            />
          </label>

          <div className="file-upload-section">
            <div className="file-upload-item">
              <div className="file-upload-header">
                <span className="file-icon">👤</span>
                <span className="file-title">Passport photo</span>
              </div>
              <p className="file-description">Clear face photo, plain background. JPG or PNG, max 2MB.</p>
              <div className="file-input-wrapper">
                <input 
                  type="file" 
                  id="passport"
                  accept="image/jpeg,image/png"
                  onChange={(e) => setPassportPhoto(e.target.files[0])}
                  hidden
                />
                <label htmlFor="passport" className="file-button">Choose file</label>
                <span className="file-name">{passportPhoto ? passportPhoto.name : 'No file chosen'}</span>
              </div>
            </div>

            <div className="file-upload-item">
              <div className="file-upload-header">
                <span className="file-icon">📄</span>
                <span className="file-title">NRC (front side)</span>
              </div>
              <div className="file-upload-area">
                <span className="upload-icon">⬆</span>
                <p>JPG, PNG or PDF • max 5MB</p>
              </div>
              <p className="file-description">Make sure all details are clearly visible and not blurry.</p>
              <div className="file-input-wrapper">
                <input 
                  type="file" 
                  id="nrc-front"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={(e) => setNrcFront(e.target.files[0])}
                  hidden
                />
                <label htmlFor="nrc-front" className="file-button">Choose file</label>
                <span className="file-name">{nrcFront ? nrcFront.name : 'No file chosen'}</span>
              </div>
            </div>

            <div className="file-upload-item">
              <div className="file-upload-header">
                <span className="file-icon">📄</span>
                <span className="file-title">NRC (back side)</span>
              </div>
              <div className="file-upload-area">
                <span className="upload-icon">⬆</span>
                <p>JPG, PNG or PDF • max 5MB</p>
              </div>
              <div className="file-input-wrapper">
                <input 
                  type="file" 
                  id="nrc-back"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={(e) => setNrcBack(e.target.files[0])}
                  hidden
                />
                <label htmlFor="nrc-back" className="file-button">Choose file</label>
                <span className="file-name">{nrcBack ? nrcBack.name : 'No file chosen'}</span>
              </div>
            </div>
          </div>

          <button className="button button-success button-large" type="submit"> Save profile</button>
          {profileMessage && <div className={`alert ${profileMessage.includes('✅') ? 'alert-success' : 'alert-error'}`}>{profileMessage}</div>}
        </form>
      </div>

      <div className="card">
        <div className="card-title">Request exam clearance</div>
        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Programme</span>
            <input value={programme} onChange={(e) => setProgramme(e.target.value)} placeholder="e.g. Diploma in ICT" />
          </label>
          <label className="field">
            <span>Semester</span>
            <select value={semester} onChange={(e) => setSemester(e.target.value)}>
              <option>Semester 1 — 2025/2026</option>
              <option>Semester 2 — 2025/2026</option>
            </select>
          </label>
          <button className="button button-success" type="submit">Submit request</button>
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
              <div>Student ID</div>
              <div>Programme</div>
              <div>Semester</div>
              <div>Accounts</div>
              <div>Examiner</div>
              <div>Status</div>
              <div>Exam Slip</div>
            </div>
            {requests.map((request) => (
              <div className="table-row" key={request.id}>
                <div>{request.student_number || user?.student_id || ''}</div>
                <div>{request.programme}</div>
                <div>{request.semester}</div>
                <div>{request.accounts_status}</div>
                <div>{request.examiner_status}</div>
                <div>{request.status}</div>
                <div>
                  {request.status === 'approved' ? (
                    <button
                      className="button button-link"
                      onClick={async () => {
                        try {
                          const authToken = window.localStorage.getItem('exam_clearance_user')
                            ? JSON.parse(window.localStorage.getItem('exam_clearance_user')).token
                            : '';
                          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
                          const res = await fetch(`${apiUrl}/requests/${request.id}/slip`, {
                            method: 'GET',
                            headers: { Authorization: `Bearer ${authToken}` },
                          });
                          if (!res.ok) {
                            const error = await res.text();
                            throw new Error(error || 'Failed to download slip');
                          }
                          const blob = await res.blob();
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `exam-slip-${request.id}.pdf`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          window.URL.revokeObjectURL(url);
                        } catch (err) {
                          console.error('PDF download error:', err);
                          alert('Unable to download exam slip: ' + err.message);
                        }
                      }}
                    >
                      Download
                    </button>
                  ) : (
                    <span style={{ color: '#777' }}>—</span>
                  )}
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
