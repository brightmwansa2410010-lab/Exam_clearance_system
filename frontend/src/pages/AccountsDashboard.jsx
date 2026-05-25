function statusPill(status) {
  let cls = 'badge badge-pending';
  if (status === 'approved') cls = 'badge badge-approved';
  else if (status === 'rejected') cls = 'badge badge-rejected';
  return <span className={cls}>{status}</span>;
}

function AccountsDashboard({ requests, onAction }) {
  const pending = requests.filter(r => r.accounts_status !== 'approved' && r.accounts_status !== 'rejected').length;

  return (
    <div>
      <div className="card">
        <div className="dashboard-header">
          <div>
            <div className="card-title">Accounts officer</div>
            <div className="subtitle">Clearance requests — Semester 1, 2025/2026</div>
          </div>
          <div className="badge badge-pending">{pending} pending</div>
        </div>
        
        {requests.length === 0 ? (
          <p>No student requests available.</p>
        ) : (
          <div className="table">
            <div className="table-row table-row-5 table-header">
              <div>Student ID</div>
              <div>Name</div>
              <div>Programme</div>
              <div>Status</div>
              <div>Action</div>
            </div>
            {requests.map((request) => (
              <div className="table-row table-row-5" key={request.id}>
                <div>{request.student_number || '-'}</div>
                <div>{request.student_name}</div>
                <div>{request.programme}</div>
                <div>{statusPill(request.accounts_status)}</div>
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

export default AccountsDashboard;
