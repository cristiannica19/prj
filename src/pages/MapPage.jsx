import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Layout from '../components/Layout';
import DeceasedDetails from '../components/DeceasedDetails';
import { getSectors, getGravesBySector, getDeceasedByGrave } from '../services/api';
import { getGraveStatusColor, getStatusText } from '../utils/helpers';
import L from 'leaflet';

// Corectăm problema cu iconițele Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Componenta pentru centrarea hărții pe un sector
const SetViewOnSelect = ({ coordinates }) => {
  const map = useMap();
  
  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [coordinates, map]);
  
  return null;
};

const MapPage = () => {
  const [sectors, setSectors] = useState([]);
  const [selectedSector, setSelectedSector] = useState(null);
  const [graves, setGraves] = useState([]);
  const [selectedGrave, setSelectedGrave] = useState(null);
  const [deceasedList, setDeceasedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Coordonatele pentru hartă (vor fi înlocuite cu coordonatele reale)
  const initialPosition = [47.13174003051091, 27.565600775884775];

  // Încarcă toate sectoarele la încărcarea paginii
  useEffect(() => {
    const loadSectors = async () => {
      try {
        setLoading(true);
        const data = await getSectors();
        setSectors(data);
      } catch (err) {
        setError('Nu s-au putut încărca sectoarele. Vă rugăm încercați din nou.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadSectors();
  }, []);

  // Încarcă mormintele când se selectează un sector
  useEffect(() => {
    const loadGraves = async () => {
      if (!selectedSector) return;
      
      try {
        setLoading(true);
        const data = await getGravesBySector(selectedSector.id);
        setGraves(data);
      } catch (err) {
        setError(`Nu s-au putut încărca mormintele pentru sectorul ${selectedSector.name}.`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadGraves();
  }, [selectedSector]);

  // Încarcă persoanele decedate când se selectează un mormânt
  useEffect(() => {
    const loadDeceased = async () => {
      if (!selectedGrave) return;
      
      try {
        setLoading(true);
        const data = await getDeceasedByGrave(selectedGrave.id);
        setDeceasedList(data);
      } catch (err) {
        setError('Nu s-au putut încărca informațiile despre persoanele decedate.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadDeceased();
  }, [selectedGrave]);

  // Funcție pentru gestionarea selecției unui sector
  const handleSectorSelect = (sector) => {
    setSelectedSector(sector);
    setSelectedGrave(null);
    setDeceasedList([]);
  };

  // Funcție pentru gestionarea selecției unui mormânt
  const handleGraveSelect = (grave) => {
    setSelectedGrave(grave);
  };

  // Funcție pentru a obține un stil pentru un sector în funcție de selecție
  const getSectorStyle = (sector) => {
    const isSelected = selectedSector && selectedSector.id === sector.id;
    
    return {
      fillColor: isSelected ? '#3b82f6' : '#9ca3af',
      weight: 2,
      opacity: 1,
      color: isSelected ? '#1e40af' : '#4b5563',
      fillOpacity: isSelected ? 0.4 : 0.2,
    };
  };

  // Funcție pentru a obține un icon personalizat pentru un mormânt în funcție de status
  const getGraveIcon = (status) => {
    return L.divIcon({
      className: 'grave-marker',
      html: `<div style="
        width: 20px;
        height: 20px;
        background-color: ${getGraveStatusColor(status)};
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">Harta Cimitirului</h1>
        <p className="text-gray-600">
          Selectați un sector pentru a vedea mormintele, apoi selectați un mormânt pentru a vedea detalii.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar cu sectoare și detalii */}
        <div className="lg:col-span-1">
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-3">Sectoare</h2>
            {loading && !sectors.length ? (
              <p className="text-center py-4 text-gray-500">Se încarcă sectoarele...</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {sectors.map((sector) => (
                  <li key={sector.id} className="py-2">
                    <button
                      onClick={() => handleSectorSelect(sector)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        selectedSector && selectedSector.id === sector.id
                          ? 'bg-blue-100 text-blue-800'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {sector.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selectedGrave && (
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold">Detalii Mormânt</h2>
                <span 
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: `${getGraveStatusColor(selectedGrave.status)}20`,
                    color: getGraveStatusColor(selectedGrave.status)
                  }}
                >
                  {getStatusText(selectedGrave.status)}
                </span>
              </div>
              
              <p className="text-gray-600 mb-2">
                <span className="font-semibold">Număr:</span> {selectedGrave.grave_number}
              </p>
              <p className="text-gray-600 mb-4">
                <span className="font-semibold">Sector:</span> {selectedSector?.name}
              </p>
              
              <h3 className="font-semibold mb-2">Persoane decedate:</h3>
              {loading ? (
                <p className="text-center py-2 text-gray-500">Se încarcă...</p>
              ) : deceasedList.length > 0 ? (
                <div className="space-y-4">
                  {deceasedList.map((deceased) => (
                    <DeceasedDetails key={deceased.id} deceased={deceased} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">Nu există informații despre persoane decedate pentru acest mormânt.</p>
              )}
            </div>
          )}
        </div>

        {/* Harta */}
        <div className="lg:col-span-2">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div style={{ height: '600px', width: '100%' }}>
              <MapContainer
                center={initialPosition}
                zoom={17}
                style={{ height: '100%', width: '100%' }}
              >
              <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
/>  
                
                {sectors.map((sector) => (
                  <Polygon
                    key={sector.id}
                    positions={sector.coordinates}
                    pathOptions={getSectorStyle(sector)}
                    eventHandlers={{
                      click: () => handleSectorSelect(sector),
                    }}
                  >
                    <Popup>
                      <div>
                        <h3 className="font-bold">{sector.name}</h3>
                        {sector.description && <p>{sector.description}</p>}
                      </div>
                    </Popup>
                  </Polygon>
                ))}
                
                {selectedSector && graves.map((grave) => (
                  <Marker
                    key={grave.id}
                    position={[grave.coordinates.lat, grave.coordinates.lng]}
                    icon={getGraveIcon(grave.status)}
                    eventHandlers={{
                      click: () => handleGraveSelect(grave),
                    }}
                  >
                    <Popup>
                      <div>
                        <h3 className="font-bold">Mormânt {grave.grave_number}</h3>
                        <p>Status: {getStatusText(grave.status)}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
                
                {selectedSector && (
                  <SetViewOnSelect coordinates={selectedSector.coordinates} />
                )}
              </MapContainer>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-2" 
                  style={{ backgroundColor: getGraveStatusColor('ocupat') }}
                ></div>
                <span className="text-sm">Ocupat</span>
              </div>
              <div className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-2" 
                  style={{ backgroundColor: getGraveStatusColor('rezervat') }}
                ></div>
                <span className="text-sm">Rezervat</span>
              </div>
              <div className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-2" 
                  style={{ backgroundColor: getGraveStatusColor('liber') }}
                ></div>
                <span className="text-sm">Liber</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MapPage;