import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-primary text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="flex justify-between items-center">
              <Link to="/" className="text-black text-2xl font-bold">
                Administrare Cimitir
              </Link>
              <div className="md:hidden">
                {/* Aici puteți adăuga un buton pentru meniul mobil dacă doriți */}
              </div>
            </div>
            
            <nav className="mt-4 md:mt-0">
              <ul className="text-black flex flex-wrap space-x-6">
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
                
                {user ? (
                  <>
                    <li>
                      <Link 
                        to="/profile" 
                        className={`hover:text-accent transition-colors ${
                          location.pathname === '/profile' ? 'font-semibold text-accent' : ''
                        }`}
                      >
                        Profil
                      </Link>
                    </li>
                    
                    {isAdmin() && (
                      <li>
                        <Link 
                          to="/admin" 
                          className={`hover:text-accent transition-colors ${
                            location.pathname === '/admin' ? 'font-semibold text-accent' : ''
                          }`}
                        >
                          Admin
                        </Link>
                      </li>
                    )}
                  </>
                ) : (
                  <>
                    <li>
                      <Link 
                        to="/login" 
                        className={`hover:text-accent transition-colors ${
                          location.pathname === '/login' ? 'font-semibold text-accent' : ''
                        }`}
                      >
                        Autentificare
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/register" 
                        className={`hover:text-accent transition-colors ${
                          location.pathname === '/register' ? 'font-semibold text-accent' : ''
                        }`}
                      >
                        Înregistrare
                      </Link>
                    </li>
                  </>
                )}
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
          <p className="text-black text-center">
            &copy; {new Date().getFullYear()} Sistem de Administrare a Cimitirului. Toate drepturile rezervate.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;