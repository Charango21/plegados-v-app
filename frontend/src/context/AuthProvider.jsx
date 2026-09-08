import { useState, useEffect } from 'react'
import AuthContext from './authContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access')
    if (token) {
      fetchProfile(token).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const fetchProfile = async (token) => {
    try {
      const res = await fetch(`${API_URL}/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      } else {
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
      }
    } catch {
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
    }
  }

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
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
