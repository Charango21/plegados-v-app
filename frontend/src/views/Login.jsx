import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from '../context/useAuth'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const from = location.state?.from?.pathname || '/'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!username.trim() || !password) {
      setError('Completá el usuario y la contraseña')
      return
    }
    if (login(username.trim(), password)) {
      navigate(from, { replace: true })
    } else {
      setError('Usuario o contraseña incorrectos')
    }
  }

  return (
    <AuthLayout title="Ingresar">
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            Usuario
          </label>
          <input
            type="text"
            className="form-control"
            id="username"
            placeholder="Tu usuario"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              if (error) setError('')
            }}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Contraseña
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (error) setError('')
            }}
          />
        </div>
        {error && (
          <div className="alert alert-danger py-2" role="alert">
            {error}
          </div>
        )}
        <button type="submit" className="btn btn-primary w-100">
          Entrar
        </button>
      </form>
      <p className="text-center mt-3 mb-0 small">
        ¿No tenés cuenta? <Link to="/register">Registrate</Link>
      </p>
    </AuthLayout>
  )
}

export default Login