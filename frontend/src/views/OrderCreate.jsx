import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/useAuth'
import { apiGet } from '../api'

function OrderCreate() {
  const { user, apiFetch } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedMaterialId = searchParams.get('material')

  const [materials, setMaterials] = useState([])
  const [selectedMaterialId, setSelectedMaterialId] = useState(preselectedMaterialId || '')
  const [selectedMaterial, setSelectedMaterial] = useState(null)

  // Campos del formulario (boceto "Mi pedido")
  const [width, setWidth] = useState('')
  const [length, setLength] = useState('')
  const [thickness, setThickness] = useState('')
  const [shape, setShape] = useState('')
  const [folds, setFolds] = useState('')
  const [notes, setNotes] = useState('')
  const [blueprintFile, setBlueprintFile] = useState(null)
  const [blueprintPreview, setBlueprintPreview] = useState(null)

  // Estados de interfaz
  const [loadingMaterials, setLoadingMaterials] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successOrder, setSuccessOrder] = useState(null)

  // Cargar lista de materiales disponibles
  useEffect(() => {
    setLoadingMaterials(true)
    apiGet('/sheet-materials/')
      .then((data) => {
        const list = data.results || data || []
        setMaterials(list)
        if (preselectedMaterialId) {
          const found = list.find((m) => String(m.id) === String(preselectedMaterialId))
          if (found) {
            setSelectedMaterial(found)
            setSelectedMaterialId(found.id)
            setThickness(found.thickness_mm)
          }
        } else if (list.length > 0) {
          const firstAvailable = list.find((m) => m.is_active && m.stock > 0) || list[0]
          setSelectedMaterial(firstAvailable)
          setSelectedMaterialId(firstAvailable.id)
          setThickness(firstAvailable.thickness_mm)
        }
      })
      .catch((err) => setError('No se pudieron cargar los materiales: ' + err.message))
      .finally(() => setLoadingMaterials(false))
  }, [preselectedMaterialId])

  // Actualizar material seleccionado
  const handleMaterialChange = (materialId) => {
    setSelectedMaterialId(materialId)
    const found = materials.find((m) => String(m.id) === String(materialId))
    setSelectedMaterial(found || null)
    if (found) {
      setThickness(found.thickness_mm)
    }
  }

  // Previsualización del archivo de dibujo/plano
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setBlueprintFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setBlueprintPreview(reader.result)
      }
      reader.readAsDataURL(file)
    } else {
      setBlueprintFile(null)
      setBlueprintPreview(null)
    }
  }

  // Validaciones
  const numWidth = parseFloat(width) || 0
  const numLength = parseFloat(length) || 0
  const exceedsMaxWidth = selectedMaterial && numWidth > parseFloat(selectedMaterial.max_width_mm)
  const exceedsMaxLength = selectedMaterial && numLength > parseFloat(selectedMaterial.max_length_mm)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/hacer-pedido' } } })
      return
    }

    if (!selectedMaterialId) {
      setError('Por favor, seleccioná una chapa para tu pedido.')
      return
    }

    if (!width || !length || !shape) {
      setError('Por favor completá los campos obligatorios: Ancho, Largo y Forma.')
      return
    }

    if (exceedsMaxWidth || exceedsMaxLength) {
      setError('Las medidas superan los límites permitidos para la chapa seleccionada.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // 1. Crear el Pedido (Order)
      const orderRes = await apiFetch('/orders/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notes.trim() }),
      })

      if (!orderRes.ok) {
        const errData = await orderRes.json().catch(() => ({}))
        throw new Error(errData.detail || 'Error al crear el pedido')
      }

      const orderData = await orderRes.json()

      // 2. Crear el Item del Pedido (OrderItem) con medidas y plano
      const formData = new FormData()
      formData.append('order', orderData.id)
      formData.append('sheet_material', selectedMaterialId)
      formData.append('width_mm', numWidth)
      formData.append('length_mm', numLength)
      formData.append('thickness_mm', parseFloat(thickness) || selectedMaterial.thickness_mm)
      formData.append('shape', shape.trim())
      formData.append('folds', folds.trim())
      if (blueprintFile) {
        formData.append('blueprint', blueprintFile)
      }

      const itemRes = await apiFetch('/order-items/', {
        method: 'POST',
        body: formData,
      })

      if (!itemRes.ok) {
        const itemErr = await itemRes.json().catch(() => ({}))
        const msg = itemErr.detail || itemErr.sheet_material?.[0] || 'Error al guardar el ítem del pedido'
        throw new Error(msg)
      }

      setSuccessOrder(orderData)
    } catch (err) {
      setError(err.message || 'Ocurrió un error al procesar el pedido')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: 'var(--pv-bg)' }}>
      <Navbar />

      <main className="py-5 flex-grow-1">
        <div className="container">
          {successOrder ? (
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="sketch-card p-5 text-center">
                  <div className="display-4 text-success mb-3">✓</div>
                  <h2 className="text-white mb-2">¡Pedido creado con éxito!</h2>
                  <p className="text-white-50 mb-4">
                    Tu pedido ha sido registrado con el identificador <strong>#{successOrder.id}</strong> en estado <em>Pendiente</em>.
                    El taller lo revisará a la brevedad.
                  </p>
                  <div className="d-flex justify-content-center gap-3 flex-wrap">
                    <Link to="/mis-pedidos" className="sketch-btn-light text-decoration-none">
                      Ver mis pedidos
                    </Link>
                    <button
                      type="button"
                      className="sketch-btn-outline"
                      onClick={() => {
                        setSuccessOrder(null)
                        setWidth('')
                        setLength('')
                        setShape('')
                        setFolds('')
                        setNotes('')
                        setBlueprintFile(null)
                        setBlueprintPreview(null)
                      }}
                    >
                      Hacer otro pedido
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="row justify-content-center">
              <div className="col-12 col-xl-11">
                <div className="sketch-card p-4 p-md-5">
                  <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <div>
                      <h1 className="h2 text-white mb-0">Mi pedido</h1>
                      <span className="text-white-50 small">
                        Completá las medidas y especificaciones del pliegue
                      </span>
                    </div>
                    <Link to="/materials" className="sketch-btn-outline btn-sm text-decoration-none">
                      Ver catálogo de chapas ↗
                    </Link>
                  </div>

                  {error && (
                    <div className="alert alert-danger py-2 mb-4" role="alert">
                      {error}
                    </div>
                  )}

                  {!user && (
                    <div className="alert alert-warning py-2 mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <span>Para enviar el pedido necesitás estar registrado o iniciar sesión.</span>
                      <Link to="/login" className="btn btn-dark btn-sm">
                        Iniciar sesión
                      </Link>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} noValidate>
                    <div className="row g-4">
                      {/* Lado izquierdo del boceto: Formulario de medidas */}
                      <div className="col-lg-6">
                        <div className="mb-3">
                          <label htmlFor="materialSelect" className="form-label">
                            Tipo de Chapa / Material *
                          </label>
                          <select
                            id="materialSelect"
                            className="form-select"
                            value={selectedMaterialId}
                            onChange={(e) => handleMaterialChange(e.target.value)}
                            disabled={loadingMaterials || isSubmitting}
                          >
                            {loadingMaterials && <option>Cargando materiales...</option>}
                            {materials.map((m) => (
                              <option
                                key={m.id}
                                value={m.id}
                                disabled={!m.is_active || m.stock <= 0}
                              >
                                {m.name} ({m.thickness_mm} mm) {(!m.is_active || m.stock <= 0) ? '- (Sin stock)' : `[Stock: ${m.stock}]`}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="row g-2 mb-3">
                          <div className="col-6">
                            <label htmlFor="width" className="form-label">
                              Ancho (mm) *
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              className={`form-control ${exceedsMaxWidth ? 'is-invalid' : ''}`}
                              id="width"
                              placeholder="Ej: 500"
                              value={width}
                              onChange={(e) => setWidth(e.target.value)}
                              disabled={isSubmitting}
                            />
                            {exceedsMaxWidth && (
                              <div className="invalid-feedback">
                                Supera el ancho máx ({selectedMaterial?.max_width_mm} mm)
                              </div>
                            )}
                          </div>
                          <div className="col-6">
                            <label htmlFor="length" className="form-label">
                              Largo (mm) *
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              className={`form-control ${exceedsMaxLength ? 'is-invalid' : ''}`}
                              id="length"
                              placeholder="Ej: 1200"
                              value={length}
                              onChange={(e) => setLength(e.target.value)}
                              disabled={isSubmitting}
                            />
                            {exceedsMaxLength && (
                              <div className="invalid-feedback">
                                Supera el largo máx ({selectedMaterial?.max_length_mm} mm)
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="row g-2 mb-3">
                          <div className="col-6">
                            <label htmlFor="thickness" className="form-label">
                              Espesor (mm)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              className="form-control"
                              id="thickness"
                              value={thickness}
                              onChange={(e) => setThickness(e.target.value)}
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="col-6">
                            <label htmlFor="shape" className="form-label">
                              Forma *
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="shape"
                              placeholder="Ej: U, L, Z, Bandeja"
                              value={shape}
                              onChange={(e) => setShape(e.target.value)}
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>

                        <div className="mb-3">
                          <label htmlFor="folds" className="form-label">
                            Pliegues / Detalle
                          </label>
                          <textarea
                            className="form-control"
                            id="folds"
                            rows="2"
                            placeholder="Descripción de los pliegues (ángulos, caras, medidas internas)..."
                            value={folds}
                            onChange={(e) => setFolds(e.target.value)}
                            disabled={isSubmitting}
                          />
                        </div>

                        <div className="mb-4">
                          <label htmlFor="blueprint" className="form-label">
                            Subir plano o dibujo (imagen)
                          </label>
                          <input
                            type="file"
                            className="form-control"
                            id="blueprint"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={isSubmitting}
                          />
                        </div>

                        <button
                          type="submit"
                          className="sketch-btn-light w-100 py-3"
                          disabled={isSubmitting || exceedsMaxWidth || exceedsMaxLength}
                        >
                          {isSubmitting ? (
                            <span>
                              <span className="spinner-border spinner-border-sm me-2" role="status" />
                              Enviando pedido...
                            </span>
                          ) : (
                            'Confirmar pedido'
                          )}
                        </button>
                      </div>

                      {/* Lado derecho del boceto: Recuadro interior blanco/claro con ficha y preview */}
                      <div className="col-lg-6 d-flex flex-column">
                        <div className="sketch-inner-box flex-grow-1 d-flex flex-column justify-content-between">
                          <div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h5 className="mb-0 fw-bold">Chapa a utilizar</h5>
                              {selectedMaterial && (
                                <span className={`badge ${selectedMaterial.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
                                  {selectedMaterial.stock > 0 ? `Stock: ${selectedMaterial.stock}` : 'Sin stock'}
                                </span>
                              )}
                            </div>

                            {selectedMaterial ? (
                              <table className="table table-sm table-borderless mb-4">
                                <tbody>
                                  <tr>
                                    <th className="text-muted" style={{ width: '45%' }}>Material:</th>
                                    <td className="fw-semibold">{selectedMaterial.name}</td>
                                  </tr>
                                  <tr>
                                    <th className="text-muted">Espesor:</th>
                                    <td>{selectedMaterial.thickness_mm} mm</td>
                                  </tr>
                                  <tr>
                                    <th className="text-muted">Ancho máximo:</th>
                                    <td>{selectedMaterial.max_width_mm} mm</td>
                                  </tr>
                                  <tr>
                                    <th className="text-muted">Largo máximo:</th>
                                    <td>{selectedMaterial.max_length_mm} mm</td>
                                  </tr>
                                </tbody>
                              </table>
                            ) : (
                              <p className="text-muted">Seleccioná un material de la lista para ver sus especificaciones.</p>
                            )}

                            <hr className="my-3" />

                            <h6 className="fw-bold mb-2">Vista previa del plano</h6>
                            {blueprintPreview ? (
                              <div className="text-center p-2 border rounded bg-light">
                                <img
                                  src={blueprintPreview}
                                  alt="Plano adjunto"
                                  className="img-fluid rounded"
                                  style={{ maxHeight: '180px', objectFit: 'contain' }}
                                />
                                <p className="small text-muted mt-1 mb-0">{blueprintFile?.name}</p>
                              </div>
                            ) : (
                              <div className="text-center py-4 border rounded border-dashed text-muted bg-light">
                                <span className="d-block mb-1">📐</span>
                                <span className="small">No se adjuntó dibujo o plano aún</span>
                              </div>
                            )}
                          </div>

                          <div className="mt-3 p-2 rounded bg-light small text-muted">
                            ℹ️ Si tus medidas no se adaptan al estándar, dejanos una aclaración en los pliegues o comunicate con el taller.
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
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

export default OrderCreate
