import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { getAllCDSCOData, getCDSCOStats, syncCDSCOData } from '../../api/cdsco';
import StatusBadge from '../../components/StatusBadge';
import { Shield, RefreshCw, Download, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';

export default function CDSCOManager() {
  const { data: cdscoData, execute: refreshData } = useApi(getAllCDSCOData);
  const { data: stats, execute: refreshStats } = useApi(getCDSCOStats);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  useEffect(() => {
    refreshData();
    refreshStats();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const result = await syncCDSCOData();
      setSyncResult(result);
      refreshData();
      refreshStats();
    } catch (err) {
      setSyncResult({ error: err.response?.data?.error?.message || 'Sync failed' });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" /> CDSCO Regulatory Data
        </h2>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync CDSCO Data'}
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{stats.total_records}</div>
            <div className="text-xs text-slate-400">Total Records</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-red-400">{stats.prohibited_count}</div>
            <div className="text-xs text-slate-400">Prohibited FDCs</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-orange-400">{stats.recalled_count}</div>
            <div className="text-xs text-slate-400">NSQ/Recalled</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-400">{stats.permitted_count}</div>
            <div className="text-xs text-slate-400">Permitted</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-400">{stats.batch_level}</div>
            <div className="text-xs text-slate-400">Batch-Specific</div>
          </div>
        </div>
      )}

      {/* Sync Result */}
      {syncResult && (
        <div className={`p-4 rounded-lg border ${syncResult.error ? 'bg-red-500/10 border-red-500/20' : 'bg-green-500/10 border-green-500/20'}`}>
          {syncResult.error ? (
            <div className="text-red-400 text-sm">
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              {syncResult.error}
            </div>
          ) : (
            <div className="text-green-400 text-sm">
              <CheckCircle className="w-4 h-4 inline mr-2" />
              Sync completed! FDC 2026: {syncResult.bannedFDCs?.synced || 0} synced, {syncResult.bannedFDCs?.skipped || 0} skipped. 
              FDC 2024: {syncResult.bannedFDCs2024?.synced || 0} synced, {syncResult.bannedFDCs2024?.skipped || 0} skipped.
              NSQ: {syncResult.nsqDrugs?.synced || 0} synced, {syncResult.nsqDrugs?.skipped || 0} skipped.
            </div>
          )}
        </div>
      )}

      {/* Data Sources */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-300 mb-4">Official CDSCO Data Sources</h3>
        <div className="space-y-3">
          <a
            href="https://cdsco.gov.in/opencms/opencms/en/Drugs/FDC/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-750 rounded-lg transition"
          >
            <ExternalLink className="w-4 h-4 text-blue-400" />
            <div>
              <div className="text-sm text-white">CDSCO Fixed Dose Combinations</div>
              <div className="text-xs text-slate-400">Official list of banned, prohibited, and restricted FDCs</div>
            </div>
          </a>
          <a
            href="https://cdsco.gov.in/opencms/opencms/en/Notifications/nsq-drugs/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-750 rounded-lg transition"
          >
            <ExternalLink className="w-4 h-4 text-orange-400" />
            <div>
              <div className="text-sm text-white">CDSCO NSQ Alerts</div>
              <div className="text-xs text-slate-400">Not of Standard Quality drug alerts from CDL/CDTL labs</div>
            </div>
          </a>
          <a
            href="https://cdsco.gov.in/opencms/opencms/en/Notifications/Gazette-Notifications/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-750 rounded-lg transition"
          >
            <ExternalLink className="w-4 h-4 text-purple-400" />
            <div>
              <div className="text-sm text-white">CDSCO Gazette Notifications</div>
              <div className="text-xs text-slate-400">Official gazette notifications under Section 26A, D&C Act, 1940</div>
            </div>
          </a>
        </div>
      </div>

      {/* Regulatory Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-300">Real CDSCO Regulatory Records</h3>
          <p className="text-xs text-slate-500 mt-1">Data sourced from official CDSCO publications under the Drugs and Cosmetics Act, 1940</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">Medicine</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Notification</th>
                <th className="px-4 py-3 font-medium">Effective Date</th>
                <th className="px-4 py-3 font-medium">Reason</th>
                <th className="px-4 py-3 font-medium">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {cdscoData?.map((record) => (
                <tr key={record.id} className="hover:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <div className="text-white text-sm">{record.medicine_name}</div>
                    <div className="text-xs text-slate-500">{record.medicine_code}</div>
                    {record.batch_number && (
                      <div className="text-xs text-slate-500">Batch: {record.batch_number}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={record.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs text-blue-400">{record.reference_number}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {new Date(record.effective_date).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-xs max-w-xs truncate" title={record.reason}>
                    {record.reason}
                  </td>
                  <td className="px-4 py-3">
                    {record.source && (
                      <a
                        href={record.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-xs"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
              {!cdscoData?.length && (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                    No CDSCO data synced yet. Click "Sync CDSCO Data" to import real regulatory records.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
