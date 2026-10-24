import React from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { getDashboardStats } from '../../api/system';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import {
  Package, Boxes, AlertTriangle, Users, FileText, Receipt, Activity,
  ArrowRight, Database, ShieldCheck, TrendingUp,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: stats, loading, error } = useApi(getDashboardStats);

  const cards = [
    { label: 'Medicines', value: stats?.total_medicines ?? '—', icon: Package, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Active Batches', value: stats?.active_batches ?? '—', icon: Boxes, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { label: 'Units In Stock', value: stats?.in_stock ?? '—', icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'In Transit', value: stats?.in_transit ?? '—', icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Dispensed', value: stats?.dispensed ?? '—', icon: Receipt, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Open Alerts', value: stats?.openAlerts ?? stats?.open_alerts ?? '—', icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { label: 'Patients', value: stats?.total_patients ?? '—', icon: Users, color: 'text-teal-400', bg: 'bg-teal-500/10' },
    { label: 'Pending Prescriptions', value: stats?.pending_prescriptions ?? '—', icon: FileText, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  ];

  const quickLinks = [
    { to: '/admin/medicines', label: 'Medicine catalog', icon: Package },
    { to: '/admin/batches', label: 'Create batch + serials', icon: Boxes },
    { to: '/admin/regulatory', label: 'CDSCO rulings', icon: ShieldCheck },
    { to: '/admin/blockchain', label: 'Blockchain audit trail', icon: Database },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Welcome back, {user?.name?.split(' ')[0]}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {user?.organizationName
              ? `Signed in for ${user.organizationName}`
              : 'Full oversight of the pharmaceutical supply chain'}
          </p>
        </div>
        <Link
          to="/admin/blockchain"
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 rounded-lg hover:bg-emerald-500/20 transition"
        >
          <Database className="w-3.5 h-3.5" /> Inspect ledger <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-sm">
          Could not load dashboard stats: {error.message}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-4.5 h-4.5 ${card.color}`} />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-white">
                {loading ? '…' : card.value}
              </p>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Recent ledger activity
            </h3>
            <Link to="/admin/blockchain" className="text-xs text-emerald-400 hover:text-emerald-300">
              View all
            </Link>
          </div>

          {loading ? (
            <p className="text-slate-500 text-sm">Loading…</p>
          ) : (stats?.recentTransactions || []).length === 0 ? (
            <p className="text-slate-500 text-sm">No transactions yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 border-b border-slate-800 pb-3 last:border-0 last:pb-0">
                  <StatusBadge status={tx.transaction_type} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white truncate">
                      {tx.medicine_name} <span className="text-slate-500">· batch {tx.batch_number}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {tx.from_name || 'Manufacturer'} → {tx.to_name || 'Patient'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] text-slate-400 font-mono">
                      {tx.blockchain_transaction_hash
                        ? `${tx.blockchain_transaction_hash.slice(0, 12)}…`
                        : 'off-chain'}
                    </p>
                    <p className="text-[10px] text-slate-600">
                      {new Date(tx.timestamp).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
            Quick actions
          </h3>
          <div className="space-y-2">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-3 bg-slate-950 border border-slate-800 hover:border-emerald-500/40 rounded-lg px-3 py-3 transition group"
                >
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" />
                  <span className="text-sm text-slate-300 group-hover:text-white">{link.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto text-slate-600 group-hover:text-emerald-400" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
