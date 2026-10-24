import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

const HOME_FOR_ROLE = {
  ADMIN: '/admin',
  DISTRIBUTOR: '/distributor',
  PHARMACY: '/pharmacy',
};

/**
 * Guards nested routes: requires a session and (optionally) one of the roles
 * passed in `allowedRoles`.
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
        <div className="inline-block w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-mono">Restoring session…</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={HOME_FOR_ROLE[user.role] || '/login'} replace />;
  }

  return children || <Outlet />;
}

export function Forbidden() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-center px-6">
      <ShieldCheck className="w-12 h-12 text-amber-400" />
      <h1 className="text-xl font-bold text-white">Access denied</h1>
      <p className="text-slate-400 text-sm">Your role does not have permission to open this page.</p>
    </div>
  );
}
