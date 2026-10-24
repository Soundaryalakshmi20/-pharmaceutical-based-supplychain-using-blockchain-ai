/**
 * PharmaChain Service Worker
 * 
 * Strategies:
 * - Static assets: Cache-first (precache on install)
 * - API GET requests: Network-first with cache fallback
 * - API POST/PUT/PATCH/DELETE: Queue for background sync
 * - Navigation: Network-first with offline fallback page
 */

const CACHE_NAME = 'pharmachain-v2';
const STATIC_CACHE = 'pharmachain-static-v2';
const API_CACHE = 'pharmachain-api-v2';
const OFFLINE_QUEUE_KEY = 'pharmachain-offline-queue';

// Assets to precache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
];

// API routes that are safe to cache (GET only, no sensitive data)
const CACHEABLE_API_ROUTES = [
  '/api/medicines',
  '/api/batches',
  '/api/inventory',
  '/api/cdsco',
  '/api/drug-interactions',
  '/api/reports/',
  '/api/health',
];

// API routes that should never be cached
const NO_CACHE_ROUTES = [
  '/api/auth/login',
  '/api/auth/me',
];

// ─── Install ───────────────────────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Precaching static assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// ─── Activate ──────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== API_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ─── Fetch ─────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET for caching (handle write ops separately)
  if (request.method === 'GET') {
    // API requests: network-first with cache fallback
    if (url.pathname.startsWith('/api/')) {
      // Skip caching for sensitive/auth routes
      if (NO_CACHE_ROUTES.some(route => url.pathname.startsWith(route))) {
        return;
      }

      event.respondWith(networkFirstWithCache(request, API_CACHE));
      return;
    }

    // Static assets: cache-first
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Write operations (POST, PUT, PATCH, DELETE): try network, queue on failure
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    if (url.pathname.startsWith('/api/')) {
      event.respondWith(handleWriteOperation(request));
      return;
    }
  }
});

// ─── Strategy: Cache First ─────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    return new Response('Offline', { status: 503 });
  }
}

// ─── Strategy: Network First with Cache ────────────────────
async function networkFirstWithCache(request, cacheName) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache successful GET responses
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());

      // Broadcast to clients that we're back online
      broadcastStatus(true);
    }
    
    return response;
  } catch (err) {
    // Network failed, try cache
    const cached = await caches.match(request);
    if (cached) {
      // Add header to indicate cached response
      const headers = new Headers(cached.headers);
      headers.set('X-Served-From', 'sw-cache');
      headers.set('X-Cached-At', new Date().toISOString());
      
      return new Response(cached.body, {
        status: cached.status,
        statusText: cached.statusText,
        headers,
      });
    }

    // Broadcast offline status
    broadcastStatus(false);

    // Return a meaningful offline response
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'OFFLINE',
          message: 'You are currently offline. Data may be stale.',
        },
        offline: true,
        cached: false,
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// ─── Handle Write Operations (POST/PUT/PATCH/DELETE) ───────
async function handleWriteOperation(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      // Invalidate relevant caches on successful write
      invalidateRelatedCaches(request);
    }
    
    return response;
  } catch (err) {
    // Queue the operation for background sync
    await queueOfflineOperation(request);
    
    // Notify clients about queued operation
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'OFFLINE_OPERATION_QUEUED',
        payload: {
          url: request.url,
          method: request.method,
          timestamp: Date.now(),
        },
      });
    });

    return new Response(
      JSON.stringify({
        success: true,
        offline: true,
        queued: true,
        message: 'Operation queued for sync when back online.',
        queued_at: new Date().toISOString(),
      }),
      {
        status: 202,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// ─── Cache Invalidation ────────────────────────────────────
async function invalidateRelatedCaches(request) {
  const url = new URL(request.url);
  const cache = await caches.open(API_CACHE);
  const keys = await cache.keys();

  // Invalidate caches related to the mutated resource
  for (const key of keys) {
    const keyUrl = new URL(key.url);
    // If the write is to /api/patients, also clear /api/patients/...
    if (url.pathname.startsWith(keyUrl.pathname.split('/').slice(0, 3).join('/'))) {
      await cache.delete(key);
    }
  }
}

// ─── Offline Queue ─────────────────────────────────────────
async function queueOfflineOperation(request) {
  try {
    const body = await request.clone().text();
    const entry = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: body ? JSON.parse(body) : null,
      timestamp: Date.now(),
      id: `offline_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    };

    // Store in IndexedDB for reliability
    const db = await openDB();
    const tx = db.transaction('pendingOps', 'readwrite');
    tx.objectStore('pendingOps').put(entry);
    
    // Also store in localStorage as backup
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
    queue.push(entry);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));

    console.log('[SW] Queued offline operation:', entry.method, entry.url);
  } catch (err) {
    console.error('[SW] Failed to queue operation:', err);
  }
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

// ─── Background Sync ───────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'pharmachain-sync') {
    console.log('[SW] Background sync triggered');
    event.waitUntil(syncPendingOperations());
  }
});

async function syncPendingOperations() {
  try {
    const db = await openDB();
    const tx = db.transaction('pendingOps', 'readonly');
    const store = tx.objectStore('pendingOps');
    const allOps = await new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    console.log(`[SW] Syncing ${allOps.length} pending operations`);

    const syncResults = [];
    for (const op of allOps) {
      try {
        const response = await fetch(op.url, {
          method: op.method,
          headers: {
            'Content-Type': 'application/json',
            ...op.headers,
          },
          body: op.body ? JSON.stringify(op.body) : undefined,
        });

        if (response.ok) {
          // Remove from queue
          const deleteTx = db.transaction('pendingOps', 'readwrite');
          deleteTx.objectStore('pendingOps').delete(op.id);
          
          syncResults.push({ id: op.id, success: true });
          console.log('[SW] Synced:', op.method, op.url);
        } else {
          syncResults.push({ id: op.id, success: false, status: response.status });
          console.warn('[SW] Sync failed for:', op.method, op.url, response.status);
        }
      } catch (err) {
        syncResults.push({ id: op.id, success: false, error: err.message });
        console.error('[SW] Sync error for:', op.method, op.url, err);
      }
    }

    // Notify all clients about sync completion
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        payload: {
          total: allOps.length,
          succeeded: syncResults.filter(r => r.success).length,
          failed: syncResults.filter(r => !r.success).length,
          results: syncResults,
          timestamp: Date.now(),
        },
      });
    });

    return syncResults;
  } catch (err) {
    console.error('[SW] Sync failed:', err);
  }
}

// ─── Broadcast Status ──────────────────────────────────────
async function broadcastStatus(online) {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'CONNECTIVITY_CHANGE',
      payload: { online, timestamp: Date.now() },
    });
  });
}

// ─── Message Handler ───────────────────────────────────────
self.addEventListener('message', (event) => {
  const { type } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'FORCE_SYNC':
      event.waitUntil(syncPendingOperations());
      break;

    case 'GET_QUEUE_STATUS':
      event.waitUntil(
        getQueueStatus().then(status => {
          event.source.postMessage({
            type: 'QUEUE_STATUS',
            payload: status,
          });
        })
      );
      break;

    case 'CLEAR_CACHE':
      event.waitUntil(
        caches.delete(API_CACHE).then(() => {
          event.source.postMessage({
            type: 'CACHE_CLEARED',
            payload: { success: true },
          });
        })
      );
      break;
  }
});

async function getQueueStatus() {
  try {
    const db = await openDB();
    const tx = db.transaction('pendingOps', 'readonly');
    const store = tx.objectStore('pendingOps');
    const count = await new Promise((resolve, reject) => {
      const req = store.count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return { pendingCount: count };
  } catch {
    return { pendingCount: 0 };
  }
}
