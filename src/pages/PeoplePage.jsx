import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import DeceasedDetails from '../components/DeceasedDetails';
import { getAllDeceased, searchDeceased } from '../services/api';
import { formatDate } from '../utils/helpers';

const PeoplePage = () => {
  const [deceasedList, setDeceasedList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">Persoane Decedate</h1>
        <p className="text-gray-600">
          Căutați în lista persoanelor decedate pentru a găsi informații despre locația mormântului.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
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
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition-colors"
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
              <h2 className="text-xl font-semibold">Lista Persoane</h2>
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
            <h2 className="text-xl font-semibold mb-4">Detalii Persoană</h2>
            
            {selectedPerson ? (
              <div>
                <DeceasedDetails deceased={selectedPerson} />
                
                <div className="mt-6">
                  <Link
                    to={`/harta?sector=${selectedPerson.sector_name}&grave=${selectedPerson.grave_number}`}
                    className="block w-full bg-primary hover:bg-primary/90 text-white text-center py-2 px-4 rounded-md transition-colors"
                  >
                    Vezi pe Hartă
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