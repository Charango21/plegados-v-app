import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function NotFound() {
  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: 'var(--pv-bg)' }}>
      <Navbar />
      <main className="flex-grow-1 d-flex align-items-center py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-11 col-sm-9 col-md-6 col-lg-5">
              <div className="sketch-card p-5 text-center">
                <div className="display-1 fw-bold text-white mb-2">404</div>
                <h2 className="h4 text-white mb-3">Página no encontrada</h2>
                <p className="text-white-50 mb-4">
                  La página o recurso que estás buscando no existe o fue movido.
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

export default NotFound
