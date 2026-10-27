function Footer() {
  return (
    <footer className="text-white py-5 mt-auto" style={{ backgroundColor: 'var(--pv-card-bg)', borderTop: '1px solid #232323' }}>
      <div className="container">
        <div className="row g-4 justify-content-between align-items-center mb-4">
          <div className="col-md-4 text-center text-md-start">
            <h5 className="fw-bold mb-2" style={{ letterSpacing: '1px' }}>PLEGADOS VERDINI</h5>
            <p className="text-white-50 small mb-1">
              📍 <strong>Dirección:</strong> Cardonato 1121, San Rafael, Mendoza
            </p>
            <p className="text-white-50 small mb-1">
              📞 <strong>Teléfono:</strong> 2604-6050560
            </p>
            <p className="text-white-50 small mb-0">
              ✉️ <strong>Gmail:</strong> plegadosverdini@hotmail.com
            </p>
          </div>
          <div className="col-md-4 text-center">
            <h6 className="fw-bold mb-2 text-white">Horarios de Atención</h6>
            <p className="text-white-50 small mb-1">🕒 <strong>Lunes a Viernes:</strong> 8:30 a 17 hs</p>
            <p className="text-white-50 small mb-0">🕒 <strong>Sábados:</strong> 8:30 a 13 hs</p>
          </div>
          <div className="col-md-4 text-center text-md-end">
            <a
              href="https://maps.google.com/?q=Cardonato+1121+San+Rafael+Mendoza"
              target="_blank"
              rel="noopener noreferrer"
              className="sketch-btn-outline btn-sm text-decoration-none d-inline-block"
            >
              🗺️ Ver en Google Maps ↗
            </a>
          </div>
        </div>
        <hr className="border-secondary my-3" />
        <div className="text-center">
          <p className="mb-0 text-white-50 small">Plegados y cortes de chapa a medida &copy; {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
