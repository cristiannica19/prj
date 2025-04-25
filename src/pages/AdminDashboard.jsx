import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AdminDashboard = () => {
  const { user, isAdmin, getAuthHeader } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sectors, setSectors] = useState([]);
  const [selectedSector, setSelectedSector] = useState(null);
  const [graves, setGraves] = useState([]);
  const [selectedGrave, setSelectedGrave] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const [dataLoading, setDataLoading] = useState(false);



 // Verificăm dacă utilizatorul este admin
useEffect(() => {
  loadUsers();
  loadSectors();
}, []);

  // Încărcăm toți utilizatorii
  const loadUsers = async () => {
    try {
      setDataLoading(true);
      const response = await axios.get(
        'http://localhost:3000/api/users',
        { headers: getAuthHeader() }
      );
      setUsers(response.data);
    } catch (err) {
      console.error('Eroare la încărcarea utilizatorilor:', err);
      setError('Nu s-au putut încărca utilizatorii.');
    } finally {
      setDataLoading(false);
    }
  };

  // Încărcăm toate sectoarele
  const loadSectors = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/sectors');
      setSectors(response.data);
    } catch (err) {
      console.error('Eroare la încărcarea sectoarelor:', err);
      setError('Nu s-au putut încărca sectoarele.');
    }
  };

  // Încărcăm mormintele dintr-un sector
  const loadGraves = async (sectorId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:3000/api/sectors/${sectorId}/graves`
      );
      setGraves(response.data);
    } catch (err) {
      console.error('Eroare la încărcarea mormintelor:', err);
      setError('Nu s-au putut încărca mormintele.');
    } finally {
      setLoading(false);
    }
  };

  // Încărcăm informații despre persoana de legătură a unui mormânt
  const loadGraveContactPerson = async (graveId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:3000/api/graves/${graveId}/contact-person`,
        { headers: getAuthHeader() }
      );
      
      // Găsim mormântul selectat și actualizăm informațiile despre persoana de legătură
      const grave = graves.find(g => g.id === graveId);
      if (grave) {
        const updatedGrave = { ...grave, contactPersonId: response.data.contactPerson?.id || null };
        setSelectedGrave(updatedGrave);
      }
    } catch (err) {
      console.error('Eroare la încărcarea informațiilor despre persoana de legătură:', err);
    } finally {
      setLoading(false);
    }
  };

  // Setăm persoana de legătură pentru un mormânt
  const setContactPerson = async () => {
    if (!selectedGrave || !selectedUser) {
      setError('Selectați un mormânt și un utilizator.');
      return;
    }

    try {
      setLoading(true);
      await axios.put(
        `http://localhost:3000/api/graves/${selectedGrave.id}/contact-person`,
        { userId: selectedUser.id },
        { headers: getAuthHeader() }
      );
      
      setSuccessMessage(
        `Utilizatorul ${selectedUser.username} a fost setat ca persoană de legătură pentru mormântul ${selectedGrave.grave_number}.`
      );
      
      // Actualizăm starea local în loc să reîncărcăm datele
      setSelectedGrave({ ...selectedGrave, contactPersonId: selectedUser.id });
    } catch (err) {
      console.error('Eroare la setarea persoanei de legătură:', err);
      setError('Nu s-a putut seta persoana de legătură.');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }
  };

  // Eliminăm persoana de legătură a unui mormânt
  const removeContactPerson = async () => {
    if (!selectedGrave) {
      setError('Selectați un mormânt.');
      return;
    }

    try {
      setLoading(true);
      await axios.put(
        `http://localhost:3000/api/graves/${selectedGrave.id}/contact-person`,
        { userId: null },
        { headers: getAuthHeader() }
      );
      
      setSuccessMessage(`Persoana de legătură a fost eliminată pentru mormântul ${selectedGrave.grave_number}.`);
      
      // Actualizăm starea locală
      setSelectedGrave({ ...selectedGrave, contactPersonId: null });
    } catch (err) {
      console.error('Eroare la eliminarea persoanei de legătură:', err);
      setError('Nu s-a putut elimina persoana de legătură.');
    } finally {
      setLoading(false);
      // Ascundem mesajul de succes după 3 secunde
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }
  };

  // Handler pentru selectarea unui sector
  const handleSectorSelect = (sector) => {
    setSelectedSector(sector);
    setSelectedGrave(null);
    loadGraves(sector.id);
  };

  // Handler pentru selectarea unui mormânt
  const handleGraveSelect = (grave) => {
    setSelectedGrave(grave);
    // Încărcăm informații despre persoana de legătură
    loadGraveContactPerson(grave.id);
  };

  



  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">Panou de administrare</h1>
        <p className="text-gray-600">
          Gestionați utilizatorii și asociați-i cu mormintele pentru care sunt persoane de legătură.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista utilizatori */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Utilizatori</h2>
          
          {dataLoading && !users.length ? (
            <p className="text-center py-4 text-gray-500">Se încarcă utilizatorii...</p>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Utilizator
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Rol
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className={`cursor-pointer hover:bg-gray-50 ${
                        selectedUser && selectedUser.id === user.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {user.role === 'admin' ? 'Admin' : 'Utilizator'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selectare sector și mormânt */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Selectare mormânt</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selectați sectorul:
            </label>
            <select
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              value={selectedSector ? selectedSector.id : ''}
              onChange={(e) => {
                const sector = sectors.find(s => s.id === parseInt(e.target.value));
                if (sector) {
                  handleSectorSelect(sector);
                }
              }}
            >
              <option value="">Selectați un sector</option>
              {sectors.map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.name}
                </option>
              ))}
            </select>
          </div>
          
          {selectedSector && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selectați mormântul:
              </label>
              {loading ? (
                <p className="text-center py-4 text-gray-500">Se încarcă mormintele...</p>
              ) : graves.length === 0 ? (
                <p className="text-center py-4 text-gray-500">Nu există morminte în acest sector.</p>
              ) : (
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Număr
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {graves.map((grave) => (
                        <tr
                          key={grave.id}
                          className={`cursor-pointer hover:bg-gray-50 ${
                            selectedGrave && selectedGrave.id === grave.id ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleGraveSelect(grave)}
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {grave.grave_number}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                grave.status === 'ocupat'
                                  ? 'bg-red-100 text-red-800'
                                  : grave.status === 'rezervat'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {grave.status === 'ocupat'
                                ? 'Ocupat'
                                : grave.status === 'rezervat'
                                ? 'Rezervat'
                                : 'Liber'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Asociere persoană de legătură */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Asociere persoană de legătură</h2>
          
          {!selectedGrave ? (
            <p className="text-center py-4 text-gray-500">Selectați un mormânt pentru a asocia o persoană de legătură.</p>
          ) : !selectedUser ? (
            <div>
              <p className="mb-4">
                <span className="font-semibold">Mormânt selectat:</span>{' '}
                {selectedSector?.name} - {selectedGrave.grave_number}
              </p>
              <p className="text-center py-4 text-gray-500">
                Selectați un utilizator pentru a-l asocia ca persoană de legătură.
              </p>
              
              {selectedGrave.contactPersonId && (
                <div className="mt-4 p-4 bg-red-50 rounded-md">
                  <p className="text-red-700 mb-2">
                    Acest mormânt are deja o persoană de legătură asociată.
                  </p>
                  <button
                    onClick={removeContactPerson}
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Elimină asocierea
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <p className="mb-2">
                  <span className="font-semibold">Mormânt selectat:</span>{' '}
                  {selectedSector?.name} - {selectedGrave.grave_number}
                </p>
                <p className="mb-4">
                  <span className="font-semibold">Utilizator selectat:</span>{' '}
                  {selectedUser.username} ({selectedUser.email})
                </p>
                
                {/* Cazul când mormântul are deja o persoană de legătură care este diferită de utilizatorul selectat */}
                {selectedGrave.contactPersonId && selectedGrave.contactPersonId !== selectedUser.id && (
                  <div className="p-3 bg-yellow-50 rounded-md mb-4">
                    <p className="text-yellow-700">
                      Acest mormânt are deja o persoană de legătură. Continuarea va înlocui asocierea existentă.
                    </p>
                  </div>
                )}
                
                {selectedGrave.contactPersonId === selectedUser.id ? (
                  <div>
                    <div className="p-3 bg-green-50 rounded-md mb-4">
                      <p className="text-green-700">
                        Acest utilizator este deja persoana de legătură pentru acest mormânt.
                      </p>
                    </div>
                    <button
                      onClick={removeContactPerson}
                      disabled={loading}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                    >
                      Elimină asocierea
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={setContactPerson}
                    disabled={loading}
                    className="w-full bg-gray-200 hover:bg-primary/90 text-black font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    {loading ? 'Se procesează...' : 'Asociază persoana de legătură'}
                  </button>
                )}
              </div>
              
              {/* Buton separat pentru eliminarea asocierii existente (când există un alt utilizator asociat) */}
              {selectedGrave.contactPersonId && selectedGrave.contactPersonId !== selectedUser.id && (
                <button
                  onClick={removeContactPerson}
                  disabled={loading}
                  className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Elimină asocierea existentă
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;