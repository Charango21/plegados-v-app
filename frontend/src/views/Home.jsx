import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'
import logo from '../assets/PV.png'

function Home() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <header className="bg-dark text-white text-center py-5">
        <div className="container">
          <img
            src={logo}
            alt="PLEGADOS VERDINI"
            height="240"
            className="mb-4"
          />
          <p className="lead mb-4">
            Pliegues de chapa a medida para tu proyecto
          </p>
          <Link to="/register" className="btn btn-light btn-lg">
            Hacer un pedido
          </Link>
        </div>
      </header>
      <section className="bg-light py-5 flex-grow-1">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Servicios</h5>
                  <p className="card-text mb-0">
                    Realizamos pliegues de chapa según tus medidas, espesor y
                    forma.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Cómo pedir</h5>
                  <p className="card-text mb-0">
                    Registrate, cargá las medidas de tu pieza y subí el plano
                    del pliegue.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Nuestro trabajo</h5>
                  <p className="card-text mb-0">
                    Pliegues de alta calidad realizados por personal
                    especializado.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}

export default Home
