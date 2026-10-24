import Navbar from './Navbar'
import Footer from './Footer'

function AuthLayout({ title, intro, children }) {
  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: 'var(--pv-bg)' }}>
      <Navbar />
      <main className="flex-grow-1 d-flex align-items-center py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-11 col-sm-9 col-md-6 col-lg-4">
              <div className="sketch-card p-4 p-md-5">
                <div className="text-center mb-4">
                  <h6 className="text-uppercase tracking-wider text-white-50 mb-1" style={{ letterSpacing: '2px' }}>
                    PLEGADOS VERDINI
                  </h6>
                  <h2 className="h4 text-white mb-0">{title}</h2>
                </div>
                {children}
                {intro}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default AuthLayout
