import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import logo from '../assets/PV.png'
import localPhoto from '../assets/local-plegados-verdini.jpg'

function Home() {
  const { user, apiFetch } = useAuth()
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    apiFetch('/orders/')
      .then((res) => {
        if (!res.ok) throw new Error('No se pudieron cargar los pedidos')
        return res.json()
      })
      .then((data) => {
        if (data) setOrders(data.results || data || [])
      })
      .catch((err) => setError(err.message))
  }, [user, apiFetch])

  const ROLE_LABELS = { jefe: 'Jefe', empleado: 'Empleado', cliente: 'Cliente' }

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: 'var(--pv-bg)' }}>
      <Navbar />

      {/* Hero del Boceto (Pantalla 1) */}
      <header className="py-5 text-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-10 col-lg-8">
              {/* Logo superior */}
              <img
                src={logo}
                alt="PLEGADOS VERDINI"
                height="170"
                className="mb-3"
              />

              {user && (
                <div className="mb-3">
                  <span className="badge bg-dark py-2 px-3 fs-6">
                    Hola, {user.username} ({ROLE_LABELS[user.role] || user.role})
                  </span>
                </div>
              )}

              {/* Imagen del local completa y más pequeña (recuadro Foto del boceto) */}
              <div className="mb-4 text-center">
                <div
                  className="d-inline-block shadow-sm overflow-hidden"
                  style={{
                    borderRadius: '26px',
                    border: '1px solid #e0e0e0',
                    maxWidth: '380px',
                    width: '100%',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <img
                    src={localPhoto}
                    alt="Fachada del local Plegados Verdini"
                    className="img-fluid"
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      objectFit: 'contain',
                    }}
                  />
                </div>
              </div>

              {/* Recuadro oscuro con la descripción (Características del boceto) */}
              <div className="sketch-card p-4 p-md-5 mb-4 text-center">
                <h1 className="h2 text-white mb-3">Pliegues de chapa a medida para tu proyecto</h1>
                <p className="text-white-50 lead mb-0">
                  Cargá las medidas de tu pieza, seleccioná la chapa disponible y subí tu plano. Realizamos pliegues de alta precisión según tus requerimientos.
                </p>
              </div>

              {/* Botones de acción del boceto */}
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Link to="/hacer-pedido" className="sketch-btn-primary text-decoration-none">
                  Hacer mi pedido
                </Link>
                <Link to="/materials" className="sketch-btn-outline text-decoration-none text-dark border-dark">
                  Catálogo de Chapas
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sección interactiva con los servicios */}
      <section className="py-5 flex-grow-1" id="servicios">
        <div className="container">
          {error && <div className="alert alert-warning mb-4">{error}</div>}

          {user && orders.length > 0 && (
            <div className="mb-5">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">Tus pedidos recientes ({orders.length})</h4>
                <Link to="/mis-pedidos" className="btn btn-outline-dark btn-sm">
                  Ver todos →
                </Link>
              </div>
              <div className="row g-3">
                {orders.slice(0, 2).map((order) => (
                  <div key={order.id} className="col-md-6">
                    <div className="sketch-card p-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <h6 className="text-white mb-0">Pedido #{order.id}</h6>
                        <span className="badge bg-secondary">{order.status}</span>
                      </div>
                      <p className="small text-white-50 mt-2 mb-0">
                        {order.items?.length || 0} ítems registrados
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="row g-4">
            <div className="col-md-4">
              <div className="sketch-card h-100 p-4">
                <h5 className="text-white mb-2">📐 Servicios</h5>
                <p className="text-white-50 mb-0">
                  Realizamos pliegues de chapa según tus medidas, espesor y forma específica (U, L, Z, bandejas).
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="sketch-card h-100 p-4">
                <h5 className="text-white mb-2">📋 Cómo pedir</h5>
                <p className="text-white-50 mb-0">
                  Ingresá a hacer pedido, elegí el tipo de chapa, completá las medidas y adjuntá tu dibujo o plano.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="sketch-card h-100 p-4">
                <h5 className="text-white mb-2">⚡ Calidad y Precisión</h5>
                <p className="text-white-50 mb-0">
                  Pliegues de alta calidad industrial realizados por personal especializado con maquinaria precisa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Home
