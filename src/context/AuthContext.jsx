import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

 useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Adaugă timeout pentru a evita blocarea la infinit
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await axios.get('http://localhost:3000/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.data && response.data.user) {
          setUser(response.data.user);
        } else {
          // Dacă răspunsul nu conține date valide, eliminăm tokenul
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Eroare la verificarea tokenului:', err);
        // Eliminăm tokenul în caz de eroare
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  // Funcție pentru obținerea profilului utilizatorului folosind tokenul
 


  // Funcție pentru înregistrare
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:3000/api/auth/register', userData);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Eroare la înregistrare');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Funcție pentru autentificare
    const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:3000/api/auth/login', credentials);
      
      // Salvăm tokenul în localStorage
      localStorage.setItem('token', response.data.token);
      
      // Setăm utilizatorul în state
      setUser(response.data.user);
      setError(null);
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Autentificare eșuată');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Funcție pentru delogare
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Verificăm dacă utilizatorul este admin
  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  // Funcție pentru a obține headerul de autorizare pentru solicitări
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isAdmin,
    getAuthHeader
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};