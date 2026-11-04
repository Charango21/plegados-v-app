const rawUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api')
  .trim()
  .replace(/\/+$/, '')

export const API_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`

// URL base del backend sin el sufijo '/api' (útil para archivos media y estáticos)
export const BACKEND_BASE_URL = API_URL.replace(/\/api\/?$/, '')

/**
 * Normaliza la URL de un archivo media devuelto por el backend.
 * Si ya es una URL absoluta (http/https), la devuelve tal cual.
 * Si es una ruta relativa (/media/...), le antepone la base del backend.
 */
export function getMediaUrl(path) {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${BACKEND_BASE_URL}${cleanPath}`
}
