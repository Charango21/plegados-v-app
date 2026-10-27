import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/useAuth'

function MyOrders() {
  const { user, apiFetch } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedOrderId, setExpandedOrderId] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError('')
    apiFetch('/orders/')
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Error al cargar la lista de pedidos')
        }
        return res.json()
      })
      .then((data) => {
        setOrders(data.results || data || [])
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [apiFetch])

  const toggleExpand = (id) => {
    setExpandedOrderId((prev) => (prev === id ? null : id))
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmado':
        return <span className="badge bg-primary">Confirmado</span>
      case 'en_produccion':
        return <span className="badge bg-info text-dark">En Producción</span>
      case 'finalizado':
        return <span className="badge bg-success">Finalizado</span>
      case 'cancelado':
        return <span className="badge bg-danger">Cancelado</span>
      case 'pendiente':
      default:
        return <span className="badge bg-warning text-dark">Pendiente</span>
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: 'var(--pv-bg)' }}>
      <Navbar />

      <main className="py-5 flex-grow-1">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <h1 className="h2 mb-0">Mis pedidos</h1>
            <Link to="/hacer-pedido" className="sketch-btn-primary text-decoration-none">
              + Nuevo pedido
            </Link>
          </div>

          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-2 text-muted">Cargando historial de pedidos...</p>
            </div>
          )}

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="sketch-card p-5 text-center">
              <h4 className="text-white mb-3">Todavía no realizaste ningún pedido</h4>
              <p className="text-white-50 mb-4">
                Configurá las medidas de tu chapa y envianos tu primer pedido de pliegues.
              </p>
              <Link to="/hacer-pedido" className="sketch-btn-light text-decoration-none">
                Hacer mi primer pedido
              </Link>
            </div>
          )}

          {!loading && !error && orders.length > 0 && (
            <div className="sketch-card p-3 p-md-4 overflow-hidden">
              <div className="table-responsive">
                <table className="table sketch-table mb-0 align-middle">
                  <thead>
                    <tr>
                      <th scope="col" style={{ width: '15%' }}>ID PEDIDO</th>
                      <th scope="col" style={{ width: '35%' }}>ÍTEMS / DETALLE</th>
                      <th scope="col" style={{ width: '20%' }}>ESTADO</th>
                      <th scope="col" style={{ width: '20%' }}>FECHA</th>
                      <th scope="col" style={{ width: '10%' }} className="text-end">ACCIÓN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const isExpanded = expandedOrderId === order.id
                      const itemsCount = order.items?.length || 0
                      return (
                        <tr key={order.id}>
                          <td className="fw-bold text-white">#{order.id}</td>
                          <td>
                            {itemsCount > 0 ? (
                              <span>
                                {itemsCount} {itemsCount === 1 ? 'ítem' : 'ítems'}
                                {order.items[0]?.shape && ` (${order.items[0].shape})`}
                              </span>
                            ) : (
                              <span className="text-muted">Sin ítems</span>
                            )}
                          </td>
                          <td>{getStatusBadge(order.status)}</td>
                          <td className="text-white-50 small">{formatDate(order.created_at)}</td>
                          <td className="text-end">
                            {itemsCount > 0 && (
                              <button
                                type="button"
                                className="sketch-btn-outline btn-sm py-1 px-2"
                                onClick={() => toggleExpand(order.id)}
                              >
                                {isExpanded ? 'Ocultar' : 'Ver'}
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Detalle expandido del pedido seleccionado */}
              {expandedOrderId && (() => {
                const order = orders.find((o) => o.id === expandedOrderId)
                if (!order || !order.items?.length) return null

                return (
                  <div className="mt-4 p-4 sketch-inner-box">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0 fw-bold">Detalle del Pedido #{order.id}</h5>
                      <button
                        type="button"
                        className="btn-close"
                        aria-label="Close"
                        onClick={() => setExpandedOrderId(null)}
                      />
                    </div>

                    {order.notes && (
                      <p className="small text-muted mb-3">
                        <strong>Notas del cliente:</strong> {order.notes}
                      </p>
                    )}

                    <div className="row g-3">
                      {order.items.map((item, idx) => (
                        <div key={item.id || idx} className="col-md-6">
                          <div className="card h-100 shadow-sm border-0 bg-light">
                            <div className="card-body">
                              <h6 className="card-title fw-bold mb-2">
                                Ítem #{idx + 1} - {item.shape || 'Pieza'}
                              </h6>
                              <ul className="list-unstyled small mb-2 text-muted">
                                <li><strong>Medidas:</strong> {item.width_mm} mm x {item.length_mm} mm</li>
                                <li><strong>Espesor:</strong> {item.thickness_mm} mm</li>
                                {item.folds && <li><strong>Pliegues:</strong> {item.folds}</li>}
                              </ul>
                              {item.blueprint && (
                                <div className="mt-2">
                                  <a
                                    href={item.blueprint}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-outline-dark btn-sm"
                                  >
                                    Ver plano adjunto ↗
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default MyOrders
