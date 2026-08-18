import { useState } from 'react'
import AuthContext from './authContext'

const HARDCODED_USERS = [
  { username: 'admin', password: 'admin123', email: 'admin@plegados.com' },
  { username: 'cliente', password: 'cliente123', email: 'cliente@plegados.com' },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState(HARDCODED_USERS)

  const login = (username, password) => {
    const found = users.find(
      (u) => u.username === username && u.password === password,
    )
    if (found) {
      setUser({ username: found.username, email: found.email })
      return true
    }
    return false
  }

  const register = (username, email, password) => {
    if (users.some((u) => u.username === username)) {
      return false
    }
    setUsers((prev) => [...prev, { username, email, password }])
    return true
  }

  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}