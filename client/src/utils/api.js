const backendUri = import.meta.env.VITE_APP_BACKEND_URI?.replace(/\/+$/, '');

if (!backendUri) {
  throw new Error('VITE_APP_BACKEND_URI must be configured.');
}

export function apiFetch(path, options) {
  const endpoint = path.startsWith('/') ? path : `/${path}`;
  return fetch(`${backendUri}${endpoint}`, options);
}
