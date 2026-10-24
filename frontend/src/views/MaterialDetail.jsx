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
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <section className="py-5 flex-grow-1 bg-light">
        <div className="container">
          <Link to="/hacer-pedido" className="btn btn-link ps-0 mb-3">
            ← Volver a selección de materiales
          </Link>

          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-2 text-muted">Cargando material...</p>
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
              <div className="col-md-8">
                <div className="card">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h2 className="mb-0">{material.name}</h2>
                      {!isAvailable && (
                        <span className="badge bg-secondary fs-6">No disponible</span>
                      )}
                    </div>
                    <table className="table table-striped mb-4">
                      <tbody>
                        <tr>
                          <th>Espesor</th>
                          <td>{material.thickness_mm} mm</td>
                        </tr>
                        <tr>
                          <th>Ancho máximo</th>
                          <td>{material.max_width_mm} mm</td>
                        </tr>
                        <tr>
                          <th>Largo máximo</th>
                          <td>{material.max_length_mm} mm</td>
                        </tr>
                        <tr>
                          <th>Stock disponible</th>
                          <td>{material.stock} unidades</td>
                        </tr>
                      </tbody>
                    </table>
                    {isAvailable ? (
                      <Link to={`/checkout?material=${material.id}`} className="btn btn-primary btn-lg w-100">
                        Continuar con las medidas de mi pedido →
                      </Link>
                    ) : (
                      <button className="btn btn-secondary btn-lg w-100" disabled>
                        Material no disponible para pedidos
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  )
}

export default MaterialDetail
