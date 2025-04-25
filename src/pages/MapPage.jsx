import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Layout from '../components/Layout';
import SectorDetailModal from '../components/SectorDetailModal';
import { getSectors, getGravesBySector } from '../services/api';
import L from 'leaflet';

// Corectăm problema cu iconițele Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Componenta pentru centrarea hărții
const SetViewOnLoad = ({ sectors }) => {
  const map = useMap();
  
  useEffect(() => {
    if (sectors && sectors.length > 0) {
      // Creăm un bounds care include toate sectoarele
      const bounds = L.latLngBounds([]);
      sectors.forEach(sector => {
        if (sector.coordinates && sector.coordinates.length > 0) {
          bounds.extend(L.latLngBounds(sector.coordinates));
        }
      });
      
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [sectors, map]);
  
  return null;
};

const MapPage = () => {
  const [sectors, setSectors] = useState([]);
  const [selectedSector, setSelectedSector] = useState(null);
  const [graves, setGraves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Coordonatele inițiale pentru hartă (vor fi înlocuite cu coordonatele reale)
  const initialPosition = [47.13204401370525, 27.56565980654888]; 
  
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
    
    if (selectedSector) {
      loadGraves();
    }
  }, [selectedSector]);

  // Funcție pentru gestionarea selecției unui sector
  const handleSectorSelect = (sector) => {
    setSelectedSector(sector);
    setShowModal(true);
  };

  // Funcție pentru a obține un stil pentru un sector în funcție de selecție
  const getSectorStyle = (sector) => {
    return {
      fillColor: '#3b82f6',
      weight: 2,
      opacity: 1,
      color: '#1e40af',
      fillOpacity: 0.3,
    };
  };

  // Funcție pentru închiderea modalului
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSector(null);
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">Harta Cimitirului</h1>
        <p className="text-gray-600">
          Selectați un sector pentru a vedea detaliile și mormintele din acel sector.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar cu sectoare */}
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
                      className="w-full text-left px-3 py-2 rounded-md transition-colors hover:bg-gray-100"
                    >
                      {sector.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
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
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Afișarea sectoarelor pe harta generală */}
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevenim propagarea click-ului
                            handleSectorSelect(sector);
                          }}
                          className="mt-2 bg-primary text-white px-3 py-1 rounded-md text-sm"
                        >
                          Vizualizează morminte
                        </button>
                      </div>
                    </Popup>
                  </Polygon>
                ))}
                
                {/* Componenta pentru centrarea hărții */}
                {/* <SetViewOnLoad sectors={sectors} /> */}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Modal pentru afișarea detaliată a sectorului */}
      {showModal && selectedSector && (
        <SectorDetailModal
          sector={selectedSector}
          graves={graves}
          onClose={handleCloseModal}
          loading={loading}
        />
      )}
    </Layout>
  );
};

export default MapPage;

