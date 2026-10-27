import { API_URL } from './config'

async function request(path, options = {}) {
  const token = localStorage.getItem('access')
  const headers = { ...options.headers }
  if (token) headers.Authorization = `Bearer ${token}`
  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (res.status === 204) return null

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const firstKey = Object.keys(data)[0]
    const message =
      data.detail ||
      (firstKey ? `${firstKey}: ${Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey]}` : null) ||
      'Error en la operación'
    throw new Error(message)
  }

  return res.json()
}

export function apiGet(path) {
  return request(path, { method: 'GET' })
}

export function apiPost(path, data) {
  return request(path, { method: 'POST', body: JSON.stringify(data) })
}

export function apiPut(path, data) {
  return request(path, { method: 'PUT', body: JSON.stringify(data) })
}

export function apiPatch(path, data) {
  return request(path, { method: 'PATCH', body: JSON.stringify(data) })
}

export function apiDelete(path) {
  return request(path, { method: 'DELETE' })
}
