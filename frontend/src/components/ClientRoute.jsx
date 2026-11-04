import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import ProtectedRoute from './ProtectedRoute'

function ClientRoute({ children }) {
  const { user } = useAuth()
  const location = useLocation()

  return (
    <ProtectedRoute>
      {user?.role === 'cliente' ? children : <Navigate to="/admin-panel" state={{ from: location }} replace />}
    </ProtectedRoute>
  )
}

export default ClientRoute
