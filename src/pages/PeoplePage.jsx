import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import DeceasedDetails from '../components/DeceasedDetails';
import { getAllDeceased, searchDeceased, getGraveById } from '../services/api';
import { formatDate } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const PeoplePage = () => {
  const { user, isAdmin, getAuthHeader } = useAuth();
  const [deceasedList, setDeceasedList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // State pentru modul de editare
  const [isEditing, setIsEditing] = useState(false);
  const [deceasedFormData, setDeceasedFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    date_of_death: '',
    details: '',
    photo_url: ''
  });
  const [addingNewDeceased, setAddingNewDeceased] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Încarcă toate persoanele decedate la încărcarea paginii
  useEffect(() => {
    const loadDeceased = async () => {
      try {
        setLoading(true);
        const data = await getAllDeceased();
        setDeceasedList(data);
        setFilteredList(data);
      } catch (err) {
        setError('Nu s-au putut încărca datele. Vă rugăm încercați din nou.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadDeceased();
  }, []);

  // Funcție pentru căutarea persoanelor decedate
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setFilteredList(deceasedList);
      return;
    }
    
    try {
      setLoading(true);
      const data = await searchDeceased(searchQuery);
      setFilteredList(data);
    } catch (err) {
      setError('Eroare la căutare. Vă rugăm încercați din nou.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Funcție pentru resetarea căutării
  const resetSearch = () => {
    setSearchQuery('');
    setFilteredList(deceasedList);
  };
  
  // Funcție pentru activarea modului de editare
  const startEditing = (person) => {
    setSelectedPerson(person);
    setDeceasedFormData({
      first_name: person.first_name,
      last_name: person.last_name,
      date_of_birth: person.date_of_birth ? new Date(person.date_of_birth).toISOString().split('T')[0] : '',
      date_of_death: person.date_of_death ? new Date(person.date_of_death).toISOString().split('T')[0] : '',
      details: person.details || '',
      photo_url: person.photo_url || ''
    });
    setIsEditing(true);
    setAddingNewDeceased(false);
  };
  
  
  // Funcție pentru anularea modului de editare
  const cancelEditing = () => {
    setIsEditing(false);
    if (addingNewDeceased) {
      setSelectedPerson(null);
    }
    setAddingNewDeceased(false);
  };
  
  // Funcție pentru salvarea modificărilor la persoana decedată
  const saveDeceasedChanges = async () => {
    try {
      setEditLoading(true);
      
      // Validare date
      if (!deceasedFormData.first_name || !deceasedFormData.last_name || !deceasedFormData.date_of_death) {
        setError('Vă rugăm completați toate câmpurile obligatorii (prenume, nume, data decesului).');
        setEditLoading(false);
        return;
      }
      
      if (addingNewDeceased) {
        // Adăugăm o nouă persoană decedată
        const response = await axios.post(
          'http://localhost:3000/api/deceased',
          {
            ...deceasedFormData,
            grave_id: selectedPerson.grave_id
          },
          { headers: getAuthHeader() }
        );
        
        // Adăugăm noua persoană la lista existentă
        const newDeceased = {
          ...response.data.deceased,
          grave_number: selectedPerson.grave_number,
          sector_name: selectedPerson.sector_name
        };
        
        setDeceasedList([...deceasedList, newDeceased]);
        setFilteredList([...filteredList, newDeceased]);
        setSelectedPerson(newDeceased);
        
        setSuccessMessage('Persoana a fost adăugată cu succes!');
      } else {
        // Actualizăm o persoană decedată existentă
        const response = await axios.put(
          `http://localhost:3000/api/deceased/${selectedPerson.id}`,
          deceasedFormData,
          { headers: getAuthHeader() }
        );
        
        // Actualizăm lista de persoane decedate
        const updatedDeceased = {
          ...response.data.deceased,
          grave_number: selectedPerson.grave_number,
          sector_name: selectedPerson.sector_name
        };
        
        setDeceasedList(deceasedList.map(item => 
          item.id === selectedPerson.id ? updatedDeceased : item
        ));
        setFilteredList(filteredList.map(item => 
          item.id === selectedPerson.id ? updatedDeceased : item
        ));
        
        setSelectedPerson(updatedDeceased);
        
        setSuccessMessage('Datele au fost actualizate cu succes!');
      }
      
      // Ieșim din modul de editare după salvare
      setIsEditing(false);
      setAddingNewDeceased(false);
      
      // Ascundem mesajul de succes după 3 secunde
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError('Nu s-au putut salva modificările. Verificați conexiunea și încercați din nou.');
      console.error(err);
    } finally {
      setEditLoading(false);
    }
  };
  
  // Funcție pentru ștergerea unei persoane decedate
  const deleteDeceased = async () => {
    if (!selectedPerson || !selectedPerson.id) return;
    
    if (!confirm(`Sunteți sigur că doriți să ștergeți persoana ${selectedPerson.first_name} ${selectedPerson.last_name}?`)) {
      return;
    }
    
    try {
      setEditLoading(true);
      
      await axios.delete(
        `http://localhost:3000/api/deceased/${selectedPerson.id}`,
        { headers: getAuthHeader() }
      );
      
      // Eliminăm persoana din listele locale
      setDeceasedList(deceasedList.filter(item => item.id !== selectedPerson.id));
      setFilteredList(filteredList.filter(item => item.id !== selectedPerson.id));
      
      setSelectedPerson(null);
      setIsEditing(false);
      
      setSuccessMessage('Persoana a fost ștearsă cu succes!');
      
      // Ascundem mesajul de succes după 3 secunde
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError('Nu s-a putut șterge persoana. Verificați conexiunea și încercați din nou.');
      console.error(err);
    } finally {
      setEditLoading(false);
    }
  };
  
  // Funcție pentru gestionarea schimbărilor în formular
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setDeceasedFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">Persoane decedate</h1>
        <p className="text-gray-600">
          Căutați în lista persoanelor decedate pentru a găsi informații despre locația mormântului.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
          <button 
            className="float-right font-bold"
            onClick={() => setError(null)}
          >
            &times;
          </button>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {successMessage}
          <button 
            className="float-right font-bold"
            onClick={() => setSuccessMessage('')}
          >
            &times;
          </button>
        </div>
      )}

      {/* Bara de căutare */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Căutați după nume sau prenume..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="bg-gray-200 hover:bg-primary/90 text-black px-4 py-2 rounded-md transition-colors"
            >
              Caută
            </button>
            {searchQuery && (
              <button
                onClick={resetSearch}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors"
              >
                Resetează
              </button>
            )}
           
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista persoane */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Lista persoane</h2>
              <span className="text-sm text-gray-500">
                {filteredList.length} {filteredList.length === 1 ? 'persoană' : 'persoane'} găsite
              </span>
            </div>
            
            {loading ? (
              <div className="p-8 text-center text-gray-500">Se încarcă...</div>
            ) : filteredList.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {searchQuery ? 'Nu s-au găsit rezultate pentru căutarea dvs.' : 'Nu există persoane înregistrate.'}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredList.map((person) => (
                  <div 
                    key={person.id} 
                    className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedPerson && selectedPerson.id === person.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedPerson(person)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg text-gray-900">
                          {person.first_name} {person.last_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {person.date_of_birth ? formatDate(person.date_of_birth) : '?'} - {formatDate(person.date_of_death)}
                        </p>
                      </div>
                      <div className="text-sm text-right">
                        <p className="font-medium text-gray-900">Sector: {person.sector_name}</p>
                        <p className="text-gray-500">Mormânt: {person.grave_number}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detalii persoană */}
        <div className="lg:col-span-1">
          <div className="bg-white p-4 rounded-lg shadow-md sticky top-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Detalii persoană</h2>
              
              {/* Butoane admin pentru editare/ștergere */}
              {isAdmin() && selectedPerson && !isEditing && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEditing(selectedPerson)}
                    className="px-3 py-1 bg-gray-200 hover:bg-primary/90 text-black rounded-md text-sm"
                  >
                    Editează
                  </button>
                  <button
                    onClick={deleteDeceased}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm"
                  >
                    Șterge
                  </button>
                </div>
              )}
            </div>
            
            {isEditing ? (
              /* Formular pentru editarea/adăugarea persoanei decedate */
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prenume *
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={deceasedFormData.first_name}
                      onChange={handleFormChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nume *
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={deceasedFormData.last_name}
                      onChange={handleFormChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data nașterii
                    </label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={deceasedFormData.date_of_birth}
                      onChange={handleFormChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data decesului *
                    </label>
                    <input
                      type="date"
                      name="date_of_death"
                      value={deceasedFormData.date_of_death}
                      onChange={handleFormChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL Fotografie
                  </label>
                  <input
                    type="text"
                    name="photo_url"
                    value={deceasedFormData.photo_url}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    placeholder="https://exemplu.com/imagine.jpg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Detalii suplimentare
                  </label>
                  <textarea
                    name="details"
                    value={deceasedFormData.details}
                    onChange={handleFormChange}
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  ></textarea>
                </div>
                
                {addingNewDeceased && (
                  <div className="p-3 bg-blue-50 rounded-md">
                    <p className="text-blue-700 text-sm">
                      <span className="font-semibold">Locație:</span> Sector {selectedPerson.sector_name}, Mormânt {selectedPerson.grave_number}
                    </p>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <button
                    onClick={saveDeceasedChanges}
                    disabled={editLoading}
                    className="flex-1 bg-primary hover:bg-primary/90 text-black font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    {editLoading ? 'Se salvează...' : 'Salvează'}
                  </button>
                  
                  <button
                    onClick={cancelEditing}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Anulează
                  </button>
                </div>
              </div>
            ) : selectedPerson ? (
              <div>
                <DeceasedDetails deceased={selectedPerson} />
                
                <div className="mt-6">
                  <Link
                    to={`/harta?sector=${selectedPerson.sector_name}&grave=${selectedPerson.grave_number}`}
                    className="block w-full bg-primary hover:bg-primary/90 text-black font-bold text-center py-2 px-4 rounded-md transition-colors"
                  >
                    Vezi pe hartă
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Selectați o persoană din listă pentru a vedea detaliile.
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PeoplePage;