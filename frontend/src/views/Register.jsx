import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from '../context/useAuth'

const EMAIL_REGEX = /^\S+@\S+\.\S+$/

function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const clearError = () => {
    if (error) setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Completá todos los campos')
      return
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Ingresá un email válido')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    const result = register(username.trim(), email.trim(), password)
    if (result.ok) {
      navigate('/login')
    } else if (result.code === 'user_exists') {
      setError('Ese usuario ya existe')
    } else if (result.code === 'email_exists') {
      setError('Ese email ya está registrado')
    }
  }

  return (
    <AuthLayout title="Registrarse">
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            Usuario
          </label>
          <input
            type="text"
            className="form-control"
            id="username"
            placeholder="Elegí un usuario"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              clearError()
            }}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              clearError()
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
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              clearError()
            }}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">
            Confirmar contraseña
          </label>
          <input
            type="password"
            className="form-control"
            id="confirmPassword"
            placeholder="Repetí la contraseña"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              clearError()
            }}
          />
        </div>
        {error && (
          <div className="alert alert-danger py-2" role="alert">
            {error}
          </div>
        )}
        <button type="submit" className="btn btn-primary w-100">
          Crear cuenta
        </button>
      </form>
      <p className="text-center mt-3 mb-0 small">
        ¿Ya tenés cuenta? <Link to="/login">Ingresá</Link>
      </p>
    </AuthLayout>
  )
}

export default Register