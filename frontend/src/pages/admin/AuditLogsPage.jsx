import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { getAuditLogs, getAuditStats } from '../../api/audit';
import { printHTML, reportHeader, reportFooter, statusBadge, downloadCSV } from '../../utils/printUtils';

const ACTION_TYPES = [
  { value: '', label: 'All Actions' },
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'dispense', label: 'Dispense' },
  { value: 'prescribe', label: 'Prescribe' },
  { value: 'login', label: 'Login' },
  { value: 'export', label: 'Export' },
];

const MODULE_TYPES = [
  { value: '', label: 'All Modules' },
  { value: 'medicine', label: 'Medicine' },
  { value: 'prescription', label: 'Prescription' },
  { value: 'patient', label: 'Patient' },
  { value: 'billing', label: 'Billing' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'user', label: 'User/Auth' },
];

const SEVERITY_MAP = {
  info: { color: '#3b82f6', label: 'INFO' },
  warning: { color: '#f59e0b', label: 'WARNING' },
  error: { color: '#ef4444', label: 'ERROR' },
  critical: { color: '#7c3aed', label: 'CRITICAL' },
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [filters, setFilters] = useState({ action: '', module: '', user_id: '', severity: '', from_date: '', to_date: '' });
  const [loading, setLoading] = useState(false);

  async function loadLogs(page = pagination.page, currentFilters = filters) {
    setLoading(true);
    try {
      const params = { page, limit: 25, ...Object.fromEntries(Object.entries(currentFilters).filter(([, v]) => v)) };
      const res = await getAuditLogs(params);
      setLogs(res?.logs || res || []);
      setPagination({ page, total: res?.total || 0, pages: res?.pages || 0 });
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadLogs(pagination.page, filters); }, []);

  function updateFilter(key, val) {
    const newFilters = { ...filters, [key]: val };
    setFilters(newFilters);
    loadLogs(1, newFilters);
  }

  return (
    <div className="page-container">
      <h1>📝 Audit Trail</h1>
      <p className="text-muted">Complete audit log of all system transactions for CDSCO regulatory compliance.</p>

      {/* Filters */}
      <div className="filter-bar mt-4">
        <select value={filters.action} onChange={e => updateFilter('action', e.target.value)}>
          {ACTION_TYPES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
        </select>
        <select value={filters.module} onChange={e => updateFilter('module', e.target.value)}>
          {MODULE_TYPES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <select value={filters.severity} onChange={e => updateFilter('severity', e.target.value)}>
          <option value="">All Severity</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
          <option value="critical">Critical</option>
        </select>
        <input type="text" placeholder="User ID" value={filters.user_id} onChange={e => updateFilter('user_id', e.target.value)} />
        <input type="date" value={filters.from_date} onChange={e => updateFilter('from_date', e.target.value)} />
        <input type="date" value={filters.to_date} onChange={e => updateFilter('to_date', e.target.value)} />
      </div>

      {/* Summary Stats */}
      <div className="stats-row mt-4">
        <div className="stat-card">
          <div className="stat-value">{pagination.total}</div>
          <div className="stat-label">Total Log Entries</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{logs.filter(l => l.severity === 'warning' || l.severity === 'error' || l.severity === 'critical').length}</div>
          <div className="stat-label">Warnings/Errors (page)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{logs.filter(l => l.action === 'login').length}</div>
          <div className="stat-label">Login Events (page)</div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="table-container mt-4">
        {loading ? (
          <p className="text-center p-4">Loading audit logs...</p>
        ) : logs.length === 0 ? (
          <p className="text-center p-4 text-muted">No audit log entries found.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Module</th>
                <th>Action</th>
                <th>Severity</th>
                <th>Record ID</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => {
                const sev = SEVERITY_MAP[log.severity] || SEVERITY_MAP.info;
                return (
                  <tr key={log.id}>
                    <td className="font-mono text-sm">{new Date(log.created_at).toLocaleString('en-IN')}</td>
                    <td>{log.user_id}</td>
                    <td><span className="badge">{log.module}</span></td>
                    <td>{log.action}</td>
                    <td>
                      <span style={{ color: sev.color, fontWeight: 600 }}>{sev.label}</span>
                    </td>
                    <td className="font-mono text-sm">{log.record_id || '-'}</td>
                    <td className="text-sm">{log.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination mt-4">
          <button disabled={pagination.page <= 1} onClick={() => { const p = pagination.page - 1; setPagination(prev => ({ ...prev, page: p })); loadLogs(p); }}>← Previous</button>
          <span>Page {pagination.page} of {pagination.pages} ({pagination.total} entries)</span>
          <button disabled={pagination.page >= pagination.pages} onClick={() => { const p = pagination.page + 1; setPagination(prev => ({ ...prev, page: p })); loadLogs(p); }}>Next →</button>
        </div>
      )}

      {/* Export Options */}
      <div className="mt-4 flex gap-2">
        <button onClick={() => {
          downloadCSV('audit-logs.csv', ['Timestamp', 'User', 'Module', 'Action', 'Severity', 'Record ID', 'Description'],
            logs.map(l => [new Date(l.created_at).toLocaleString('en-IN'), l.user_id, l.module, l.action, l.severity, l.record_id || '', l.description || ''])
          );
        }} className="btn-secondary">📥 Export CSV</button>
        <button onClick={() => {
          const rows = logs.map(l => `<tr><td class="mono">${new Date(l.created_at).toLocaleString('en-IN')}</td><td>${l.user_id}</td><td>${statusBadge(l.module)}</td><td>${l.action}</td><td>${statusBadge(l.severity)}</td><td class="mono">${l.record_id || '—'}</td><td>${l.description || '—'}</td></tr>`).join('');
          const html = `
            ${reportHeader('Audit Trail Log', `Filter: ${filters.action || 'All'} actions | ${filters.module || 'All'} modules | ${filters.severity || 'All'} severity`)}
            <p style="font-size:12px;color:#6b7280;margin-bottom:12px">Showing page ${pagination.page} of ${pagination.pages} — Total: ${pagination.total} entries</p>
            <table>
              <thead><tr><th>Timestamp</th><th>User</th><th>Module</th><th>Action</th><th>Severity</th><th>Record ID</th><th>Description</th></tr></thead>
              <tbody>${rows || '<tr><td colspan="7" style="text-align:center">No audit entries.</td></tr>'}</tbody>
            </table>
            ${reportFooter()}`;
          printHTML(html, 'Audit Trail — PharmaChain');
        }} className="btn-secondary">🖨️ Print Audit Log</button>
      </div>
    </div>
  );
}
