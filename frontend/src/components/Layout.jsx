import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Boxes, LogOut, Menu, X, QrCode, Wifi } from 'lucide-react';

/**
 * App shell: dark sidebar with role navigation + main content area.
 * Receives `title` and `navLinks` from the route definition in main.jsx.
 */
export default function Layout({ title, navLinks = [], children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const roleLabel = {
    ADMIN: 'System Administrator',
    DISTRIBUTOR: 'Distributor',
    PHARMACY: 'Pharmacy',
  }[user?.role] || user?.role;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex">
      {/* Sidebar */}
      <aside
        className={`${
          open ? 'translate-x-0' : '-translate-x-full'
        } fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200`}
      >
        <div className="px-5 py-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Boxes className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="font-bold text-white leading-tight">PharmaChain</p>
            <p className="text-[11px] text-slate-500">CDSCO Compliant Ledger</p>
          </div>
          <button className="ml-auto lg:hidden btn-close" onClick={() => setOpen(false)} aria-label="Close menu">
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/admin' || link.path === '/distributor' || link.path === '/pharmacy'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
                  }`
                }
              >
                {Icon ? <Icon className="w-4 h-4 shrink-0" /> : null}
                <span className="truncate">{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-4 space-y-3">
          <Link
            to="/verify/"
            onClick={(e) => {
              e.preventDefault();
              const serial = window.prompt('Enter serial number to verify');
              if (serial) navigate(`/verify/${serial.trim()}`);
            }}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-emerald-400 transition"
          >
            <QrCode className="w-3.5 h-3.5" /> Verify a serial number
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400">
              {(user?.name || '?').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-white font-semibold truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-500 truncate">
                {roleLabel}
                {user?.organizationName ? ` · ${user.organizationName}` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/40 rounded-lg py-2 transition"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-4 lg:px-6 py-3 flex items-center gap-3">
          <button className="lg:hidden btn-close" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="w-4 h-4" />
          </button>
          <h1 className="text-base lg:text-lg font-bold text-white truncate">{title}</h1>
          <div className="ml-auto flex items-center gap-3 text-[11px] text-slate-500">
            <span className="hidden sm:flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-emerald-500" /> API online
            </span>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
