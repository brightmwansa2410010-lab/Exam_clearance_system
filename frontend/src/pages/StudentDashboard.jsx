import { useState } from 'react';
import { API_URL } from '../services/api';

function StudentDashboard({ requests, onSubmit, onProfileSave, user, token, onLogout }) {
  const [programme, setProgramme] = useState('');
  const [semester, setSemester] = useState('Semester 1 — 2025/2026');
  const [intake, setIntake] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [message, setMessage] = useState('');

  const [studentId, setStudentId] = useState(user?.student_id || '');
  const [nrcNumber, setNrcNumber] = useState(user?.nrc_number || '');
  const [studyMode, setStudyMode] = useState(user?.study_mode || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [profileMessage, setProfileMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const success = await onSubmit(programme, semester, intake, yearOfStudy);
    if (success) {
      setMessage('Request saved. Wait for approvals.');
      setProgramme('');
      setIntake('');
      setYearOfStudy('');
    }
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    if (!studentId) { setProfileMessage('Student ID is required.'); return; }
    if (!nrcNumber) { setProfileMessage('NRC Number is required.'); return; }
    const success = await onProfileSave(studentId, nrcNumber, studyMode, gender);
    setProfileMessage(success ? 'Profile saved!' : 'Failed to save profile.');
    if (success) setTimeout(() => setProfileMessage(''), 3000);
  };

  const latest = requests[requests.length - 1];
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;

  return (
    <div className="pt-[72px] pb-12 min-h-screen">
      <div className="fixed top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>



      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-display-lg font-display-lg text-primary">Clearance Dashboard</h1>
            <p className="text-body-lg font-body-lg text-on-surface-variant max-w-2xl">Welcome back, {user.name}. Monitor your academic clearance status.</p>
          </div>
          <div className="flex items-center space-x-2 bg-surface-container-high px-4 py-2 rounded-full border border-white/5">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span className="text-label-md font-label-md text-secondary">System Online: Approval window active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <div className="glass-card p-6 rounded-xl flex flex-col justify-between group hover:border-primary/50 transition-all duration-300">
            <div className="flex justify-between items-start">
              <p className="text-label-md font-label-md text-on-surface-variant">Overall Status</p>
              <span className="material-symbols-outlined text-primary group-hover:rotate-12 transition-transform">verified</span>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline space-x-2">
                <span className="text-headline-lg font-headline-lg text-on-surface">
                  {requests.length === 0 ? '—' : latest.status === 'approved' ? 'Cleared' : latest.status === 'rejected' ? 'Rejected' : 'In Progress'}
                </span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="h-full primary-gradient rounded-full" style={{ width: requests.length === 0 ? '0%' : approvedCount > 0 ? '100%' : '50%' }}></div>
              </div>
            </div>
          </div>
          <div className="glass-card p-6 rounded-xl flex flex-col justify-between group hover:border-secondary/50 transition-all duration-300">
            <div className="flex justify-between items-start">
              <p className="text-label-md font-label-md text-on-surface-variant">Accounts Status</p>
              <span className="material-symbols-outlined text-secondary group-hover:scale-110 transition-transform">payments</span>
            </div>
            <div className="mt-4">
              <div className={`px-3 py-1.5 rounded-lg inline-flex items-center space-x-2 ${latest?.accounts_status === 'approved' ? 'status-glow-success bg-secondary/10' : 'status-glow-pending'}`}>
                <span className={`w-2 h-2 rounded-full ${latest?.accounts_status === 'approved' ? 'bg-secondary' : 'bg-tertiary animate-pulse'}`}></span>
                <span className={`text-label-md font-label-md ${latest?.accounts_status === 'approved' ? 'text-secondary' : 'text-tertiary'}`}>
                  {latest?.accounts_status ? latest.accounts_status.charAt(0).toUpperCase() + latest.accounts_status.slice(1) : '—'}
                </span>
              </div>
            </div>
          </div>
          <div className="glass-card p-6 rounded-xl flex flex-col justify-between group hover:border-tertiary/50 transition-all duration-300">
            <div className="flex justify-between items-start">
              <p className="text-label-md font-label-md text-on-surface-variant">Examiner Status</p>
              <span className="material-symbols-outlined text-tertiary group-hover:rotate-[-10deg] transition-transform">school</span>
            </div>
            <div className="mt-4">
              <div className={`px-3 py-1.5 rounded-lg inline-flex items-center space-x-2 ${latest?.examiner_status === 'approved' ? 'status-glow-success bg-secondary/10' : 'status-glow-pending'}`}>
                <span className={`w-2 h-2 rounded-full ${latest?.examiner_status === 'approved' ? 'bg-secondary' : 'bg-tertiary animate-pulse'}`}></span>
                <span className={`text-label-md font-label-md ${latest?.examiner_status === 'approved' ? 'text-secondary' : 'text-tertiary'}`}>
                  {latest?.examiner_status ? latest.examiner_status.charAt(0).toUpperCase() + latest.examiner_status.slice(1) : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-gutter">
          <section className="xl:col-span-3 glass-card rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-headline-md font-headline-md text-on-surface">Student Profile</h2>
            </div>
            <div className="p-8">
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSaveProfile}>
                <div className="space-y-2">
                  <label className="text-label-md font-label-md text-on-surface-variant">Student ID</label>
                  <input className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-all" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="e.g. ZUCT-2024-001" required />
                </div>
                <div className="space-y-2">
                  <label className="text-label-md font-label-md text-on-surface-variant">Study Mode</label>
                  <select className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-all" value={studyMode} onChange={(e) => setStudyMode(e.target.value)}>
                    <option value="">Select Mode</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Distance Learning">Distance Learning</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-label-md font-label-md text-on-surface-variant">Gender</label>
                  <div className="flex space-x-4 pt-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input className="text-primary focus:ring-primary bg-surface-container border-white/10" type="radio" name="gender" checked={gender === 'Male'} onChange={() => setGender('Male')} />
                      <span className="text-body-md font-body-md text-on-surface">Male</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input className="text-primary focus:ring-primary bg-surface-container border-white/10" type="radio" name="gender" checked={gender === 'Female'} onChange={() => setGender('Female')} />
                      <span className="text-body-md font-body-md text-on-surface">Female</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-label-md font-label-md text-on-surface-variant">NRC Number</label>
                  <input className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-all" value={nrcNumber} onChange={(e) => setNrcNumber(e.target.value)} placeholder="e.g. 123456/78/1" required />
                </div>
                <div className="md:col-span-2">
                  <button className="primary-gradient text-on-primary font-label-md text-label-md py-3 px-6 rounded-lg font-bold hover:brightness-110 active:scale-95 transition-all" type="submit">Save Profile</button>
                  {profileMessage && <span className={`ml-4 text-label-md ${profileMessage.includes('Failed') ? 'text-error' : 'text-secondary'}`}>{profileMessage}</span>}
                </div>
              </form>
            </div>
          </section>

          <section className="xl:col-span-2 glass-card rounded-xl border-l-4 border-primary shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 primary-gradient opacity-10 blur-3xl -mr-16 -mt-16"></div>
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="text-headline-md font-headline-md text-on-surface">New Clearance Request</h2>
            </div>
            <form className="p-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-label-md font-label-md text-on-surface-variant">Programme of Study</label>
                <input className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all" value={programme} onChange={(e) => setProgramme(e.target.value)} placeholder="e.g. BSc in Computer Science" required />
              </div>
              <div className="space-y-2">
                <label className="text-label-md font-label-md text-on-surface-variant">Academic Period</label>
                <select className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-all" value={semester} onChange={(e) => setSemester(e.target.value)}>
                  <option value="Semester 1 — 2025/2026">Semester 1 — 2025/2026</option>
                  <option value="Semester 2 — 2025/2026">Semester 2 — 2025/2026</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-label-md font-label-md text-on-surface-variant">Intake</label>
                <input className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all" value={intake} onChange={(e) => setIntake(e.target.value)} placeholder="e.g. January 2025" />
              </div>
              <div className="space-y-2">
                <label className="text-label-md font-label-md text-on-surface-variant">Year of Study</label>
                <select className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-all" value={yearOfStudy} onChange={(e) => setYearOfStudy(e.target.value)}>
                  <option value="">Select Year</option>
                  <option value="Year 1">Year 1</option>
                  <option value="Year 2">Year 2</option>
                  <option value="Year 3">Year 3</option>
                  <option value="Year 4">Year 4</option>
                  <option value="Year 5">Year 5</option>
                  <option value="Year 6">Year 6</option>
                </select>
              </div>
              <div className="pt-4">
                <button className="w-full primary-gradient text-on-primary font-label-md text-label-md py-4 rounded-lg font-bold shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all" type="submit">Submit Clearance Request</button>
                {message && <p className="text-center mt-4 text-label-sm text-secondary">{message}</p>}
              </div>
            </form>
          </section>
        </div>

        <section className="glass-card rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <h2 className="text-headline-md font-headline-md text-on-surface">Clearance History & Status</h2>
            <span className="text-label-sm font-label-sm bg-primary/20 text-primary px-3 py-1 rounded-full border border-primary/30">Academic Year 2024</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-6 py-4 text-label-md font-label-md text-on-surface uppercase tracking-wider">Programme</th>
                  <th className="px-6 py-4 text-label-md font-label-md text-on-surface uppercase tracking-wider">Semester</th>
                  <th className="px-6 py-4 text-label-md font-label-md text-on-surface uppercase tracking-wider">Intake</th>
                  <th className="px-6 py-4 text-label-md font-label-md text-on-surface uppercase tracking-wider">Year</th>
                  <th className="px-6 py-4 text-label-md font-label-md text-on-surface uppercase tracking-wider">Accounts</th>
                  <th className="px-6 py-4 text-label-md font-label-md text-on-surface uppercase tracking-wider">Examiner</th>
                  <th className="px-6 py-4 text-label-md font-label-md text-on-surface uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-label-md font-label-md text-on-surface uppercase tracking-wider text-right">Slip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {requests.length === 0 ? (
                  <tr><td colSpan="8" className="px-6 py-8 text-center text-on-surface-variant">No requests yet. Submit your first clearance request above.</td></tr>
                ) : (
                  [...requests].reverse().map((request) => (
                    <tr className="hover:bg-white/5 transition-colors group" key={request.id}>
                      <td className="px-6 py-6 text-body-md font-body-md text-on-surface">{request.programme}</td>
                      <td className="px-6 py-6 text-body-md font-body-md text-on-surface-variant">{request.semester.replace(/ —.*$/, '')}</td>
                      <td className="px-6 py-6 text-body-md font-body-md text-on-surface-variant">{request.intake || '—'}</td>
                      <td className="px-6 py-6 text-body-md font-body-md text-on-surface-variant">{request.year_of_study || '—'}</td>
                      <td className="px-6 py-6">
                        <span className={`inline-flex items-center space-x-1.5 ${request.accounts_status === 'approved' ? 'text-secondary' : request.accounts_status === 'rejected' ? 'text-error' : 'text-tertiary'}`}>
                          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: request.accounts_status === 'approved' ? "'FILL' 1" : "'FILL' 0" }}>
                            {request.accounts_status === 'approved' ? 'check_circle' : request.accounts_status === 'rejected' ? 'cancel' : 'history'}
                          </span>
                          <span className="text-label-sm font-label-sm">{request.accounts_status.charAt(0).toUpperCase() + request.accounts_status.slice(1)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`inline-flex items-center space-x-1.5 ${request.examiner_status === 'approved' ? 'text-secondary' : request.examiner_status === 'rejected' ? 'text-error' : 'text-tertiary'}`}>
                          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: request.examiner_status === 'approved' ? "'FILL' 1" : "'FILL' 0" }}>
                            {request.examiner_status === 'approved' ? 'check_circle' : request.examiner_status === 'rejected' ? 'cancel' : 'history'}
                          </span>
                          <span className="text-label-sm font-label-sm">{request.examiner_status.charAt(0).toUpperCase() + request.examiner_status.slice(1)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <div className={`px-3 py-1 rounded-full inline-block text-label-sm font-label-sm border ${request.status === 'approved' ? 'status-glow-success text-secondary border-secondary/30 bg-secondary/10' : request.status === 'rejected' ? 'bg-error/10 text-error border-error/20' : 'status-glow-pending text-tertiary border-tertiary/30 bg-tertiary/10'}`}>
                          {request.status === 'approved' ? 'Fully Cleared' : request.status === 'rejected' ? 'Rejected' : 'In Progress'}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        {request.status === 'approved' ? (
                          <button className="bg-primary/10 hover:bg-primary text-primary hover:text-on-primary p-2 rounded-lg transition-all shadow-sm" onClick={async () => {
                            try {
                              const res = await fetch(`${API_URL}/requests/${request.id}/slip`, { headers: { Authorization: `Bearer ${token}` } });
                              if (!res.ok) throw new Error(await res.text());
                              const blob = await res.blob();
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url; a.download = `exam-slip-${request.id}.pdf`;
                              a.click(); URL.revokeObjectURL(url);
                            } catch (err) {
                              if (err.message.includes('expired') || err.message.includes('denied') || err.message.includes('Forbidden')) {
                                onLogout();
                              } else {
                                alert('Download failed: ' + err.message);
                              }
                            }
                          }}>
                            <span className="material-symbols-outlined">download</span>
                          </button>
                        ) : (
                          <span className="opacity-30 cursor-not-allowed p-2 inline-block">
                            <span className="material-symbols-outlined">download</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default StudentDashboard;
