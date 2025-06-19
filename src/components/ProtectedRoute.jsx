// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminRequired = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Se arata un indicator de loading cat timp se verifica autentificarea
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-gray-600">Se verifică autentificarea...</p>
      </div>
    );
  }

  // Daca nu este logat, se face redirect la pagina de login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Doar pentru rutele admin
  if (adminRequired && user.role !== 'admin') {
    return <Navigate to="/profile" replace />;
  }

  //  Daca este autentificat(si daca este admin), se face render la children
  return children;
};

export default ProtectedRoute;