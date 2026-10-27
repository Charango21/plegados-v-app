import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/useAuth'

function Profile() {
  const { user, apiFetch } = useAuth()
  const [profile, setProfile] = useState(null)
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    apiFetch('/profile/')
      .then(async (res) => {
        if (!res.ok) throw new Error('Error al cargar datos del perfil')
        return res.json()
      })
      .then((data) => {
        setProfile(data)
        setPhone(data.phone || '')
        setAddress(data.address || '')
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [apiFetch])

  const handleUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    try {
      const res = await apiFetch('/profile/', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          address: address.trim(),
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || 'Error al guardar cambios')
      }

      const updated = await res.json()
      setProfile(updated)
      setMessage('Datos personales actualizados correctamente.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: 'var(--pv-bg)' }}>
      <Navbar />

      <main className="py-5 flex-grow-1">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-9 col-lg-7">
              <div className="sketch-card p-4 p-md-5">
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                  <div>
                    <h1 className="h3 text-white mb-1">Mi Perfil</h1>
                    <span className="text-white-50 small">Consultá y editá tus datos personales</span>
                  </div>
                  {profile && (
                    <span className="badge bg-primary py-2 px-3 fs-6 text-capitalize">
                      Rol: {profile.role}
                    </span>
                  )}
                </div>

                {message && <div className="alert alert-success py-2 mb-4">{message}</div>}
                {error && <div className="alert alert-danger py-2 mb-4">{error}</div>}

                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-2 text-white-50">Cargando perfil...</p>
                  </div>
                ) : (
                  <form onSubmit={handleUpdate}>
                    <div className="row g-3 mb-3">
                      <div className="col-sm-6">
                        <label className="form-label text-white-50">Nombre de usuario</label>
                        <input
                          type="text"
                          className="form-control"
                          value={profile?.username || ''}
                          disabled
                          style={{ opacity: 0.7 }}
                        />
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label text-white-50">Correo electrónico</label>
                        <input
                          type="email"
                          className="form-control"
                          value={profile?.email || ''}
                          disabled
                          style={{ opacity: 0.7 }}
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="phoneInput" className="form-label">
                        Teléfono de contacto
                      </label>
                      <input
                        type="tel"
                        id="phoneInput"
                        className="form-control"
                        placeholder="Ej: +54 9 11 1234-5678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={saving}
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="addressInput" className="form-label">
                        Dirección / Localidad
                      </label>
                      <input
                        type="text"
                        id="addressInput"
                        className="form-control"
                        placeholder="Ej: Av. Rivadavia 1234, CABA"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        disabled={saving}
                      />
                    </div>

                    <div className="p-3 mb-4 rounded bg-dark border border-secondary text-white-50 small">
                      <p className="mb-1">
                        <strong>Miembro desde:</strong> {formatDate(profile?.created_at)}
                      </p>
                      <p className="mb-0">
                        Los datos de teléfono y dirección facilitan la coordinación y entrega de tus pedidos de pliegues.
                      </p>
                    </div>

                    <button type="submit" className="sketch-btn-light w-100 py-2" disabled={saving}>
                      {saving ? (
                        <span>
                          <span className="spinner-border spinner-border-sm me-2" role="status" />
                          Guardando cambios...
                        </span>
                      ) : (
                        'Guardar cambios'
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Profile
