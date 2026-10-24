import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { getInventory, getStock } from '../../api/inventory';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import { Truck, Package, ArrowRight, QrCode, PackageCheck, Boxes } from 'lucide-react';

export default function DistributorDashboard() {
  const { user } = useAuth();
  const { data: inventory, loading } = useApi(getInventory);
  const { data: stock } = useApi(getStock);

  const items = inventory || [];
  const inStock = items.filter((i) => i.status === 'IN_STOCK').length;
  const inTransit = items.filter((i) => i.status === 'IN_TRANSIT').length;
  const totalUnits = (stock || []).reduce((sum, row) => sum + Number(row.quantity || 0), 0);

  const actions = [
    { to: '/distributor/receive', label: 'Receive stock', desc: 'Take custody of packs in transit', icon: PackageCheck, color: 'text-emerald-400 bg-emerald-500/10' },
    { to: '/distributor/transfer', label: 'Transfer to pharmacy', desc: 'Dispatch packs on-chain', icon: Truck, color: 'text-purple-400 bg-purple-500/10' },
    { to: '/distributor/inventory', label: 'My inventory', desc: 'Everything this warehouse holds', icon: Boxes, color: 'text-sky-400 bg-sky-500/10' },
    { to: '/distributor/generate-qr', label: 'Generate QR codes', desc: 'Print pack-level verification labels', icon: QrCode, color: 'text-amber-400 bg-amber-500/10' },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">{user?.organizationName || 'Distributor'} dashboard</h2>
        <p className="text-sm text-slate-400 mt-1">
          Manage inbound stock, dispatch to pharmacies and keep the ledger honest.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Packs in stock', value: inStock, icon: Package, color: 'text-emerald-400' },
          { label: 'Packs in transit', value: inTransit, icon: Truck, color: 'text-amber-400' },
          { label: 'Stock units', value: totalUnits, icon: Boxes, color: 'text-sky-400' },
          { label: 'Serials tracked', value: loading ? '…' : items.length, icon: QrCode, color: 'text-purple-400' },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <Icon className={`w-5 h-5 ${card.color} mb-3`} />
              <p className="text-2xl font-extrabold text-white">{card.value}</p>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.to}
              to={action.to}
              className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-5 flex items-start gap-4 transition group"
            >
              <div className={`w-11 h-11 rounded-xl ${action.color} flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-white group-hover:text-emerald-300">{action.label}</p>
                <p className="text-xs text-slate-400 mt-1">{action.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 ml-auto text-slate-600 group-hover:text-emerald-400 shrink-0 mt-1" />
            </Link>
          );
        })}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Latest packs</h3>
        {loading ? (
          <p className="text-slate-500 text-sm">Loading inventory…</p>
        ) : items.length === 0 ? (
          <p className="text-slate-500 text-sm">No packs yet — create a batch first, then receive it.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Serial</th><th>Medicine</th><th>Batch</th><th>Status</th></tr>
              </thead>
              <tbody>
                {items.slice(0, 8).map((item) => (
                  <tr key={item.id}>
                    <td className="font-mono text-emerald-400">{item.serial_number}</td>
                    <td className="text-white">{item.medicine_name}</td>
                    <td className="font-mono">{item.batch_number}</td>
                    <td><StatusBadge status={item.status} /></td>
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
