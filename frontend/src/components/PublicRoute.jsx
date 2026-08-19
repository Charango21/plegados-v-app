import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

function PublicRoute({ children }) {
  const { user } = useAuth()

  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}

export default PublicRoute