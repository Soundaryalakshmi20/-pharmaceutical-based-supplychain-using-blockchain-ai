import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { getAlerts, getAlertSummary, updateAlertStatus } from '../../api/alerts';
import StatusBadge from '../../components/StatusBadge';
import { Bell, Check, CheckCheck, RefreshCw } from 'lucide-react';

const SEVERITY = {
  LOW: 'text-slate-300 bg-slate-500/10 border-slate-500/30',
  MEDIUM: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  HIGH: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  CRITICAL: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
};

export default function AlertsPage() {
  const { data: alerts, loading, execute: refresh } = useApi(() => getAlerts());
  const { data: summary, execute: refreshSummary } = useApi(getAlertSummary);
  const [filter, setFilter] = useState('OPEN');
  const [busy, setBusy] = useState(false);

  const rows = (alerts || []).filter((a) => (filter ? a.status === filter : true));

  async function setStatus(id, status) {
    setBusy(true);
    try {
      await updateAlertStatus(id, status);
      refresh();
      refreshSummary();
    } catch (err) {
      window.alert(err.response?.data?.error?.message || err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" /> System Alerts
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Recalls, regulatory blocks, expiring stock and custody anomalies.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
          >
            <option value="OPEN">Open</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="RESOLVED">Resolved</option>
            <option value="">All</option>
          </select>
          <button
            onClick={() => { refresh(); refreshSummary(); }}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-2xl font-extrabold text-white">{summary?.open ?? '—'}</p>
          <p className="text-[11px] text-slate-500 uppercase tracking-wider mt-1">Open alerts</p>
        </div>
        {(summary?.bySeverity || []).map((row) => (
          <div key={row.severity} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-2xl font-extrabold text-white">{row.count}</p>
            <p className="text-[11px] text-slate-500 uppercase tracking-wider mt-1">{row.severity}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="p-10 text-center text-slate-500 text-sm">Loading alerts…</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-500 text-sm">
            No alerts in this view.
          </div>
        ) : (
          rows.map((alert) => (
            <div key={alert.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-start gap-4">
              <span className={`badge border ${SEVERITY[alert.severity] || SEVERITY.MEDIUM}`}>{alert.severity}</span>
              <div className="flex-1 min-w-[240px]">
                <p className="text-sm text-white">{alert.message}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {alert.type} · {alert.medicine_name || 'network'}{' '}
                  {alert.batch_number ? `· batch ${alert.batch_number}` : ''} ·{' '}
                  {new Date(alert.created_at).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={alert.status} />
                {alert.status === 'OPEN' && (
                  <button
                    disabled={busy}
                    onClick={() => setStatus(alert.id, 'ACKNOWLEDGED')}
                    className="flex items-center gap-1.5 text-[11px] text-slate-300 border border-slate-700 rounded px-2 py-1 hover:border-sky-500/50 hover:text-sky-300 transition"
                  >
                    <Check className="w-3 h-3" /> Ack
                  </button>
                )}
                {alert.status !== 'RESOLVED' && (
                  <button
                    disabled={busy}
                    onClick={() => setStatus(alert.id, 'RESOLVED')}
                    className="flex items-center gap-1.5 text-[11px] text-emerald-300 border border-emerald-500/30 rounded px-2 py-1 hover:bg-emerald-500/10 transition"
                  >
                    <CheckCheck className="w-3 h-3" /> Resolve
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
