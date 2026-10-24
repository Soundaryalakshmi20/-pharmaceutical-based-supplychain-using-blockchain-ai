import { useState, useEffect } from 'react';
import { useOffline } from '../context/OfflineContext';
import { Wifi, WifiOff, RefreshCw, Clock, CheckCircle, AlertTriangle, X } from 'lucide-react';

/**
 * OfflineIndicator
 * 
 * Fixed-position banner that shows connectivity status, pending sync count,
 * and allows manual sync. Collapses to a dot when online with no issues.
 */
export default function OfflineIndicator() {
  const { isOnline, syncStatus, pendingOps, lastSyncTime, triggerSync } = useOffline();
  const [expanded, setExpanded] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  // Auto-expand when offline
  useEffect(() => {
    if (!isOnline) setExpanded(true);
  }, [isOnline]);

  // Show briefly on sync events
  useEffect(() => {
    if (syncStatus === 'synced' || syncStatus === 'error') {
      setShowBanner(true);
      const timer = setTimeout(() => {
        if (isOnline) setShowBanner(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [syncStatus, isOnline]);

  // Don't render if online with no issues and banner dismissed
  if (isOnline && !expanded && !showBanner && syncStatus !== 'syncing') {
    return (
      <button
        onClick={() => { setShowBanner(true); setExpanded(true); }}
        className="offline-indicator-dot"
        title="Network status: Online"
        style={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: '#22c55e',
          border: '2px solid #16a34a',
          cursor: 'pointer',
          zIndex: 9999,
          transition: 'all 0.2s',
        }}
      />
    );
  }

  const getStatusColor = () => {
    if (!isOnline) return { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b', dot: '#ef4444' };
    if (syncStatus === 'syncing') return { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af', dot: '#3b82f6' };
    if (syncStatus === 'synced') return { bg: '#f0fdf4', border: '#86efac', text: '#166534', dot: '#22c55e' };
    if (syncStatus === 'error') return { bg: '#fffbeb', border: '#fde68a', text: '#92400e', dot: '#f59e0b' };
    return { bg: '#f0fdf4', border: '#86efac', text: '#166534', dot: '#22c55e' };
  };

  const colors = getStatusColor();

  return (
    <div style={{
      position: 'fixed',
      bottom: 16,
      right: 16,
      zIndex: 9999,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Collapsed state — just the status dot */}
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: colors.bg,
            border: `2px solid ${colors.border}`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.2s',
          }}
          title={isOnline ? 'Online' : 'Offline'}
        >
          {isOnline ? (
            <Wifi size={16} color="#22c55e" />
          ) : (
            <WifiOff size={16} color="#ef4444" />
          )}
        </button>
      )}

      {/* Expanded state */}
      {expanded && (
        <div style={{
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          borderRadius: 12,
          padding: '12px 16px',
          minWidth: 280,
          maxWidth: 340,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          transition: 'all 0.3s ease',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: colors.dot,
                animation: !isOnline ? 'pulse-offline 2s infinite' : 'none',
                display: 'inline-block',
              }} />
              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: colors.text }}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <button
              onClick={() => setExpanded(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 2,
                color: colors.text,
                opacity: 0.6,
              }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Status details */}
          <div style={{ fontSize: '0.8rem', color: colors.text, lineHeight: 1.5 }}>
            {!isOnline && (
              <p style={{ marginBottom: 4 }}>
                📡 Working offline. Changes will sync when reconnected.
              </p>
            )}
            
            {syncStatus === 'syncing' && (
              <p style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} />
                Syncing pending operations...
              </p>
            )}

            {syncStatus === 'synced' && (
              <p style={{ marginBottom: 4, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={12} />
                Sync complete!
              </p>
            )}

            {syncStatus === 'error' && (
              <p style={{ marginBottom: 4, color: '#ea580c', display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={12} />
                Some operations failed to sync.
              </p>
            )}

            {pendingOps > 0 && (
              <p style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={12} />
                {pendingOps} operation{pendingOps !== 1 ? 's' : ''} pending sync
              </p>
            )}

            {lastSyncTime && (
              <p style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: 8 }}>
                Last sync: {new Date(lastSyncTime).toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            {isOnline && pendingOps > 0 && syncStatus !== 'syncing' && (
              <button
                onClick={triggerSync}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <RefreshCw size={12} /> Sync Now
              </button>
            )}
            <button
              onClick={() => { setShowBanner(false); setExpanded(false); }}
              style={{
                background: 'transparent',
                color: colors.text,
                border: `1px solid ${colors.border}`,
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse-offline {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
