// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Layout from '../components/Layout';
// import { useAuth } from '../context/AuthContext';
// import axios from 'axios';

// const ProfilePage = () => {
//   const { user, logout, getAuthHeader } = useAuth();
//   const [userGraves, setUserGraves] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const navigate = useNavigate();
//   const [initialized, setInitialized] = useState(false);


//  // Verificăm dacă utilizatorul este autentificat
// useEffect(() => {
//     if (!loading && !initialized) {
//       setInitialized(true);
      
//       if (!user) {
//         navigate('/login');
//       } else {
//         loadUserGraves();
//       }
//     }
//   }, [loading, user, initialized, navigate]);  // Adaugă loading în dependențe

//   // Încărcăm mormintele asociate cu utilizatorul
//   const loadUserGraves = async () => {
//     if (!user) return;

//     try {
//       setLoading(true);
//       const response = await axios.get(
//         `http://localhost:3000/api/graves/user/${user.id}`,
//         { headers: getAuthHeader() }
//       );
//       setUserGraves(response.data);
//     } catch (err) {
//       console.error('Eroare la încărcarea mormintelor:', err);
//       setError('Nu s-au putut încărca mormintele asociate.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//     if (loading && !initialized) {
//     return (
//       <Layout>
//         <div className="flex items-center justify-center h-screen">
//           <p className="text-xl text-gray-600">Se verifică autentificarea...</p>
//         </div>
//       </Layout>
//     );
//   }

//   if (!user) return null;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
// MODIFICARE: Importăm API_URL din configurație
import { API_URL } from '../config/api.js';

const ProfilePage = () => {
  const { user, logout, getAuthHeader } = useAuth();
  const [userGraves, setUserGraves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [initialized, setInitialized] = useState(false);

  // Verificăm dacă utilizatorul este autentificat
  useEffect(() => {
    if (!loading && !initialized) {
      setInitialized(true);
      
      if (!user) {
        navigate('/login');
      } else {
        loadUserGraves();
      }
    }
  }, [loading, user, initialized, navigate]);

  // Încărcăm mormintele asociate cu utilizatorul
  const loadUserGraves = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // MODIFICARE: Folosim API_URL în loc de hardcoded localhost
      const response = await axios.get(
        `${API_URL}/graves/user/${user.id}`,
        { headers: getAuthHeader() }
      );
      setUserGraves(response.data);
    } catch (err) {
      console.error('Eroare la încărcarea mormintelor:', err);
      setError('Nu s-au putut încărca mormintele asociate.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading && !initialized) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-xl text-gray-600">Se verifică autentificarea...</p>
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  // Restul componentei rămâne neschimbat
  // ... (continuă cu JSX-ul pentru afișare)

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Profil utilizator
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Informațiile dvs. personale și mormintele asociate.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border-transparent text-sm font-medium rounded-md text-black bg-gray-200 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Deconectare
            </button>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Nume utilizator</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {user.username}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Nume complet</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {user.firstName} {user.lastName}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {user.email}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Telefon</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {user.phone || 'Nu este specificat'}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Rol</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {user.role === 'admin' ? 'Administrator' : 'Utilizator'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Morminte asociate
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Mormintele pentru care sunteți persoană de legătură.
            </p>
          </div>
          <div className="border-t border-gray-200">
            {loading ? (
              <div className="px-4 py-5 text-center text-gray-500">
                Se încarcă...
              </div>
            ) : error ? (
              <div className="px-4 py-5 text-center text-red-500">
                {error}
              </div>
            ) : userGraves.length === 0 ? (
              <div className="px-4 py-5 text-center text-gray-500">
                Nu aveți morminte asociate.
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Sector
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Număr mormânt
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Acțiuni
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userGraves.map((grave) => (
                      <tr key={grave.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {grave.sector_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {grave.grave_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {grave.status === 'ocupat' ? 'Ocupat' : 
                           grave.status === 'rezervat' ? 'Rezervat' : 
                           grave.status === 'liber' ? 'Liber' : grave.status}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => navigate(`/harta?sector=${grave.sector_name}&grave=${grave.grave_number}`)}
                            className="text-primary hover:text-accent mr-4"
                          >
                            Vezi pe hartă
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ProfilePage;

