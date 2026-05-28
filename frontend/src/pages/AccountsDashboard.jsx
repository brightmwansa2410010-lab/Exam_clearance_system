function AccountsDashboard({ requests, onAction, user }) {
  const pending = requests.filter(r => r.accounts_status === 'pending');

  return (
    <div className="pt-[72px] pb-12 min-h-screen">
      <div className="fixed top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
          <div>
            <h1 className="text-headline-lg text-headline-lg text-on-surface flex items-center gap-4">
              Accounts Officer
              <span className="px-3 py-1 rounded-full bg-tertiary-container/20 text-tertiary text-label-md font-bold border border-tertiary/30 animate-pulse">
                {pending.length} Pending Requests
              </span>
            </h1>
            <p className="text-body-md text-on-surface-variant mt-2">Manage student financial clearances and tuition verification.</p>
          </div>
          <div className="flex gap-3">
            <div className="glass-card px-4 py-3 rounded-xl flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">verified</span>
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold">Processed Today</p>
                <p className="text-headline-sm font-headline-sm text-on-surface">{requests.filter(r => r.accounts_status !== 'pending').length}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl border-l-4 border-l-primary flex justify-between items-center group hover:bg-white/10 transition-all cursor-pointer">
            <div>
              <p className="text-label-md text-on-surface-variant mb-1">Total Requests</p>
              <h3 className="text-headline-md font-headline-md text-on-surface">{requests.length}</h3>
            </div>
            <span className="material-symbols-outlined text-primary-fixed text-4xl opacity-50 group-hover:opacity-100 transition-opacity">fact_check</span>
          </div>
          <div className="glass-card p-6 rounded-2xl border-l-4 border-l-tertiary flex justify-between items-center group hover:bg-white/10 transition-all cursor-pointer">
            <div>
              <p className="text-label-md text-on-surface-variant mb-1">Pending</p>
              <h3 className="text-headline-md font-headline-md text-on-surface">{pending.length}</h3>
            </div>
            <span className="material-symbols-outlined text-tertiary text-4xl opacity-50 group-hover:opacity-100 transition-opacity">error</span>
          </div>
          <div className="glass-card p-6 rounded-2xl border-l-4 border-l-secondary flex justify-between items-center group hover:bg-white/10 transition-all cursor-pointer">
            <div>
              <p className="text-label-md text-on-surface-variant mb-1">Approved</p>
              <h3 className="text-headline-md font-headline-md text-on-surface">{requests.filter(r => r.accounts_status === 'approved').length}</h3>
            </div>
            <span className="material-symbols-outlined text-secondary text-4xl opacity-50 group-hover:opacity-100 transition-opacity">history</span>
          </div>
        </div>

        <section className="glass-card rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-headline-md font-headline-md text-on-surface">Clearance Requests</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Student ID</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Name</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Programme</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {requests.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant">No student requests available.</td></tr>
                ) : (
                  requests.map((request) => (
                    <tr className="hover:bg-white/[0.03] transition-colors group" key={request.id}>
                      <td className="px-6 py-5 text-body-md font-medium text-primary">{request.student_number || '—'}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                            {request.student_name?.split(' ').map(n => n[0]).slice(0, 2).join('') || '?'}
                          </div>
                          <span className="text-on-surface font-medium">{request.student_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-on-surface-variant">{request.programme}</td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${request.accounts_status === 'pending' ? 'bg-tertiary-container/10 text-tertiary border-tertiary/20' : request.accounts_status === 'approved' ? 'bg-primary-container/10 text-primary border-primary/20' : 'bg-error/10 text-error border-error/20'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${request.accounts_status === 'pending' ? 'bg-tertiary animate-pulse' : request.accounts_status === 'approved' ? 'bg-primary' : 'bg-error'}`}></span>
                          {request.accounts_status.charAt(0).toUpperCase() + request.accounts_status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        {request.accounts_status === 'pending' ? (
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="h-9 px-4 rounded-lg bg-primary text-on-primary text-label-md font-bold hover:brightness-110 active:scale-95 transition-all" onClick={() => onAction(request.id, 'approve')}>Approve</button>
                            <button className="h-9 px-4 rounded-lg bg-error-container/20 text-error text-label-md font-bold border border-error/20 hover:bg-error-container/40 transition-all" onClick={() => onAction(request.id, 'reject')}>Reject</button>
                          </div>
                        ) : (
                          <span className="text-on-surface-variant text-label-md flex items-center justify-end gap-2">
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
        </section>
      </main>
    </div>
  );
}

export default AccountsDashboard;
