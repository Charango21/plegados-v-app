import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error capturado por ErrorBoundary:', error, errorInfo)
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: 'var(--pv-bg)' }}>
          <Navbar />
          <main className="flex-grow-1 d-flex align-items-center py-5">
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-11 col-sm-9 col-md-7 col-lg-6">
                  <div className="sketch-card p-5 text-center">
                    <div className="display-3 text-danger mb-3">⚠️</div>
                    <h2 className="h4 text-white mb-2">Algo salió mal</h2>
                    <p className="text-white-50 mb-4">
                      Ocurrió un error inesperado al procesar esta vista. Podés recargar o regresar al inicio.
                    </p>
                    {this.state.error && (
                      <div
                        className="p-3 mb-4 rounded bg-dark border border-secondary text-danger small text-start font-monospace overflow-auto"
                        style={{ maxHeight: '120px' }}
                      >
                        {this.state.error.toString()}
                      </div>
                    )}
                    <button
                      type="button"
                      className="sketch-btn-light"
                      onClick={this.handleReload}
                    >
                      Volver al inicio
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
