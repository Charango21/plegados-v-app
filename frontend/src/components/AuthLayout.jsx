import Navbar from './Navbar'
import Footer from './Footer'

function AuthLayout({ title, intro, children }) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1 d-flex align-items-center bg-light py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-4">
              <div className="card shadow-sm">
                <div className="card-body p-4">
                  <h1 className="h3 mb-4 text-center">{title}</h1>
                  {children}
                  {intro}
                </div>
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