import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import logo from '../assets/PV.png'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isStaff = user && (user.role === 'jefe' || user.role === 'empleado')

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-sketch">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img
            src={logo}
            alt="PLEGADOS VERDINI"
            height="38"
            className="d-inline-block align-top me-2"
          />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end>
                Inicio
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/hacer-pedido">
                Hacer pedido
              </NavLink>
            </li>
            {user ? (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/mis-pedidos">
                    Mis pedidos
                  </NavLink>
                </li>
                {isStaff && (
                  <li className="nav-item">
                    <NavLink className="nav-link fw-semibold text-warning" to="/admin-panel">
                      Panel Admin ⚙️
                    </NavLink>
                  </li>
                )}
                <li className="nav-item ms-lg-2">
                  <NavLink className="nav-link text-white-50" to="/perfil" title="Ver mi perfil">
                    👤 {user.username} <small>({user.role})</small>
                  </NavLink>
                </li>
                <li className="nav-item ms-lg-2">
                  <button
                    type="button"
                    className="sketch-btn-outline btn-sm py-1 px-3"
                    onClick={handleLogout}
                  >
                    Cerrar sesión
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item ms-lg-2">
                  <NavLink className="nav-link" to="/register">
                    Registrarse
                  </NavLink>
                </li>
                <li className="nav-item ms-lg-2">
                  <NavLink className="nav-link" to="/login">
                    Iniciar sesión
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
