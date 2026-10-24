import React from 'react';

/** Colour map for every status the API returns. */
const STYLES = {
  // healthy
  ACTIVE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  IN_STOCK: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  PERMITTED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  VERIFIED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  PAID: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  CONFIRMED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  ISSUED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  RESOLVED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  SAFE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',

  // in motion / pending
  IN_TRANSIT: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  PENDING: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  DRAFT: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  RESTRICTED: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  PARTIALLY_PAID: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  OPEN: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  ACKNOWLEDGED: 'bg-sky-500/15 text-sky-400 border-sky-500/30',

  // informational
  DISPENSED: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  FLAGGED_SUSPICIOUS: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  UNKNOWN: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  SKIPPED: 'bg-slate-500/15 text-slate-400 border-slate-500/30',

  // blocked
  BLOCKED: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  RECALLED: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  PROHIBITED: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  EXPIRED: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  VOID: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  FAILED: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
};

export default function StatusBadge({ status, className = '' }) {
  const key = (status || 'UNKNOWN').toString().toUpperCase();
  const style = STYLES[key] || 'bg-slate-500/15 text-slate-400 border-slate-500/30';

  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {(status || 'UNKNOWN').toString().replace(/_/g, ' ')}
    </span>
  );
}
