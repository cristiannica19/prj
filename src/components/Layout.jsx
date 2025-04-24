import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-primary text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <Link to="/" className="text-black text-2xl font-bold">
                Administrare Cimitir
              </Link>
            </div>
            <nav >
              <ul className="text-black flex space-x-6">
                <li>
                  <Link 
                    to="/" 
                    className={`hover:text-accent transition-colors ${
                      location.pathname === '/' ? 'font-semibold text-accent' : ''
                    }`}
                  >
                    Acasă
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/harta" 
                    className={`hover:text-accent transition-colors ${
                      location.pathname === '/harta' ? 'font-semibold text-accent' : ''
                    }`}
                  >
                    Hartă
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/persoane" 
                    className={`hover:text-accent transition-colors ${
                      location.pathname === '/persoane' ? 'font-semibold text-accent' : ''
                    }`}
                  >
                    Persoane
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-primary text-white py-4">
        <div className="container mx-auto px-4">
          <p className="text-center">
            &copy; {new Date().getFullYear()} Sistem de Administrare a Cimitirului. Toate drepturile rezervate.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;