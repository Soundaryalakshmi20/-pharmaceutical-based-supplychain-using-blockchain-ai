import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const OfflineContext = createContext();

/**
 * OfflineProvider
 * 
 * Tracks online/offline status, listens for service worker messages,
 * manages the offline operation queue, and triggers sync on reconnect.
 */
export function OfflineProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState(null); // null | 'syncing' | 'synced' | 'error'
  const [pendingOps, setPendingOps] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [availableOffline, setAvailableOffline] = useState(false);
  const reconnectTimerRef = useRef(null);

  // ─── Listen for connectivity changes ─────────────────────
  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      setSyncStatus('syncing');
      // Trigger background sync when coming back online
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'FORCE_SYNC' });
      }
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ─── Listen for service worker messages ──────────────────
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    function handleSWMessage(event) {
      const { type, payload } = event.data;

      switch (type) {
        case 'CONNECTIVITY_CHANGE':
          setIsOnline(payload.online);
          break;

        case 'OFFLINE_OPERATION_QUEUED':
          setPendingOps(prev => prev + 1);
          break;

        case 'SYNC_COMPLETE':
          setSyncStatus(payload.failed > 0 ? 'error' : 'synced');
          setPendingOps(prev => Math.max(0, prev - payload.succeeded));
          setLastSyncTime(new Date(payload.timestamp));
          // Auto-clear status after 5s
          setTimeout(() => setSyncStatus(null), 5000);
          break;

        case 'QUEUE_STATUS':
          setPendingOps(payload.pendingCount);
          break;

        case 'CACHE_CLEARED':
          console.log('[Offline] API cache cleared');
          break;
      }
    }

    navigator.serviceWorker.addEventListener('message', handleSWMessage);
    return () => navigator.serviceWorker.removeEventListener('message', handleSWMessage);
  }, []);

  // ─── Check SW cache status on mount ──────────────────────
  useEffect(() => {
    async function checkCache() {
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          setAvailableOffline(cacheNames.includes('pharmachain-api-v1'));
        } catch {
          setAvailableOffline(false);
        }
      }
    }
    checkCache();
  }, []);

  // ─── Queue an operation for later sync ───────────────────
  const queueOperation = useCallback(async (operation) => {
    const entry = {
      id: `offline_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ...operation,
      timestamp: Date.now(),
    };

    // Store in IndexedDB
    try {
      const db = await openDB();
      const tx = db.transaction('pendingOps', 'readwrite');
      tx.objectStore('pendingOps').put(entry);
    } catch (err) {
      console.error('[Offline] Failed to queue in IndexedDB:', err);
    }

    // Also store in localStorage as fallback
    try {
      const queue = JSON.parse(localStorage.getItem('pharmachain-offline-queue') || '[]');
      queue.push(entry);
      localStorage.setItem('pharmachain-offline-queue', JSON.stringify(queue));
    } catch (err) {
      console.error('[Offline] Failed to queue in localStorage:', err);
    }

    setPendingOps(prev => prev + 1);
    return entry;
  }, []);

  // ─── Get pending operations ──────────────────────────────
  const getPendingOperations = useCallback(async () => {
    try {
      const db = await openDB();
      const tx = db.transaction('pendingOps', 'readonly');
      const store = tx.objectStore('pendingOps');
      return await new Promise((resolve, reject) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return JSON.parse(localStorage.getItem('pharmachain-offline-queue') || '[]');
    }
  }, []);

  // ─── Clear a specific pending operation ──────────────────
  const clearOperation = useCallback(async (id) => {
    try {
      const db = await openDB();
      const tx = db.transaction('pendingOps', 'readwrite');
      tx.objectStore('pendingOps').delete(id);
    } catch { /* ignore */ }

    try {
      const queue = JSON.parse(localStorage.getItem('pharmachain-offline-queue') || '[]');
      const filtered = queue.filter(op => op.id !== id);
      localStorage.setItem('pharmachain-offline-queue', JSON.stringify(filtered));
    } catch { /* ignore */ }

    setPendingOps(prev => Math.max(0, prev - 1));
  }, []);

  // ─── Manually trigger sync ───────────────────────────────
  const triggerSync = useCallback(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      setSyncStatus('syncing');
      navigator.serviceWorker.controller.postMessage({ type: 'FORCE_SYNC' });
    }
  }, []);

  const value = {
    isOnline,
    syncStatus,
    pendingOps,
    lastSyncTime,
    availableOffline,
    queueOperation,
    getPendingOperations,
    clearOperation,
    triggerSync,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}

// ─── IndexedDB Helper ──────────────────────────────────────
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PharmaChainOffline', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingOps')) {
        const store = db.createObjectStore('pendingOps', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp');
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
