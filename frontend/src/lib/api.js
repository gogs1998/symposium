const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function jsonGet(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'ngrok-skip-browser-warning': 'true' },
  })
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
  return res.json()
}

export const api = {
  base: API_BASE,
  listFigures: () => jsonGet('/figures'),
  listSessions: (userId = 'default') => jsonGet(`/sessions?user_id=${encodeURIComponent(userId)}`),
  sessionHistory: (id) => jsonGet(`/sessions/${encodeURIComponent(id)}/history`),
  deleteSession: (id) =>
    fetch(`${API_BASE}/sessions/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  renameSession: (id, title) =>
    fetch(`${API_BASE}/sessions/${encodeURIComponent(id)}/title?title=${encodeURIComponent(title)}`, { method: 'PUT' }),
}
