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
        .then((data) => setMaterials(data.results || data))
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
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <header className="bg-dark text-white text-center py-4">
        <div className="container">
          <h1 className="mb-2">Hacer Pedido</h1>
          <p className="text-white-50 mb-3">
            Seleccioná el tipo de material disponible para tu pliegue
          </p>
          <input
            type="search"
            className="form-control form-control-lg mx-auto"
            style={{ maxWidth: '420px' }}
            placeholder="Buscar material (ej. Galvanizada, Negra, Inox)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>
      <section className="py-5 flex-grow-1 bg-light">
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
                  <div className={`card h-100 ${!isAvailable(m) ? 'border-secondary' : ''}`}>
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <h5 className="card-title">{m.name}</h5>
                        {!isAvailable(m) && (
                          <span className="badge bg-secondary">No disponible</span>
                        )}
                      </div>
                      <ul className="list-unstyled mt-3 mb-0 text-muted">
                        <li>Espesor: {m.thickness_mm} mm</li>
                        <li>Ancho máx: {m.max_width_mm} mm</li>
                        <li>Largo máx: {m.max_length_mm} mm</li>
                        <li>Stock: {m.stock}</li>
                      </ul>
                    </div>
                    <div className="card-footer bg-white">
                      <Link to={`/materials/${m.id}`} className="btn btn-outline-primary w-100">
                        {isAvailable(m) ? 'Elegir este material' : 'Ver detalle'}
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
