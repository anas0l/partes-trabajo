// api.js — todas las llamadas al backend
const BASE = '/api/partes';

async function request(method, url, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Error en la solicitud');
  }
  return res.json();
}

const api = {
  listar: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return request('GET', `${BASE}${qs ? '?' + qs : ''}`);
  },
  obtener: (id) => request('GET', `${BASE}/${id}`),
  crear: (data) => request('POST', BASE, data),
  actualizar: (id, data) => request('PUT', `${BASE}/${id}`, data),
  eliminar: (id) => request('DELETE', `${BASE}/${id}`),
  resumen: () => request('GET', `${BASE}/stats/resumen`),
};
