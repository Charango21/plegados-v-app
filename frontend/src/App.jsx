import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import Home from './views/Home'
import Login from './views/Login'
import Register from './views/Register'
import Materials from './views/Materials'
import MaterialDetail from './views/MaterialDetail'
import OrderCreate from './views/OrderCreate'
import MyOrders from './views/MyOrders'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública principal (Pantalla 1 del boceto) */}
          <Route path="/" element={<Home />} />

          {/* Autenticación (Pantallas 2 y 3 del boceto) */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Hacer pedido / Mi pedido (Pantalla 5 del boceto) */}
          <Route path="/hacer-pedido" element={<OrderCreate />} />
          <Route path="/pedidos/nuevo" element={<OrderCreate />} />

          {/* Explorar materiales y detalle (Paso 2 TP9) */}
          <Route path="/materials" element={<Materials />} />
          <Route path="/materials/:id" element={<MaterialDetail />} />

          {/* Historial de pedidos (Pantalla 4 del boceto) */}
          <Route
            path="/mis-pedidos"
            element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Navigate to="/mis-pedidos" replace />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
