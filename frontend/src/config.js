const rawUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api')
  .trim()
  .replace(/\/+$/, '')

export const API_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`
