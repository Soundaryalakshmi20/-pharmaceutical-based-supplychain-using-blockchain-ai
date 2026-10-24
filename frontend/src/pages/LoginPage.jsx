import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Boxes, Lock, Mail, AlertTriangle, Loader2, ShieldCheck } from 'lucide-react';

const HOME_FOR_ROLE = {
  ADMIN: '/admin',
  DISTRIBUTOR: '/distributor',
  PHARMACY: '/pharmacy',
};

const DEMO = [
  { label: 'Administrator', email: 'admin@pharmachain.test', password: 'Admin@123' },
  { label: 'Distributor', email: 'ops@medicore.test', password: 'Dist@123' },
  { label: 'Pharmacy', email: 'pharmacist@apollocity.test', password: 'Pharm@123' },
];

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to={HOME_FOR_ROLE[user.role] || '/admin'} replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const logged = await login(form.email.trim(), form.password);
      navigate(HOME_FOR_ROLE[logged.role] || '/admin', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  function fillDemo(account) {
    setForm({ email: account.email, password: account.password });
    setError('');
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 items-center justify-center mb-4">
            <Boxes className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">PharmaChain</h1>
          <p className="text-slate-400 text-sm mt-2">
            Blockchain-verified pharmaceutical supply chain
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-sm">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Email address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                autoComplete="username"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-slate-600 focus:border-emerald-500 outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-slate-600 focus:border-emerald-500 outline-none text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            {busy ? 'Signing in…' : 'Sign in securely'}
          </button>

          <p className="text-[11px] text-slate-500 text-center">
            Sessions are signed with JWT and expire after 12 hours.
          </p>
        </form>

        <div className="mt-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Demo accounts (click to fill)
          </p>
          <div className="space-y-2">
            {DEMO.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => fillDemo(account)}
                className="w-full flex items-center justify-between gap-3 bg-slate-950 border border-slate-800 hover:border-emerald-500/40 rounded-lg px-3 py-2.5 text-left transition group"
              >
                <span>
                  <span className="block text-xs font-bold text-white">{account.label}</span>
                  <span className="block text-[11px] text-slate-500 font-mono">{account.email}</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500 group-hover:text-emerald-400">
                  {account.password}
                </span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-600 mt-3 leading-relaxed">
            Passwords are stored as bcrypt hashes in Postgres. Run
            <span className="font-mono text-slate-500"> npm run seed:auth </span>
            in <span className="font-mono text-slate-500">backend/</span> to re-seed them.
          </p>
        </div>

        <p className="text-center text-[11px] text-slate-600 mt-6">
          Patient? Scan the QR code on the pack — no login required.
        </p>
      </div>
    </div>
  );
}
