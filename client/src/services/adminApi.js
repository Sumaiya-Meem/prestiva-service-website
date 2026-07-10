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

export const updateQuoteStatus = async (id, status) => updateQuote(id, { status });

/** Patch any subset of { status, internalNotes, archived } on a quote. */
export const updateQuote = async (id, patch) => {
  const res = await fetch(`${BASE}/api/contact/${id}`, {
    method: 'PATCH',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
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

/**
 * Cached gallery fetch for the PUBLIC site. The result is kept in memory for the
 * lifetime of the page, so navigating between pages (Home ↔ Gallery) reuses the
 * same data instead of hitting the database every time. A full page reload
 * clears the module state and fetches once more. In-flight requests are deduped.
 *
 * (The admin panel intentionally uses the uncached `fetchGallery` so it always
 * shows the latest state after edits.)
 */
let _galleryData = null;
let _galleryPromise = null;

export const fetchGalleryCached = () => {
  if (_galleryData) return Promise.resolve(_galleryData);
  if (!_galleryPromise) {
    _galleryPromise = fetchGallery()
      .then((d) => { _galleryData = d; return d; })
      .catch((e) => { _galleryPromise = null; throw e; }); // don't cache failures
  }
  return _galleryPromise;
};

/** Drop the cache (e.g. after admin edits) so the next read refetches. */
export const clearGalleryCache = () => { _galleryData = null; _galleryPromise = null; };

export const addGallerySection = async (name) => {
  const res = await fetch(`${BASE}/api/gallery/sections`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  const data = await handle(res);
  clearGalleryCache();
  return data;
};

export const deleteGallerySection = async (slug) => {
  const res = await fetch(`${BASE}/api/gallery/sections/${encodeURIComponent(slug)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const data = await handle(res);
  clearGalleryCache();
  return data;
};

/**
 * Upload an image OR video to a section. Reports progress via onProgress(0..1)
 * (uses XHR because fetch can't stream upload progress). Videos can be large,
 * so a progress bar matters for UX.
 */
export const uploadGalleryMedia = (slug, file, onProgress) =>
  new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${BASE}/api/gallery/sections/${encodeURIComponent(slug)}/media`);
    xhr.setRequestHeader('Authorization', `Bearer ${getToken()}`);

    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => {
      let data = {};
      try { data = JSON.parse(xhr.responseText); } catch { /* no body */ }
      if (xhr.status === 401) { clearToken(); return reject(new Error('Session expired — please log in again.')); }
      if (xhr.status >= 200 && xhr.status < 300 && data.success !== false) return resolve(data);
      reject(new Error(data.message || `Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error('Network error during upload.'));
    xhr.send(fd);
  });

/** Import the built-in gallery onto the server (fixes missing files in prod). */
export const importDefaultGallery = async () => {
  const res = await fetch(`${BASE}/api/gallery/import-defaults`, {
    method: 'POST',
    headers: authHeaders(),
  });
  const data = await handle(res);
  clearGalleryCache();
  return data;
};

/** Rebuild the gallery into the server's current storage (cloud). Clears + re-imports. */
export const rebuildGallery = async () => {
  const res = await fetch(`${BASE}/api/gallery/rebuild`, {
    method: 'POST',
    headers: authHeaders(),
  });
  const data = await handle(res);
  clearGalleryCache();
  return data;
};

export const deleteGalleryMedia = async (slug, id) => {
  const res = await fetch(
    `${BASE}/api/gallery/sections/${encodeURIComponent(slug)}/media/${encodeURIComponent(id)}`,
    { method: 'DELETE', headers: authHeaders() }
  );
  const data = await handle(res);
  clearGalleryCache();
  return data;
};

/* ── Page background images ── */
export const uploadPageBackground = (page, file, onProgress) =>
  new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${BASE}/api/backgrounds/${encodeURIComponent(page)}`);
    xhr.setRequestHeader('Authorization', `Bearer ${getToken()}`);

    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => {
      let data = {};
      try { data = JSON.parse(xhr.responseText); } catch { /* no body */ }
      if (xhr.status === 401) { clearToken(); return reject(new Error('Session expired — please log in again.')); }
      if (xhr.status >= 200 && xhr.status < 300 && data.success !== false) return resolve(data);
      reject(new Error(data.message || `Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error('Network error during upload.'));
    xhr.send(fd);
  });

export const deletePageBackground = async (page) => {
  const res = await fetch(`${BASE}/api/backgrounds/${encodeURIComponent(page)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
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

/* ── Pages (page builder) ── */
/** Public: published pages flagged for the nav menu (for the site header). */
export const fetchNavPages = async () => {
  const res = await fetch(`${BASE}/api/pages/nav`);
  return handle(res); // { success, pages }
};

export const fetchPageBySlug = async (slug) => {
  const res = await fetch(`${BASE}/api/pages/slug/${encodeURIComponent(slug)}`);
  return handle(res); // { success, page } — throws on 404
};

export const fetchPages = async () => {
  const res = await fetch(`${BASE}/api/pages`, { headers: authHeaders() });
  return handle(res); // { success, pages }
};

export const createPage = async (page) => {
  const res = await fetch(`${BASE}/api/pages`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ page }),
  });
  return handle(res);
};

export const updatePage = async (id, page) => {
  const res = await fetch(`${BASE}/api/pages/${id}`, {
    method: 'PUT',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ page }),
  });
  return handle(res);
};

export const deletePage = async (id) => {
  const res = await fetch(`${BASE}/api/pages/${id}`, { method: 'DELETE', headers: authHeaders() });
  return handle(res);
};
