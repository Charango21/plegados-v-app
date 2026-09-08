import { useState, useEffect, useCallback } from 'react'
import AuthContext from './authContext'
import { API_URL } from '../config'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshAccessToken = useCallback(async () => {
    const refresh = localStorage.getItem('refresh')
    if (!refresh) return null
    try {
      const res = await fetch(`${API_URL}/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      })
      if (res.ok) {
        const data = await res.json()
        localStorage.setItem('access', data.access)
        return data.access
      }
    } catch { /* ignore */ }
    return null
  }, [])

  const fetchProfile = useCallback(async (token) => {
    try {
      const res = await fetch(`${API_URL}/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data)
        return true
      }
      if (res.status === 401) {
        const newToken = await refreshAccessToken()
        if (newToken) {
          const retryRes = await fetch(`${API_URL}/profile/`, {
            headers: { Authorization: `Bearer ${newToken}` },
          })
          if (retryRes.ok) {
            const data = await retryRes.json()
            setUser(data)
            return true
          }
        }
      }
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
      return false
    } catch {
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
      return false
    }
  }, [refreshAccessToken])

  useEffect(() => {
    const token = localStorage.getItem('access')
    if (token) {
      fetchProfile(token).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [fetchProfile])

  const apiFetch = useCallback(async (url, options = {}) => {
    let token = localStorage.getItem('access')
    if (token) {
      options.headers = { ...options.headers, Authorization: `Bearer ${token}` }
    }
    let res = await fetch(`${API_URL}${url}`, options)
    if (res.status === 401 && localStorage.getItem('refresh')) {
      const newToken = await refreshAccessToken()
      if (newToken) {
        options.headers = { ...options.headers, Authorization: `Bearer ${newToken}` }
        res = await fetch(`${API_URL}${url}`, options)
      }
    }
    return res
  }, [refreshAccessToken])

  const login = async (username, password) => {
    const res = await fetch(`${API_URL}/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.detail || 'Usuario o contraseña incorrectos')
    }
    const { access, refresh } = await res.json()
    localStorage.setItem('access', access)
    localStorage.setItem('refresh', refresh)
    await fetchProfile(access)
    return true
  }

  const register = async (username, email, password) => {
    const res = await fetch(`${API_URL}/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    })
    if (!res.ok) {
      const data = await res.json()
      if (data.username) throw new Error('Ese usuario ya existe')
      if (data.email) throw new Error('Ese email ya está registrado')
      throw new Error('Error al registrarse')
    }
    return true
  }

  const logout = async () => {
    const refresh = localStorage.getItem('refresh')
    if (refresh) {
      try {
        await fetch(`${API_URL}/logout/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh }),
        })
      } catch { /* ignore */ }
    }
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, apiFetch }}>
      {children}
    </AuthContext.Provider>
  )
}
