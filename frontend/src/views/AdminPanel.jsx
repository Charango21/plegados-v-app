import { useState, useEffect, useCallback } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/useAuth'
import { apiGet, apiPost, apiPatch, apiDelete } from '../api'

function AdminPanel() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('materials') // 'materials' | 'orders' | 'users'

  // ===================== ESTADOS: MATERIALES (CRUD) =====================
  const [materials, setMaterials] = useState([])
  const [loadingMaterials, setLoadingMaterials] = useState(false)
  const [materialError, setMaterialError] = useState('')
  const [materialSuccess, setMaterialSuccess] = useState('')

  // Formulario Material (Crear / Editar)
  const [isEditingMaterial, setIsEditingMaterial] = useState(false)
  const [editingMaterialId, setEditingMaterialId] = useState(null)
  const [showMaterialModal, setShowMaterialModal] = useState(false)
  const [matForm, setMatForm] = useState({
    name: '',
    thickness_mm: '',
    max_width_mm: '',
    max_length_mm: '',
    stock: 0,
    is_active: true,
  })

  // ===================== ESTADOS: PEDIDOS =====================
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [orderSuccess, setOrderSuccess] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null)

  // ===================== ESTADOS: USUARIOS =====================
  const [usersList, setUsersList] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [userError, setUserError] = useState('')

  // ===================== CARGAR MATERIALES =====================
  const fetchMaterials = useCallback(async () => {
    setLoadingMaterials(true)
    setMaterialError('')
    try {
      const data = await apiGet('/sheet-materials/')
      setMaterials(data.results || data || [])
    } catch (err) {
      setMaterialError(err.message)
    } finally {
      setLoadingMaterials(false)
    }
  }, [])

  // ===================== CARGAR PEDIDOS =====================
  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true)
    setOrderError('')
    try {
      const data = await apiGet('/orders/')
      setOrders(data.results || data || [])
    } catch (err) {
      setOrderError(err.message)
    } finally {
      setLoadingOrders(false)
    }
  }, [])

  // ===================== CARGAR USUARIOS =====================
  const fetchUsers = useCallback(async () => {
    if (user?.role !== 'jefe') return
    setLoadingUsers(true)
    setUserError('')
    try {
      const data = await apiGet('/users/')
      setUsersList(data.results || data || [])
    } catch (err) {
      setUserError(err.message)
    } finally {
      setLoadingUsers(false)
    }
  }, [user])

  useEffect(() => {
    fetchMaterials()
    fetchOrders()
    if (user?.role === 'jefe') {
      fetchUsers()
    }
  }, [fetchMaterials, fetchOrders, fetchUsers, user])

  // ===================== ACCIONES: MATERIALES =====================
  const handleOpenCreateMaterial = () => {
    setIsEditingMaterial(false)
    setEditingMaterialId(null)
    setMatForm({
      name: '',
      thickness_mm: '',
      max_width_mm: '',
      max_length_mm: '',
      stock: 10,
      is_active: true,
    })
    setShowMaterialModal(true)
    setMaterialError('')
    setMaterialSuccess('')
  }

  const handleOpenEditMaterial = (m) => {
    setIsEditingMaterial(true)
    setEditingMaterialId(m.id)
    setMatForm({
      name: m.name,
      thickness_mm: m.thickness_mm,
      max_width_mm: m.max_width_mm,
      max_length_mm: m.max_length_mm,
      stock: m.stock,
      is_active: m.is_active,
    })
    setShowMaterialModal(true)
    setMaterialError('')
    setMaterialSuccess('')
  }

  const handleSaveMaterial = async (e) => {
    e.preventDefault()
    setMaterialError('')
    setMaterialSuccess('')

    const payload = {
      name: matForm.name.trim(),
      thickness_mm: parseFloat(matForm.thickness_mm),
      max_width_mm: parseFloat(matForm.max_width_mm),
      max_length_mm: parseFloat(matForm.max_length_mm),
      stock: parseInt(matForm.stock, 10) || 0,
      is_active: matForm.is_active,
    }

    if (!payload.name || !payload.thickness_mm || !payload.max_width_mm || !payload.max_length_mm) {
      setMaterialError('Completá todos los campos numéricos y el nombre')
      return
    }

    try {
      if (isEditingMaterial) {
        await apiPatch(`/sheet-materials/${editingMaterialId}/`, payload)
        setMaterialSuccess('Material actualizado correctamente')
      } else {
        await apiPost('/sheet-materials/', payload)
        setMaterialSuccess('Material creado correctamente')
      }
      setShowMaterialModal(false)
      fetchMaterials()
    } catch (err) {
      setMaterialError(err.message)
    }
  }

  const handleDeleteMaterial = async (id, name) => {
    if (!window.confirm(`¿Estás seguro de eliminar el material "${name}"?`)) return
    setMaterialError('')
    setMaterialSuccess('')
    try {
      await apiDelete(`/sheet-materials/${id}/`)
      setMaterialSuccess(`Material "${name}" eliminado`)
      fetchMaterials()
    } catch (err) {
      setMaterialError('No se pudo eliminar el material: ' + err.message)
    }
  }

  // ===================== ACCIONES: PEDIDOS =====================
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setOrderError('')
    setOrderSuccess('')
    try {
      await apiPatch(`/orders/${orderId}/`, { status: newStatus })
      setOrderSuccess(`Pedido #${orderId} actualizado a "${newStatus}"`)
      fetchOrders()
    } catch (err) {
      setOrderError(`Error al actualizar el estado del pedido #${orderId}: ${err.message}`)
    }
  }

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'todos') return true
    return o.status === statusFilter
  })

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

      <main className="py-4 flex-grow-1">
        <div className="container">
          {/* Header Panel */}
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <div>
              <h1 className="h3 mb-0">Panel de Administración</h1>
              <span className="text-muted small">
                Gestión operativa del taller Plegados Verdini • Usuario: <strong>{user?.username}</strong> (
                <span className="badge bg-dark">{user?.role}</span>)
              </span>
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                className={`sketch-btn-outline btn-sm ${activeTab === 'materials' ? 'active bg-dark text-white' : 'text-dark border-dark'}`}
                onClick={() => setActiveTab('materials')}
              >
                📦 Materiales (Chapas)
              </button>
              <button
                type="button"
                className={`sketch-btn-outline btn-sm ${activeTab === 'orders' ? 'active bg-dark text-white' : 'text-dark border-dark'}`}
                onClick={() => setActiveTab('orders')}
              >
                📋 Pedidos del Taller ({orders.length})
              </button>
              {user?.role === 'jefe' && (
                <button
                  type="button"
                  className={`sketch-btn-outline btn-sm ${activeTab === 'users' ? 'active bg-dark text-white' : 'text-dark border-dark'}`}
                  onClick={() => setActiveTab('users')}
                >
                  👥 Usuarios ({usersList.length})
                </button>
              )}
            </div>
          </div>

          {/* ===================== TAB 1: GESTIÓN DE MATERIALES ===================== */}
          {activeTab === 'materials' && (
            <section>
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h4 className="mb-0">Inventario de Chapas y Materiales</h4>
                <button type="button" className="sketch-btn-primary" onClick={handleOpenCreateMaterial}>
                  + Nueva Chapa
                </button>
              </div>

              {materialSuccess && <div className="alert alert-success py-2">{materialSuccess}</div>}
              {materialError && <div className="alert alert-danger py-2">{materialError}</div>}

              {loadingMaterials ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" />
                  <p className="mt-2 text-muted">Cargando catálogo de materiales...</p>
                </div>
              ) : (
                <div className="sketch-card p-3 p-md-4">
                  <div className="table-responsive">
                    <table className="table sketch-table align-middle mb-0">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>NOMBRE</th>
                          <th>ESPESOR</th>
                          <th>MEDIDAS MÁXIMAS</th>
                          <th>STOCK</th>
                          <th>ESTADO</th>
                          <th className="text-end">ACCIONES</th>
                        </tr>
                      </thead>
                      <tbody>
                        {materials.map((m) => (
                          <tr key={m.id}>
                            <td className="fw-bold text-white">#{m.id}</td>
                            <td className="fw-semibold">{m.name}</td>
                            <td>{m.thickness_mm} mm</td>
                            <td>
                              {m.max_width_mm} mm x {m.max_length_mm} mm
                            </td>
                            <td>
                              <span className={`badge ${m.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
                                {m.stock} unidades
                              </span>
                            </td>
                            <td>
                              {m.is_active ? (
                                <span className="badge bg-primary">Activo</span>
                              ) : (
                                <span className="badge bg-secondary">Inactivo</span>
                              )}
                            </td>
                            <td className="text-end">
                              <div className="btn-group btn-group-sm">
                                <button
                                  type="button"
                                  className="btn btn-outline-light btn-sm"
                                  onClick={() => handleOpenEditMaterial(m)}
                                >
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleDeleteMaterial(m.id, m.name)}
                                >
                                  Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {materials.length === 0 && (
                          <tr>
                            <td colSpan="7" className="text-center text-muted py-4">
                              No hay materiales registrados en el sistema.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ===================== TAB 2: GESTIÓN DE PEDIDOS ===================== */}
          {activeTab === 'orders' && (
            <section>
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h4 className="mb-0">Gestión de Pedidos de Clientes</h4>
                <div className="d-flex align-items-center gap-2">
                  <span className="small text-muted">Filtrar por estado:</span>
                  <select
                    className="form-select form-select-sm"
                    style={{ width: 'auto' }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="todos">Todos ({orders.length})</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="confirmado">Confirmados</option>
                    <option value="en_produccion">En Producción</option>
                    <option value="finalizado">Finalizados</option>
                    <option value="cancelado">Cancelados</option>
                  </select>
                </div>
              </div>

              {orderSuccess && <div className="alert alert-success py-2">{orderSuccess}</div>}
              {orderError && <div className="alert alert-danger py-2">{orderError}</div>}

              {loadingOrders ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" />
                  <p className="mt-2 text-muted">Cargando pedidos del taller...</p>
                </div>
              ) : (
                <div className="sketch-card p-3 p-md-4">
                  <div className="table-responsive">
                    <table className="table sketch-table align-middle mb-0">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>CLIENTE</th>
                          <th>FECHA</th>
                          <th>ÍTEMS</th>
                          <th>ESTADO ACTUAL</th>
                          <th>CAMBIAR ESTADO</th>
                          <th className="text-end">DETALLE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((o) => (
                          <tr key={o.id}>
                            <td className="fw-bold text-white">#{o.id}</td>
                            <td>{o.customer || 'Cliente'}</td>
                            <td className="small text-white-50">{formatDate(o.created_at)}</td>
                            <td>
                              <span className="badge bg-dark border border-secondary">
                                {o.items?.length || 0} ítems
                              </span>
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  o.status === 'finalizado'
                                    ? 'bg-success'
                                    : o.status === 'cancelado'
                                    ? 'bg-danger'
                                    : o.status === 'en_produccion'
                                    ? 'bg-info text-dark'
                                    : o.status === 'confirmado'
                                    ? 'bg-primary'
                                    : 'bg-warning text-dark'
                                }`}
                              >
                                {o.status}
                              </span>
                            </td>
                            <td>
                              <select
                                className="form-select form-select-sm"
                                style={{ maxWidth: '170px' }}
                                value={o.status}
                                onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                              >
                                <option value="pendiente">Pendiente</option>
                                <option value="confirmado">Confirmado</option>
                                <option value="en_produccion">En Producción</option>
                                <option value="finalizado">Finalizado</option>
                                <option value="cancelado">Cancelado</option>
                              </select>
                            </td>
                            <td className="text-end">
                              <button
                                type="button"
                                className="sketch-btn-outline btn-sm py-1 px-2"
                                onClick={() => setSelectedOrderDetails(o)}
                              >
                                Ver pieza 📐
                              </button>
                            </td>
                          </tr>
                        ))}
                        {filteredOrders.length === 0 && (
                          <tr>
                            <td colSpan="7" className="text-center text-muted py-4">
                              No hay pedidos que coincidan con el filtro seleccionado.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ===================== TAB 3: GESTIÓN DE USUARIOS (JEFE) ===================== */}
          {activeTab === 'users' && user?.role === 'jefe' && (
            <section>
              <h4 className="mb-3">Usuarios Registrados en el Sistema</h4>
              {userError && <div className="alert alert-danger py-2">{userError}</div>}

              {loadingUsers ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" />
                  <p className="mt-2 text-muted">Cargando usuarios...</p>
                </div>
              ) : (
                <div className="sketch-card p-3 p-md-4">
                  <div className="table-responsive">
                    <table className="table sketch-table align-middle mb-0">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>USUARIO</th>
                          <th>EMAIL</th>
                          <th>ROL</th>
                          <th>TELÉFONO</th>
                          <th>REGISTRADO</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersList.map((u) => (
                          <tr key={u.id}>
                            <td className="fw-bold text-white">#{u.id}</td>
                            <td className="fw-semibold">{u.username}</td>
                            <td>{u.email}</td>
                            <td>
                              <span
                                className={`badge ${
                                  u.role === 'jefe'
                                    ? 'bg-danger'
                                    : u.role === 'empleado'
                                    ? 'bg-primary'
                                    : 'bg-secondary'
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td>{u.phone || '-'}</td>
                            <td className="small text-white-50">{formatDate(u.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ===================== MODAL / OVERLAY: CREAR/EDITAR MATERIAL ===================== */}
          {showMaterialModal && (
            <div
              className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center p-3"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1050 }}
            >
              <div className="sketch-card p-4 p-md-5" style={{ maxWidth: '580px', width: '100%' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="text-white mb-0">
                    {isEditingMaterial ? 'Editar Chapa / Material' : 'Nueva Chapa / Material'}
                  </h4>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowMaterialModal(false)}
                  />
                </div>

                <form onSubmit={handleSaveMaterial}>
                  <div className="mb-3">
                    <label className="form-label">Nombre del Material / Chapa *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej: Chapa Galvanizada C22"
                      value={matForm.name}
                      onChange={(e) => setMatForm({ ...matForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label">Espesor (mm) *</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        placeholder="Ej: 0.70"
                        value={matForm.thickness_mm}
                        onChange={(e) => setMatForm({ ...matForm, thickness_mm: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Stock inicial *</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Ej: 15"
                        value={matForm.stock}
                        onChange={(e) => setMatForm({ ...matForm, stock: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label">Ancho Máximo (mm) *</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        placeholder="Ej: 1220"
                        value={matForm.max_width_mm}
                        onChange={(e) => setMatForm({ ...matForm, max_width_mm: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Largo Máximo (mm) *</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        placeholder="Ej: 2440"
                        value={matForm.max_length_mm}
                        onChange={(e) => setMatForm({ ...matForm, max_length_mm: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-check form-switch mb-4">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="isActiveSwitch"
                      checked={matForm.is_active}
                      onChange={(e) => setMatForm({ ...matForm, is_active: e.target.checked })}
                    />
                    <label className="form-check-label text-white" htmlFor="isActiveSwitch">
                      Disponible para pedidos de clientes
                    </label>
                  </div>

                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="sketch-btn-outline"
                      onClick={() => setShowMaterialModal(false)}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="sketch-btn-light">
                      {isEditingMaterial ? 'Guardar Cambios' : 'Crear Material'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ===================== MODAL: DETALLE DEL PEDIDO Y PLANO ===================== */}
          {selectedOrderDetails && (
            <div
              className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center p-3"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', zIndex: 1060 }}
            >
              <div
                className="sketch-card p-4 p-md-5 overflow-auto"
                style={{ maxWidth: '750px', width: '100%', maxHeight: '90vh' }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="text-white mb-0">Detalle del Pedido #{selectedOrderDetails.id}</h4>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setSelectedOrderDetails(null)}
                  />
                </div>

                <div className="mb-3 text-white-50 small">
                  <strong>Cliente:</strong> {selectedOrderDetails.customer} | <strong>Fecha:</strong>{' '}
                  {formatDate(selectedOrderDetails.created_at)}
                </div>

                {selectedOrderDetails.notes && (
                  <div className="p-3 mb-3 bg-dark rounded text-white-50 border border-secondary small">
                    <strong>Notas del cliente:</strong> {selectedOrderDetails.notes}
                  </div>
                )}

                <div className="row g-3">
                  {(selectedOrderDetails.items || []).map((item, idx) => (
                    <div key={item.id || idx} className="col-12">
                      <div className="sketch-inner-box">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="fw-bold mb-0">
                            Ítem #{idx + 1} - Forma: {item.shape || 'Pieza'}
                          </h6>
                          <span className="badge bg-dark">
                            {item.width_mm} mm x {item.length_mm} mm (e={item.thickness_mm} mm)
                          </span>
                        </div>

                        {item.folds && (
                          <p className="mb-2 small">
                            <strong>Detalle de pliegues:</strong> {item.folds}
                          </p>
                        )}

                        {item.blueprint ? (
                          <div className="mt-3 p-2 bg-light border rounded text-center">
                            <span className="d-block small text-muted mb-2">Plano o dibujo subido por el cliente:</span>
                            <img
                              src={item.blueprint}
                              alt="Plano"
                              className="img-fluid rounded shadow-sm"
                              style={{ maxHeight: '280px', objectFit: 'contain' }}
                            />
                            <div className="mt-2">
                              <a
                                href={item.blueprint}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-sm btn-dark"
                              >
                                Abrir en tamaño completo ↗
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2 text-muted small fst-italic">Sin archivo de plano adjunto.</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-end mt-4">
                  <button
                    type="button"
                    className="sketch-btn-outline"
                    onClick={() => setSelectedOrderDetails(null)}
                  >
                    Cerrar
                  </button>
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

export default AdminPanel
