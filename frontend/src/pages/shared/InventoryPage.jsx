import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { getInventory } from '../../api/inventory';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import { Boxes, Search, QrCode, Package } from 'lucide-react';

export default function InventoryPage() {
  const { user } = useAuth();
  const { data: inventory, loading, error } = useApi(getInventory);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const rows = (inventory || []).filter((item) => {
    const haystack = `${item.serial_number} ${item.batch_number} ${item.medicine_name}`.toLowerCase();
    if (search && !haystack.includes(search.toLowerCase())) return false;
    if (status && item.status !== status) return false;
    return true;
  });

  const statuses = [...new Set((inventory || []).map((i) => i.status))];

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Boxes className="w-5 h-5 text-emerald-400" /> Inventory
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {user?.organizationName ? `Packs held by ${user.organizationName}` : 'All packs in the network'}
          </p>
        </div>
        <div className="text-xs text-slate-500 font-mono">{rows.length} packs</div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search serial, batch or medicine…"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-emerald-500 outline-none"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm">
          {error.message}
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500 text-sm">Loading inventory…</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center">
            <Package className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No packs match this filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Serial</th>
                  <th>Medicine</th>
                  <th>Batch</th>
                  <th>Expiry</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>QR</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id}>
                    <td className="font-mono text-emerald-400">{item.serial_number}</td>
                    <td className="text-white">
                      {item.medicine_name}
                      <span className="block text-[11px] text-slate-500 font-mono">{item.medicine_code}</span>
                    </td>
                    <td className="font-mono">{item.batch_number}</td>
                    <td>{item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="text-slate-400">{item.owner_name || '—'}</td>
                    <td><StatusBadge status={item.status} /></td>
                    <td>
                      <Link
                        to={`/verify/${item.serial_number}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-emerald-400"
                      >
                        <QrCode className="w-3.5 h-3.5" /> Verify
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
