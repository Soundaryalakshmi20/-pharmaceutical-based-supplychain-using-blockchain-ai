/**
 * Tiny axios-compatible HTTP client built on fetch.
 *
 * Using fetch (instead of XHR) matters here: the service worker in
 * public/sw.js intercepts fetch requests to implement the offline cache and
 * the background-sync queue — XHR would bypass it.
 *
 * Every call resolves to { data, status } where `data` is the parsed JSON body
 * (`{ success, message, data }` from the API) and rejects with an Error that
 * carries `err.response = { status, data }` so existing pages can read
 * `err.response?.data?.error?.message`.
 */

const BASE_URL = '/api';
const TOKEN_KEY = 'pharmachain_token';

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (_) {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch (_) {
    /* storage unavailable */
  }
}

export function clearToken() {
  setToken(null);
}

function buildQuery(params) {
  if (!params) return '';
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ''
  );
  if (!entries.length) return '';
  return `?${new URLSearchParams(entries).toString()}`;
}

async function request(method, url, { params, body, headers = {} } = {}) {
  const target = `${BASE_URL}${url}${buildQuery(params)}`;
  const finalHeaders = { Accept: 'application/json', ...headers };
  const token = getToken();
  if (token) finalHeaders.Authorization = `Bearer ${token}`;

  const init = { method, headers: finalHeaders, credentials: 'omit' };
  if (body !== undefined && body !== null) {
    finalHeaders['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(target, init);
  } catch (networkErr) {
    const err = new Error('Cannot reach the PharmaChain API — are you online?');
    err.offline = true;
    err.response = { status: 0, data: { success: false, error: { code: 'NETWORK_ERROR', message: err.message } } };
    throw err;
  }

  let json = null;
  try {
    json = await response.json();
  } catch (_) {
    json = null;
  }

  if (!response.ok || (json && json.success === false)) {
    const message =
      (json && json.error && json.error.message) ||
      (json && json.message) ||
      `Request failed with status ${response.status}`;
    const err = new Error(message);
    err.response = { status: response.status, data: json };
    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent('pharmachain:unauthorized'));
    }
    throw err;
  }

  return { data: json, status: response.status };
}

const client = {
  baseURL: BASE_URL,
  get: (url, config = {}) => request('GET', url, config),
  post: (url, body, config = {}) => request('POST', url, { ...config, body }),
  put: (url, body, config = {}) => request('PUT', url, { ...config, body }),
  patch: (url, body, config = {}) => request('PATCH', url, { ...config, body }),
  delete: (url, config = {}) => request('DELETE', url, config),
  getToken,
  setToken,
  clearToken,
};

export default client;
