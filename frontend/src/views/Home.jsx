import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import logo from '../assets/PV.png'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

function Home() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('access')
    if (!token) return
    fetch(`${API_URL}/orders/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('No se pudieron cargar los pedidos')
        return res.json()
      })
      .then((data) => setOrders(data.results || data.value || data))
      .catch((err) => setError(err.message))
  }, [])

  const ROLE_LABELS = { jefe: 'Jefe', empleado: 'Empleado', cliente: 'Cliente' }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <header className="bg-dark text-white text-center py-5">
        <div className="container">
          <img
            src={logo}
            alt="PLEGADOS VERDINI"
            height="240"
            className="mb-4"
          />
          {user && (
            <h2 className="mb-3">
              Hola, {user.username} <span className="badge bg-secondary">{ROLE_LABELS[user.role] || user.role}</span>
            </h2>
          )}
          <p className="lead mb-4">
            Pliegues de chapa a medida para tu proyecto
          </p>
          <Link to="/register" className="btn btn-light btn-lg">
            Hacer un pedido
          </Link>
        </div>
      </header>
      <section className="bg-light py-5 flex-grow-1">
        <div className="container">
          {error && <div className="alert alert-warning">{error}</div>}
          {user && (
            <div className="mb-4">
              <h4>Tus pedidos ({orders.length})</h4>
              {orders.length === 0 && !error && (
                <p className="text-muted">Todavía no tenés pedidos.</p>
              )}
              <div className="row g-3">
                {orders.map((order) => (
                  <div key={order.id} className="col-md-6">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">Pedido #{order.id}</h5>
                        <span className={`badge ${
                          order.status === 'finalizado' ? 'bg-success' :
                          order.status === 'cancelado' ? 'bg-danger' :
                          'bg-warning text-dark'
                        }`}>
                          {order.status}
                        </span>
                        <p className="card-text mt-2 text-muted">
                          {order.items?.length || 0} ítems
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Servicios</h5>
                  <p className="card-text mb-0">
                    Realizamos pliegues de chapa según tus medidas, espesor y
                    forma.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Cómo pedir</h5>
                  <p className="card-text mb-0">
                    Registrate, cargá las medidas de tu pieza y subí el plano
                    del pliegue.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Nuestro trabajo</h5>
                  <p className="card-text mb-0">
                    Pliegues de alta calidad realizados por personal
                    especializado.
                  </p>
                </div>
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
