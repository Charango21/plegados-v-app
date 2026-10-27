import { Navigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import Navbar from './Navbar'
import Footer from './Footer'

function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const isStaff = user.role === 'jefe' || user.role === 'empleado'

  if (!isStaff) {
    return (
      <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: 'var(--pv-bg)' }}>
        <Navbar />
        <main className="flex-grow-1 d-flex align-items-center py-5">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-8 col-lg-6">
                <div className="sketch-card p-5 text-center">
                  <div className="display-3 text-warning mb-3">⚠️</div>
                  <h2 className="text-white mb-2">Acceso no autorizado</h2>
                  <p className="text-white-50 mb-4">
                    Esta sección está reservada exclusivamente para el personal del taller (Empleados y Jefes).
                  </p>
                  <Link to="/" className="sketch-btn-light text-decoration-none">
                    Volver al inicio
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return children
}

export default AdminRoute
