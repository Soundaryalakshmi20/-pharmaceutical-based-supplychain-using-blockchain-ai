/**
 * PharmaChain Service Worker Registration
 * 
 * Handles SW lifecycle: registration, update detection, and offline queue sync.
 */

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?)){3}$/)
);

let registration = null;

export async function register(config = {}) {
  if ('serviceWorker' in navigator) {
    // Dev server: the SW's cache-first strategy would keep serving the OLD
    // bundle after every edit (index.html and /src/* modules are cached by
    // URL), so code changes silently don't show up. Disable it in dev and
    // clear whatever an earlier run left behind.
    if (import.meta.env.DEV) {
      try {
        const existing = await navigator.serviceWorker.getRegistrations();
        await Promise.all(existing.map((r) => r.unregister()));
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
        if (existing.length) {
          console.log('[SW Reg] Dev mode: service worker disabled and caches cleared');
        }
      } catch (err) {
        console.warn('[SW Reg] Dev cleanup failed:', err);
      }
      return null;
    }

    try {
      const swUrl = `${import.meta.env.BASE_URL || '/'}sw.js`;

      if (isLocalhost) {
        // In localhost, check if SW file exists before registering
        const response = await fetch(swUrl);
        if (response.status === 404) {
          console.log('[SW Reg] Service worker not found, skipping registration');
          return null;
        }
      }

      registration = await navigator.serviceWorker.register(swUrl, {
        scope: '/',
      });

      console.log('[SW Reg] Service worker registered with scope:', registration.scope);

      // Check for updates periodically
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('[SW Reg] New service worker installing...');

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log('[SW Reg] New content available — refresh to update');
              // Notify app about available update
              if (config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              console.log('[SW Reg] Content cached for offline use');
              if (config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        });
      });

      return registration;
    } catch (error) {
      console.error('[SW Reg] Registration failed:', error);
      return null;
    }
  }
  return null;
}

export async function unregister() {
  if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg) {
      const result = await reg.unregister();
      console.log('[SW Reg] Service worker unregistered:', result);
      return result;
    }
  }
  return false;
}

/**
 * Request background sync for pending offline operations
 */
export async function requestSync() {
  if (registration && 'sync' in registration) {
    try {
      await registration.sync.register('pharmachain-sync');
      console.log('[SW Reg] Background sync registered');
      return true;
    } catch (err) {
      console.warn('[SW Reg] Background sync registration failed:', err);
      return false;
    }
  }
  return false;
}

/**
 * Force the service worker to sync pending operations immediately
 */
export function forceSyncNow() {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'FORCE_SYNC' });
  }
}

/**
 * Get the status of the offline queue
 */
export function getOfflineQueueStatus() {
  return new Promise((resolve) => {
    if (!navigator.serviceWorker.controller) {
      resolve({ pendingCount: 0 });
      return;
    }

    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = (event) => {
      if (event.data.type === 'QUEUE_STATUS') {
        resolve(event.data.payload);
      }
    };

    navigator.serviceWorker.controller.postMessage(
      { type: 'GET_QUEUE_STATUS' },
      [messageChannel.port2]
    );

    // Timeout fallback
    setTimeout(() => resolve({ pendingCount: 0, error: 'timeout' }), 3000);
  });
}

/**
 * Clear the API cache
 */
export async function clearApiCache() {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
  }
  // Also clear from browser (covers every API cache version)
  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('pharmachain-api-')).map((k) => caches.delete(k)));
  }
}

/**
 * Get the registration instance
 */
export function getRegistration() {
  return registration;
}
