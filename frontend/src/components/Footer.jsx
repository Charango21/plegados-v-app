function Footer() {
  return (
    <footer className="text-white text-center py-4 mt-auto" style={{ backgroundColor: 'var(--pv-card-bg)', borderTop: '1px solid #232323' }}>
      <div className="container">
        <p className="mb-1 fw-bold" style={{ letterSpacing: '1px' }}>PLEGADOS VERDINI</p>
        <p className="mb-0 text-white-50 small">Plegados y cortes de chapa a medida &copy; {new Date().getFullYear()}</p>
      </div>
    </footer>
  )
}

export default Footer
