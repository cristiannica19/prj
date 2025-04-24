import { useState, useEffect, useMemo } from 'react';
import { getDeceasedByGrave } from '../services/api';
import { getGraveStatusColor, getStatusText } from '../utils/helpers';
import DeceasedDetails from './DeceasedDetails';
import ReactDOM from 'react-dom';

const SectorDetailModal = ({ sector, graves, onClose, loading }) => {
  const [selectedGrave, setSelectedGrave] = useState(null);
  const [deceasedList, setDeceasedList] = useState([]);
  const [loadingDeceased, setLoadingDeceased] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Constante pentru layout-ul grilei de morminte
  const GRID_COLUMNS = 6; // Numărul de coloane în grid
  const GRAVE_SIZE = 60; // Dimensiunea în pixeli a unui mormânt
  const GRAVE_MARGIN = 5; // Spațiul între morminte în pixeli

  // Organizăm mormintele în grid
  const organizedGraves = useMemo(() => {
    if (!graves || graves.length === 0) return [];

    // Sortăm mormintele după număr pentru o organizare logică
    return [...graves].sort((a, b) => {
      const aNum = parseInt(a.grave_number.replace(/[^0-9]/g, ''));
      const bNum = parseInt(b.grave_number.replace(/[^0-9]/g, ''));
      return aNum - bNum;
    });
  }, [graves]);

  // Calculăm dimensiunile grilei
  const gridDimensions = useMemo(() => {
    const columns = GRID_COLUMNS;
    const rows = Math.ceil(organizedGraves.length / columns);
    
    // Calculăm lățimea și înălțimea totală a containerului
    const width = columns * (GRAVE_SIZE + GRAVE_MARGIN * 2);
    const height = rows * (GRAVE_SIZE + GRAVE_MARGIN * 2);
    
    return { columns, rows, width, height };
  }, [organizedGraves]);

  // Efect pentru animația de apariție a modalului
  useEffect(() => {
    // Setăm un timing scurt pentru a permite browser-ului să proceseze DOM-ul înainte de animație
    const timer = setTimeout(() => {
      setModalVisible(true);
    }, 10);
    
    return () => clearTimeout(timer);
  }, []);

  // Încarcă persoanele decedate când se selectează un mormânt
  useEffect(() => {
    const loadDeceased = async () => {
      if (!selectedGrave) {
        setDeceasedList([]);
        return;
      }
      
      try {
        setLoadingDeceased(true);
        const data = await getDeceasedByGrave(selectedGrave.id);
        setDeceasedList(data);
      } catch (err) {
        setError('Nu s-au putut încărca informațiile despre persoanele decedate.');
        console.error(err);
      } finally {
        setLoadingDeceased(false);
      }
    };
    
    loadDeceased();
  }, [selectedGrave]);

  // Calculăm poziția în grid pentru un mormânt
  const getGravePosition = (index) => {
    const row = Math.floor(index / gridDimensions.columns);
    const col = index % gridDimensions.columns;
    
    return {
      top: row * (GRAVE_SIZE + GRAVE_MARGIN * 2) + GRAVE_MARGIN,
      left: col * (GRAVE_SIZE + GRAVE_MARGIN * 2) + GRAVE_MARGIN
    };
  };

  // Adăugăm un efect pentru a bloca scroll-ul și a aplica efectul de estompare a fundalului
  useEffect(() => {
    // Referința la elementul root al aplicației (div-ul cu id="root")
    const appRoot = document.getElementById('root');
    
    // Blocăm scroll-ul pe body când modalul este deschis
    document.body.style.overflow = 'hidden';
    
    // Aplicăm stilul de estompare pentru conținutul aplicației
    if (appRoot) {
      appRoot.style.filter = 'grayscale(80%) blur(2px) brightness(50%)';
      appRoot.style.transition = 'filter 0.3s ease-in-out';
    }
    
    // Restabilim stilurile când modalul este închis
    return () => {
      document.body.style.overflow = 'auto';
      if (appRoot) {
        appRoot.style.filter = 'none';
      }
    };
  }, []);

  // Funcție pentru închiderea modalului cu animație
  const handleClose = () => {
    setModalVisible(false);
    
    // Așteptăm finalizarea animației înainte de a închide efectiv modalul
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Componenta modală care va fi renderizată în portal
  const modalContent = (
    <div 
      className={`fixed inset-0 overflow-y-auto flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out ${
        modalVisible ? 'opacity-100' : 'opacity-0'
      }`} 
      style={{ zIndex: 9999 }}
      onClick={handleClose}
    >
      <div 
        className={`bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] flex flex-col transition-transform duration-300 ease-in-out ${
          modalVisible ? 'scale-100' : 'scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-primary">{sector.name}</h2>
          <button 
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Închide modalul"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 overflow-y-auto flex-grow flex flex-col md:flex-row gap-6">
          {/* Containerul pentru reprezentarea vizuală a sectorului */}
          <div className="flex-grow overflow-auto border rounded-lg p-4 bg-gray-50">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold">Morminte</h3>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 mr-2" 
                    style={{ backgroundColor: getGraveStatusColor('ocupat') }}
                  ></div>
                  <span className="text-sm">Ocupat</span>
                </div>
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 mr-2" 
                    style={{ backgroundColor: getGraveStatusColor('rezervat') }}
                  ></div>
                  <span className="text-sm">Rezervat</span>
                </div>
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 mr-2" 
                    style={{ backgroundColor: getGraveStatusColor('liber') }}
                  ></div>
                  <span className="text-sm">Liber</span>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <p className="text-gray-500">Se încarcă mormintele...</p>
              </div>
            ) : organizedGraves.length === 0 ? (
              <div className="h-96 flex items-center justify-center">
                <p className="text-gray-500">Nu există morminte înregistrate în acest sector.</p>
              </div>
            ) : (
              <div className="relative mx-auto" style={{ 
                width: `${gridDimensions.width}px`, 
                height: `${gridDimensions.height}px`,
                maxWidth: '100%',
                overflow: 'auto'
              }}>
                {organizedGraves.map((grave, index) => {
                  const position = getGravePosition(index);
                  
                  return (
                    <div
                      key={grave.id}
                      className="absolute border border-gray-700 cursor-pointer flex items-center justify-center transition-transform hover:z-10 hover:scale-105"
                      style={{
                        top: `${position.top}px`,
                        left: `${position.left}px`,
                        width: `${GRAVE_SIZE}px`,
                        height: `${GRAVE_SIZE}px`,
                        backgroundColor: getGraveStatusColor(grave.status),
                        transform: selectedGrave && selectedGrave.id === grave.id ? 'scale(1.05)' : 'scale(1)',
                        boxShadow: selectedGrave && selectedGrave.id === grave.id ? '0 0 0 2px #000, 0 0 10px rgba(0,0,0,0.5)' : 'none',
                      }}
                      onClick={() => setSelectedGrave(grave)}
                    >
                      <span className="text-xs text-center px-1 font-medium" style={{
                        color: grave.status === 'liber' ? '#000' : '#fff'
                      }}>
                        {grave.grave_number}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Panoul cu detalii despre mormântul selectat */}
          <div className="w-full md:w-96 shrink-0 border rounded-lg p-4 bg-white">
            <h3 className="text-xl font-semibold mb-4">Detalii Mormânt</h3>
            
            {!selectedGrave ? (
              <div className="h-96 flex items-center justify-center">
                <p className="text-gray-500">Selectați un mormânt pentru a vedea detaliile.</p>
              </div>
            ) : (
              <div>
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">Mormânt {selectedGrave.grave_number}</h4>
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
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Sector:</span> {sector.name}
                  </p>
                </div>
                
                <h4 className="font-semibold mb-2">Persoane decedate:</h4>
                
                {loadingDeceased ? (
                  <p className="text-center py-4 text-gray-500">Se încarcă...</p>
                ) : deceasedList.length > 0 ? (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {deceasedList.map((deceased) => (
                      <DeceasedDetails key={deceased.id} deceased={deceased} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic py-4">
                    Nu există informații despre persoane decedate pentru acest mormânt.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={handleClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
          >
            Închide
          </button>
        </div>
      </div>
    </div>
  );

  // Utilizăm ReactDOM.createPortal pentru a insera modalul direct în body
  // În loc să fie în ierarhia normală a componentelor
  return ReactDOM.createPortal(
    modalContent,
    document.body
  );
};

export default SectorDetailModal;