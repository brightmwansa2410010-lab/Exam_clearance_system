function AccountsDashboard({ requests, onAction }) {
  const pending = requests.filter(r => r.accounts_status === 'pending').length;

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

  return (
    <div>
      <div className="card">
        <div className="dashboard-header">
          <div>
            <div className="card-title">Accounts officer</div>
            <div className="subtitle">Clearance requests</div>
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
                <div>
                  {request.student_name}
                  {request.passport_photo_url && (
                    <span style={{ marginLeft: 8 }}>
                      <a href={`${apiUrl}${request.passport_photo_url}`} target="_blank" rel="noopener noreferrer" style={{ color: '#7aa2ff', fontSize: '0.75rem', textDecoration: 'none' }}>
                        [photo]
                      </a>
                      <a href={`${apiUrl}${request.nrc_front_url}`} target="_blank" rel="noopener noreferrer" style={{ color: '#7aa2ff', fontSize: '0.75rem', textDecoration: 'none', marginLeft: 4 }}>
                        [nrc]
                      </a>
                    </span>
                  )}
                </div>
                <div>{request.programme}</div>
                <div>
                  <span className={`badge badge-${request.accounts_status}`}>{request.accounts_status}</span>
                </div>
                <div className="button-group">
                  {request.accounts_status === 'pending' ? (
                    <>
                      <button className="button button-success button-sm" onClick={() => onAction(request.id, 'approve')}>
                        Approve
                      </button>
                      <button className="button button-error button-sm" onClick={() => onAction(request.id, 'reject')}>
                        Reject
                      </button>
                    </>
                  ) : (
                    <span style={{ color: '#777', fontSize: '0.85rem' }}>Done</span>
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

export default AccountsDashboard;
