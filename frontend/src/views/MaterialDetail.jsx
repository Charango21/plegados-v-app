import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { apiGet } from '../api'

function MaterialDetail() {
  const { id } = useParams()
  const [material, setMaterial] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    apiGet(`/sheet-materials/${id}/`)
      .then(setMaterial)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  const isAvailable = material && material.is_active && material.stock > 0

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: 'var(--pv-bg)' }}>
      <Navbar />

      <main className="py-5 flex-grow-1">
        <div className="container">
          <Link to="/hacer-pedido" className="btn btn-link text-dark ps-0 mb-3 text-decoration-none">
            ← Volver a selección de materiales
          </Link>

          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-2 text-muted">Cargando especificaciones del material...</p>
            </div>
          )}

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
              <div className="mt-2">
                <Link to="/hacer-pedido" className="alert-link">
                  Volver a selección de materiales
                </Link>
              </div>
            </div>
          )}

          {material && (
            <div className="row justify-content-center">
              <div className="col-md-9 col-lg-8">
                <div className="sketch-card p-4 p-md-5">
                  <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2">
                    <div>
                      <span className="text-white-50 text-uppercase small" style={{ letterSpacing: '1px' }}>
                        Ficha técnica de chapa
                      </span>
                      <h2 className="text-white mb-0 mt-1">{material.name}</h2>
                    </div>
                    {isAvailable ? (
                      <span className="badge bg-success py-2 px-3 fs-6">En Stock ({material.stock})</span>
                    ) : (
                      <span className="badge bg-secondary py-2 px-3 fs-6">Sin Stock</span>
                    )}
                  </div>

                  <div className="sketch-inner-box mb-4">
                    <h5 className="fw-bold mb-3">Límites y dimensiones</h5>
                    <table className="table table-borderless mb-0">
                      <tbody>
                        <tr>
                          <th className="text-muted" style={{ width: '45%' }}>Espesor nominal:</th>
                          <td className="fw-semibold">{material.thickness_mm} mm</td>
                        </tr>
                        <tr>
                          <th className="text-muted">Ancho máximo admitido:</th>
                          <td className="fw-semibold">{material.max_width_mm} mm</td>
                        </tr>
                        <tr>
                          <th className="text-muted">Largo máximo admitido:</th>
                          <td className="fw-semibold">{material.max_length_mm} mm</td>
                        </tr>
                        <tr>
                          <th className="text-muted">Stock disponible:</th>
                          <td className="fw-semibold">{material.stock} unidades</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {isAvailable ? (
                    <Link
                      to={`/pedidos/nuevo?material=${material.id}`}
                      className="sketch-btn-light w-100 py-3 text-center text-decoration-none d-block"
                    >
                      Continuar a "Mi pedido" (cargar medidas) →
                    </Link>
                  ) : (
                    <button className="sketch-btn-outline w-100 py-3 text-center opacity-50" disabled>
                      Material no disponible para pedidos actualmente
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default MaterialDetail
