import siteConfig from '../config/siteConfig';

const BASE = siteConfig.apiBaseUrl;
const TOKEN_KEY = 'prestiva_admin_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY) || '';
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
export const isLoggedIn = () => Boolean(getToken());

const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

const handle = async (res) => {
  let data = {};
  try { data = await res.json(); } catch { /* no body */ }
  if (res.status === 401) {
    clearToken();
    throw new Error('Session expired — please log in again.');
  }
  if (!res.ok || data.success === false) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
};

/** Validate a token against the backend; saves it on success. */
export const login = async (token) => {
  const res = await fetch(`${BASE}/api/admin/verify`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const msg = res.status === 401 ? 'Invalid access token.' : `Login failed (${res.status})`;
    throw new Error(msg);
  }
  setToken(token);
  return true;
};

/* ── Quotes ── */
export const fetchQuotes = async (status = '') => {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  const res = await fetch(`${BASE}/api/contact${qs}`, { headers: authHeaders() });
  return handle(res); // { success, count, quotes }
};

export const updateQuoteStatus = async (id, status) => {
  const res = await fetch(`${BASE}/api/contact/${id}`, {
    method: 'PATCH',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return handle(res);
};

/* ── Gallery ── */
/** Build an absolute URL for a server-relative media path (/uploads/…). */
export const mediaUrl = (u) => (!u || /^https?:\/\//.test(u) ? u : `${BASE}${u}`);

export const fetchGallery = async () => {
  const res = await fetch(`${BASE}/api/gallery`);
  return handle(res); // { success, sections }
};

export const addGallerySection = async (name) => {
  const res = await fetch(`${BASE}/api/gallery/sections`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  return handle(res);
};

export const deleteGallerySection = async (slug) => {
  const res = await fetch(`${BASE}/api/gallery/sections/${encodeURIComponent(slug)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handle(res);
};

export const uploadGalleryImage = async (slug, file) => {
  const fd = new FormData();
  fd.append('image', file);
  // NB: don't set Content-Type — the browser adds the multipart boundary.
  const res = await fetch(`${BASE}/api/gallery/sections/${encodeURIComponent(slug)}/images`, {
    method: 'POST',
    headers: authHeaders(),
    body: fd,
  });
  return handle(res);
};

export const deleteGalleryImage = async (slug, id) => {
  const res = await fetch(
    `${BASE}/api/gallery/sections/${encodeURIComponent(slug)}/images/${encodeURIComponent(id)}`,
    { method: 'DELETE', headers: authHeaders() }
  );
  return handle(res);
};

/* ── Settings ── */
export const fetchSettings = async () => {
  const res = await fetch(`${BASE}/api/settings`);
  return handle(res); // { success, settings }
};

export const saveSettings = async (settings) => {
  const res = await fetch(`${BASE}/api/settings`, {
    method: 'PUT',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ settings }),
  });
  return handle(res);
};
