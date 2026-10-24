// QR codes must encode a URL the phone can reach on the same WiFi.
// The LAN IP changes between reboots/DHCP renewals, so we ask the backend
// for its current IP instead of hardcoding one (which broke Google Lens scans).

let cachedIp = null;
let pending = null;

export function fetchLanIp() {
  if (cachedIp) return Promise.resolve(cachedIp);
  if (!pending) {
    pending = fetch('/api/health')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        cachedIp = j?.data?.lanIp || null;
        return cachedIp;
      })
      .catch(() => null)
      .finally(() => {
        pending = null;
      });
  }
  return pending;
}

/** Synchronous best-guess base URL; call fetchLanIp() then re-render for accuracy. */
export function getQrBaseUrl() {
  const host = window.location.hostname;
  if (host !== 'localhost' && host !== '127.0.0.1') return window.location.origin;
  if (cachedIp) return `http://${cachedIp}:5173`;
  return window.location.origin;
}
