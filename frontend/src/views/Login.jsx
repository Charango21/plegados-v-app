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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const from = location.state?.from
    ? `${location.state.from.pathname}${location.state.from.search || ''}`
    : '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password) {
      setError('Completá el usuario y la contraseña')
      return
    }
    setIsSubmitting(true)
    setError('')
    try {
      await login(username.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Usuario o contraseña incorrectos')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Iniciar sesión">
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
          />
        </div>
        {error && (
          <div className="alert alert-danger py-2" role="alert">
            {error}
          </div>
        )}
        <button
          type="submit"
          className="sketch-btn-outline w-100 mt-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
        </button>
      </form>
      <p className="text-center mt-3 mb-0 text-white-50 small">
        ¿No tenés cuenta?{' '}
        <Link to="/register" className="text-white text-decoration-underline">
          Registrate
        </Link>
      </p>
    </AuthLayout>
  )
}

export default Login
