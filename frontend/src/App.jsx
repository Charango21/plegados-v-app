import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import AdminRoute from './components/AdminRoute'
import Home from './views/Home'
import Login from './views/Login'
import Register from './views/Register'
import Materials from './views/Materials'
import MaterialDetail from './views/MaterialDetail'
import OrderCreate from './views/OrderCreate'
import MyOrders from './views/MyOrders'
import Profile from './views/Profile'
import AdminPanel from './views/AdminPanel'
import NotFound from './views/NotFound'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ================= VISTAS PÚBLICAS ================= */}
          {/* Pantalla 1 del boceto (Home) */}
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

          {/* Catálogo de chapas y detalle (Paso 2 TP9) */}
          <Route path="/materials" element={<Materials />} />
          <Route path="/materials/:id" element={<MaterialDetail />} />

          {/* Explorar confección de pedido (público para configurar medidas) */}
          <Route path="/hacer-pedido" element={<OrderCreate />} />

          {/* ================= VISTAS AUTENTICADAS (Paso 5: ProtectedRoute) ================= */}
          {/* Creación de pedido / Checkout formal protegido */}
          <Route
            path="/pedidos/nuevo"
            element={
              <ProtectedRoute>
                <OrderCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <OrderCreate />
              </ProtectedRoute>
            }
          />

          {/* Historial de pedidos del cliente (Pantalla 4 del boceto) */}
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

          {/* Perfil de usuario (Ver y editar datos personales) */}
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Navigate to="/perfil" replace />
              </ProtectedRoute>
            }
          />

          {/* ================= VISTAS DE ADMINISTRACIÓN (Paso 5: AdminRoute) ================= */}
          {/* Solo accesible para roles Staff: 'jefe' o 'empleado' */}
          <Route
            path="/admin-panel"
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            }
          />

          {/* ================= RUTA 404 NO ENCONTRADA ================= */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
