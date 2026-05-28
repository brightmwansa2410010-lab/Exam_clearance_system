import { jsPDF } from 'jspdf';

function ExaminerDashboard({ requests, onAction, user }) {
  const filtered = requests.filter((request) => request.accounts_status === 'approved');
  const awaiting = filtered.filter(r => r.examiner_status === 'pending').length;
  const approved = filtered.filter(r => r.examiner_status === 'approved').length;
  const rejected = filtered.filter(r => r.examiner_status === 'rejected').length;

  const handleExport = () => {
    if (filtered.length === 0) {
      alert('No requests to export');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    doc.setFontSize(18);
    doc.text('Exam List — Approved Students', margin, 20);

    doc.setFontSize(10);
    const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.text(`Generated: ${dateStr} | Total: ${filtered.length} students`, margin, 28);

    const tableTop = 35;
    const col1 = margin;
    const col2 = col1 + 30;
    const col3 = col2 + 40;
    const col4 = col3 + 30;
    const col5 = col4 + 30;
    const col6 = col5 + 20;
    const col7 = col6 + 20;
    const col8 = col7 + 18;

    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.text('Student ID', col1, tableTop);
    doc.text('Name', col2, tableTop);
    doc.text('Programme', col3, tableTop);
    doc.text('Period', col4, tableTop);
    doc.text('Intake', col5, tableTop);
    doc.text('Year', col6, tableTop);
    doc.text('Accounts', col7, tableTop);
    doc.text('Examiner', col8, tableTop);

    doc.line(margin, tableTop + 2, pageWidth - margin, tableTop + 2);

    doc.setFont(undefined, 'normal');
    doc.setFontSize(7);
    let yPos = tableTop + 8;
    const rowH = 5;

    filtered.forEach((request) => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = margin + 10;
      }

      doc.text(String(request.student_number || request.id).substring(0, 12), col1, yPos);
      doc.text(String(request.student_name).substring(0, 16), col2, yPos);
      doc.text(String(request.programme).substring(0, 12), col3, yPos);
      doc.text(String(request.semester).replace(/ —.*$/, '').substring(0, 12), col4, yPos);
      doc.text(String(request.intake || '—').substring(0, 10), col5, yPos);
      doc.text(String(request.year_of_study || '—').substring(0, 7), col6, yPos);
      doc.text(String(request.accounts_status).substring(0, 8), col7, yPos);
      doc.text(String(request.examiner_status).substring(0, 8), col8, yPos);

      yPos += rowH;
    });

    doc.setFontSize(8);
    doc.setTextColor(150);
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 15, pageHeight - 10);
    }

    doc.save(`exam-list-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="pt-[72px] min-h-screen px-margin-mobile md:px-margin-desktop pb-12">
      <div className="fixed top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      <main className="max-w-container-max mx-auto py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div>
            <h1 className="text-display-lg font-display-lg text-on-surface tracking-tight">Examiner Dashboard</h1>
            <p className="text-body-lg text-on-surface-variant mt-2">Manage student clearance for final examinations.</p>
          </div>
          <button onClick={handleExport} className="flex items-center justify-center gap-2 px-6 py-3 bg-surface-container-high hover:bg-surface-container-highest border border-white/10 rounded-xl transition-all group">
            <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">download</span>
            <span className="text-label-md font-label-md">Export Exam List</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-3xl -mr-12 -mt-12 group-hover:bg-primary/20 transition-all"></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-label-md font-label-md text-on-surface-variant mb-1">Awaiting Review</p>
                <h3 className="text-headline-lg font-headline-lg text-on-surface">{awaiting}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">pending_actions</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-label-sm font-label-sm px-2 py-0.5 rounded bg-primary/10 text-primary">{awaiting} pending</span>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/10 blur-3xl -mr-12 -mt-12 group-hover:bg-secondary/20 transition-all"></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-label-md font-label-md text-on-surface-variant mb-1">Total Approved</p>
                <h3 className="text-headline-lg font-headline-lg text-on-surface">{approved}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary">verified</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-label-sm font-label-sm px-2 py-0.5 rounded bg-secondary/10 text-secondary">{approved} approved</span>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-error/10 blur-3xl -mr-12 -mt-12 group-hover:bg-error/20 transition-all"></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-label-md font-label-md text-on-surface-variant mb-1">Total Rejected</p>
                <h3 className="text-headline-lg font-headline-lg text-on-surface">{rejected}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-error/10 border border-error/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-error">cancel</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-label-sm font-label-sm px-2 py-0.5 rounded bg-error/10 text-error">{rejected} rejected</span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-headline-md font-headline-md text-on-surface">Queue: Ready for Examiner Review</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span className="text-label-md font-label-md text-on-surface-variant">Live Updates</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-6 py-4 text-left text-label-md font-bold text-on-surface uppercase tracking-wider">Student ID</th>
                  <th className="px-6 py-4 text-left text-label-md font-bold text-on-surface uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-label-md font-bold text-on-surface uppercase tracking-wider">Accounts</th>
                  <th className="px-6 py-4 text-left text-label-md font-bold text-on-surface uppercase tracking-wider">Examiner</th>
                  <th className="px-6 py-4 text-right text-label-md font-bold text-on-surface uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant">No requests awaiting your review.</td></tr>
                ) : (
                  filtered.map((request) => (
                    <tr className="hover:bg-white/10 transition-colors group" key={request.id}>
                      <td className="px-6 py-5">
                        <span className="font-mono text-primary-fixed">#{request.student_number || request.id}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-white/10 flex items-center justify-center text-label-sm">
                            {request.student_name?.split(' ').map(n => n[0]).slice(0, 2).join('') || '?'}
                          </div>
                          <span className="text-on-surface">{request.student_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-label-sm font-label-sm bg-secondary/10 text-secondary border border-secondary/20 status-glow-success">
                          <span className="w-1 h-1 rounded-full bg-secondary"></span>
                          Approved
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-label-sm font-label-sm border ${request.examiner_status === 'approved' ? 'bg-secondary/10 text-secondary border-secondary/20' : request.examiner_status === 'rejected' ? 'bg-error/10 text-error border-error/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                          {request.examiner_status === 'pending' ? 'Pending' : request.examiner_status.charAt(0).toUpperCase() + request.examiner_status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        {request.examiner_status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-error/10 text-error hover:bg-error/20 border border-error/20 transition-all" onClick={() => onAction(request.id, 'reject')} title="Reject">
                              <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                            <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 border border-secondary/20 transition-all" onClick={() => onAction(request.id, 'approve')} title="Approve">
                              <span className="material-symbols-outlined text-[20px]">check</span>
                            </button>
                          </div>
                        ) : (
                          <span className="px-4 py-1.5 rounded-lg bg-primary-container text-on-primary-container font-label-md inline-flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">done_all</span>
                            Done
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <div className="fixed bottom-8 right-8 z-50">
        <button className="w-14 h-14 rounded-full primary-gradient text-on-primary shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(192,193,255,0.3)]">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
        </button>
      </div>
    </div>
  );
}

export default ExaminerDashboard;
