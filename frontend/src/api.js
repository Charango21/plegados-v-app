import { API_URL } from './config'

export async function apiGet(path) {
  const token = localStorage.getItem('access')
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${API_URL}${path}`, { headers })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const message = data.detail || data[Object.keys(data)[0]]?.[0] || 'Error al cargar datos'
    throw new Error(message)
  }
  return res.json()
}
