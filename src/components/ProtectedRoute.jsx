// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminRequired = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show a loading indicator while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-gray-600">Se verifică autentificarea...</p>
      </div>
    );
  }

  // If not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // For admin-only routes
  if (adminRequired && user.role !== 'admin') {
    return <Navigate to="/profile" replace />;
  }

  // If authenticated (and admin if required), render the protected component
  return children;
};

export default ProtectedRoute;