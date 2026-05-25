import { jsPDF } from 'jspdf';

function statusPill(status) {
  let cls = 'badge badge-pending';
  if (status === 'approved') cls = 'badge badge-approved';
  else if (status === 'rejected') cls = 'badge badge-rejected';
  return <span className={cls}>{status}</span>;
}

function ExaminerDashboard({ requests, onAction }) {
  const filtered = requests.filter((request) => request.accounts_status === 'approved');
  const awaiting = filtered.filter(r => r.examiner_status !== 'approved' && r.examiner_status !== 'rejected').length;
  const approved = filtered.filter(r => r.examiner_status === 'approved').length;
  const rejected = filtered.filter(r => r.examiner_status === 'rejected').length;

  const handleExport = () => {
    if (filtered.length === 0) {
      alert('No approved requests to export');
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
    const col2 = col1 + 35;
    const col3 = col2 + 45;
    const col4 = col3 + 35;
    const col5 = col4 + 25;
    const col6 = col5 + 25;

    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('Student ID', col1, tableTop);
    doc.text('Name', col2, tableTop);
    doc.text('Programme', col3, tableTop);
    doc.text('Semester', col4, tableTop);
    doc.text('Accounts', col5, tableTop);
    doc.text('Examiner', col6, tableTop);

    doc.setDrawColor(200);
    doc.line(margin, tableTop + 2, pageWidth - margin, tableTop + 2);

    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    let yPos = tableTop + 8;
    const lineHeight = 6;
    const pageBreakThreshold = pageHeight - 20;

    filtered.forEach((request, index) => {
      if (yPos > pageBreakThreshold) {
        doc.addPage();
        yPos = margin + 10;
      }

      const studentId = String(request.student_number || request.id).substring(0, 15);
      const name = String(request.student_name).substring(0, 20);
      const programme = String(request.programme).substring(0, 15);
      const semester = String(request.semester).substring(0, 12);
      const accountsStatus = String(request.accounts_status).substring(0, 8);
      const examinerStatus = String(request.examiner_status).substring(0, 8);

      doc.text(studentId, col1, yPos);
      doc.text(name, col2, yPos);
      doc.text(programme, col3, yPos);
      doc.text(semester, col4, yPos);
      doc.text(accountsStatus, col5, yPos);
      doc.text(examinerStatus, col6, yPos);

      yPos += lineHeight;
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
    <div>
      <div className="card">
        <div className="dashboard-header">
          <div>
            <div className="card-title">Examiner</div>
            <div className="subtitle">Final approvals — Semester 1, 2025/2026</div>
          </div>
          <button className="button button-outline" onClick={handleExport}>
            ⬇ Export exam list
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Awaiting approval</div>
            <div className="stat-value">{awaiting}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Approved</div>
            <div className="stat-value stat-success">{approved}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Rejected</div>
            <div className="stat-value stat-error">{rejected}</div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p>No approved student requests available yet.</p>
        ) : (
          <div className="table">
            <div className="table-row table-row-5 table-header">
              <div>Student ID</div>
              <div>Name</div>
              <div>Accounts</div>
              <div>Status</div>
              <div>Action</div>
            </div>
            {filtered.map((request) => (
              <div className="table-row table-row-5" key={request.id}>
                <div>{request.student_number || request.id}</div>
                <div>{request.student_name}</div>
                <div>{statusPill(request.accounts_status)}</div>
                <div>{statusPill(request.examiner_status)}</div>
                <div className="button-group">
                  <button className="button button-success button-sm" onClick={() => onAction(request.id, 'approve')}>
                    Approve
                  </button>
                  <button className="button button-error button-sm" onClick={() => onAction(request.id, 'reject')}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ExaminerDashboard;
