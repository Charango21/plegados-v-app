import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { apiGet } from '../api'

function Materials() {
  const [materials, setMaterials] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(() => {
      setLoading(true)
      setError('')
      const query = search ? `?search=${encodeURIComponent(search)}` : ''
      apiGet(`/sheet-materials/${query}`)
        .then((data) => setMaterials(data.results || data || []))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false))
    }, 300)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [search])

  const isAvailable = (m) => m.is_active && m.stock > 0

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: 'var(--pv-bg)' }}>
      <Navbar />

      <header className="py-4 text-center">
        <div className="container">
          <h1 className="h2 mb-2">Hacer pedido</h1>
          <p className="text-muted mb-3">
            Paso 1: Seleccioná el tipo de chapa o material para tu pliegue
          </p>
          <input
            type="search"
            className="form-control form-control-lg mx-auto shadow-sm"
            style={{ maxWidth: '420px', borderRadius: '12px' }}
            placeholder="Buscar material (ej. Galvanizada, Negra, Inox)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <section className="py-4 flex-grow-1">
        <div className="container">
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-2 text-muted">Cargando materiales disponibles...</p>
            </div>
          )}

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {!loading && !error && materials.length === 0 && (
            <p className="text-center text-muted">
              No se encontraron materiales disponibles.
            </p>
          )}

          <div className="row g-4">
            {!loading &&
              !error &&
              materials.map((m) => (
                <div key={m.id} className="col-md-4">
                  <div className="sketch-card h-100 p-4 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h5 className="text-white mb-0">{m.name}</h5>
                        {isAvailable(m) ? (
                          <span className="badge bg-success">Disponible</span>
                        ) : (
                          <span className="badge bg-secondary">Sin stock</span>
                        )}
                      </div>
                      <ul className="list-unstyled text-white-50 small mb-4">
                        <li><strong>Espesor:</strong> {m.thickness_mm} mm</li>
                        <li><strong>Ancho máx:</strong> {m.max_width_mm} mm</li>
                        <li><strong>Largo máx:</strong> {m.max_length_mm} mm</li>
                        <li><strong>Stock disponible:</strong> {m.stock} unidades</li>
                      </ul>
                    </div>

                    <div className="d-flex gap-2">
                      {isAvailable(m) ? (
                        <Link
                          to={`/pedidos/nuevo?material=${m.id}`}
                          className="sketch-btn-light w-100 text-center text-decoration-none"
                        >
                          Elegir y cargar medidas →
                        </Link>
                      ) : (
                        <button className="sketch-btn-outline w-100 text-center opacity-50" disabled>
                          No disponible
                        </button>
                      )}
                      <Link
                        to={`/materials/${m.id}`}
                        className="sketch-btn-outline btn-sm py-2 px-3 text-center text-decoration-none"
                        title="Ver ficha técnica"
                      >
                        🔍
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Materials
