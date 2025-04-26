import { useState, useEffect, useMemo } from 'react';
import { getDeceasedByGrave } from '../services/api';
import { getGraveStatusColor, getStatusText, formatDate } from '../utils/helpers';
import DeceasedDetails from './DeceasedDetails';
import ReactDOM from 'react-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const SectorDetailModal = ({ sector, graves, onClose, loading }) => {
  const [selectedGrave, setSelectedGrave] = useState(null);
  const [deceasedList, setDeceasedList] = useState([]);
  const [loadingDeceased, setLoadingDeceased] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { user, isAdmin, getAuthHeader } = useAuth();
  
  // State pentru modul de editare
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    grave_number: '',
    status: '',
    details: ''
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // State pentru editarea/adăugarea persoanelor decedate
  const [isEditingDeceased, setIsEditingDeceased] = useState(false);
  const [addingNewDeceased, setAddingNewDeceased] = useState(false);
  const [selectedDeceasedForEdit, setSelectedDeceasedForEdit] = useState(null);
  const [deceasedFormData, setDeceasedFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    date_of_death: '',
    details: '',
    photo_url: ''
  });

  // Constante pentru layout-ul grilei de morminte
  const GRID_COLUMNS = 6;
  const GRAVE_SIZE = 60;
  const GRAVE_MARGIN = 5;

  // Organizăm mormintele în grid
  const organizedGraves = useMemo(() => {
    if (!graves || graves.length === 0) return [];

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
    
    const width = columns * (GRAVE_SIZE + GRAVE_MARGIN * 2);
    const height = rows * (GRAVE_SIZE + GRAVE_MARGIN * 2);
    
    return { columns, rows, width, height };
  }, [organizedGraves]);

  // Efect pentru animația de apariție a modalului
  useEffect(() => {
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
        
        // Populăm formularul de editare cu datele mormântului selectat
        setEditFormData({
          grave_number: selectedGrave.grave_number,
          status: selectedGrave.status,
          details: selectedGrave.details || ''
        });
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
    const appRoot = document.getElementById('root');
    
    document.body.style.overflow = 'hidden';
    
    if (appRoot) {
      appRoot.style.filter = 'grayscale(80%) blur(2px) brightness(50%)';
      appRoot.style.transition = 'filter 0.3s ease-in-out';
    }
    
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
    
    setTimeout(() => {
      onClose();
    }, 300);
  };
  
  // Funcție pentru gestionarea schimbărilor în formularul de editare mormânt
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Funcție pentru gestionarea schimbărilor în formularul persoanei decedate
  const handleDeceasedFormChange = (e) => {
    const { name, value } = e.target;
    setDeceasedFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Funcție pentru activarea modului de editare mormânt
  const toggleEditMode = () => {
    if (isEditing) {
      // Resetăm formularul la valorile inițiale când ieșim din modul de editare
      setEditFormData({
        grave_number: selectedGrave.grave_number,
        status: selectedGrave.status,
        details: selectedGrave.details || ''
      });
    }
    setIsEditing(!isEditing);
    setSaveSuccess(false);
    
    // Dacă ieșim din modul de editare, ne asigurăm că ieșim și din modul de editare decedat
    if (!isEditing) {
      setIsEditingDeceased(false);
      setAddingNewDeceased(false);
      setSelectedDeceasedForEdit(null);
    }
  };
  
  // Funcție pentru salvarea modificărilor la mormânt
  const saveGraveChanges = async () => {
    if (!selectedGrave) return;
    
    try {
      setLoadingDeceased(true);
      
      const response = await axios.put(
        `http://localhost:3000/api/graves/${selectedGrave.id}`,
        editFormData,
        { headers: getAuthHeader() }
      );
      
      // Actualizăm mormântul selectat cu noile date
      setSelectedGrave({
        ...selectedGrave,
        grave_number: editFormData.grave_number,
        status: editFormData.status,
        details: editFormData.details
      });
      
      setSaveSuccess(true);
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
    } catch (err) {
      setError('Nu s-au putut salva modificările. Verificați conexiunea și încercați din nou.');
      console.error(err);
    } finally {
      setLoadingDeceased(false);
    }
  };
  
  // Funcție pentru a începe editarea unei persoane decedate
  const startEditingDeceased = (deceased) => {
    setSelectedDeceasedForEdit(deceased);
    setDeceasedFormData({
      first_name: deceased.first_name,
      last_name: deceased.last_name,
      date_of_birth: deceased.date_of_birth ? new Date(deceased.date_of_birth).toISOString().split('T')[0] : '',
      date_of_death: deceased.date_of_death ? new Date(deceased.date_of_death).toISOString().split('T')[0] : '',
      details: deceased.details || '',
      photo_url: deceased.photo_url || ''
    });
    setIsEditingDeceased(true);
    setAddingNewDeceased(false);
  };
  
  // Funcție pentru a începe adăugarea unei noi persoane decedate
  const startAddingDeceased = () => {
    setDeceasedFormData({
      first_name: '',
      last_name: '',
      date_of_birth: '',
      date_of_death: '',
      details: '',
      photo_url: ''
    });
    setIsEditingDeceased(true);
    setAddingNewDeceased(true);
    setSelectedDeceasedForEdit(null);
  };
  
  // Funcție pentru a închide formularul de editare/adăugare persoană decedată
  const cancelDeceasedEdit = () => {
    setIsEditingDeceased(false);
    setAddingNewDeceased(false);
    setSelectedDeceasedForEdit(null);
  };
  
  // Funcție pentru salvarea modificărilor la persoana decedată
  const saveDeceasedChanges = async () => {
    if (!selectedGrave) return;
    
    try {
      setLoadingDeceased(true);
      
      if (addingNewDeceased) {
        // Adăugăm o nouă persoană decedată
        const response = await axios.post(
          `http://localhost:3000/api/deceased`,
          {
            ...deceasedFormData,
            grave_id: selectedGrave.id
          },
          { headers: getAuthHeader() }
        );
        
        // Adăugăm noua persoană la lista existentă
        setDeceasedList([...deceasedList, response.data.deceased]);
        
        // Actualizăm statusul mormântului la 'ocupat' dacă era liber
        if (selectedGrave.status === 'liber') {
          const updatedGrave = await axios.put(
            `http://localhost:3000/api/graves/${selectedGrave.id}`,
            { ...editFormData, status: 'ocupat' },
            { headers: getAuthHeader() }
          );
          
          setSelectedGrave({
            ...selectedGrave,
            status: 'ocupat'
          });
          
          setEditFormData({
            ...editFormData,
            status: 'ocupat'
          });
        }
      } else if (selectedDeceasedForEdit) {
        // Actualizăm o persoană decedată existentă
        const response = await axios.put(
          `http://localhost:3000/api/deceased/${selectedDeceasedForEdit.id}`,
          deceasedFormData,
          { headers: getAuthHeader() }
        );
        
        // Actualizăm lista de persoane decedate
        setDeceasedList(deceasedList.map(item => 
          item.id === selectedDeceasedForEdit.id ? response.data.deceased : item
        ));
      }
      
      setSaveSuccess(true);
      
      // Ieșim din modul de editare după salvare
      setTimeout(() => {
        setIsEditingDeceased(false);
        setAddingNewDeceased(false);
        setSelectedDeceasedForEdit(null);
        setSaveSuccess(false);
      }, 2000);
    } catch (err) {
      setError('Nu s-au putut salva modificările. Verificați conexiunea și încercați din nou.');
      console.error(err);
    } finally {
      setLoadingDeceased(false);
    }
  };
  
  // Funcție pentru ștergerea unei persoane decedate
  const deleteDeceased = async (deceased) => {
    if (!confirm(`Sunteți sigur că doriți să ștergeți persoana ${deceased.first_name} ${deceased.last_name}?`)) {
      return;
    }
    
    try {
      setLoadingDeceased(true);
      
      await axios.delete(
        `http://localhost:3000/api/deceased/${deceased.id}`,
        { headers: getAuthHeader() }
      );
      
      // Eliminăm persoana din lista locală
      setDeceasedList(deceasedList.filter(item => item.id !== deceased.id));
      
      // Dacă nu mai există persoane decedate, actualizăm statusul mormântului la 'liber'
      if (deceasedList.length === 1) {
        const updatedGrave = await axios.put(
          `http://localhost:3000/api/graves/${selectedGrave.id}`,
          { ...editFormData, status: 'liber' },
          { headers: getAuthHeader() }
        );
        
        setSelectedGrave({
          ...selectedGrave,
          status: 'liber'
        });
        
        setEditFormData({
          ...editFormData,
          status: 'liber'
        });
      }
      
      setIsEditingDeceased(false);
      setSelectedDeceasedForEdit(null);
    } catch (err) {
      setError('Nu s-a putut șterge persoana. Verificați conexiunea și încercați din nou.');
      console.error(err);
    } finally {
      setLoadingDeceased(false);
    }
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Detalii Mormânt</h3>
              
              {/* Buton de editare pentru administratori */}
              {isAdmin() && selectedGrave && !isEditingDeceased && (
                <button
                  onClick={toggleEditMode}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    isEditing 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-gray-200 hover:bg-primary/90 text-black'
                  }`}
                >
                  {isEditing ? 'Anulează' : 'Editează'}
                </button>
              )}
            </div>
            
            {!selectedGrave ? (
              <div className="h-96 flex items-center justify-center">
                <p className="text-gray-500">Selectați un mormânt pentru a vedea detaliile.</p>
              </div>
            ) : isEditingDeceased ? (
              /* Formular pentru editarea/adăugarea persoanei decedate */
              <div className="mb-6 space-y-4">
                {saveSuccess && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">
                    Modificările au fost salvate cu succes!
                  </div>
                )}
                
                <h4 className="font-semibold text-lg">
                  {addingNewDeceased ? 'Adăugare persoană decedată' : 'Editare persoană decedată'}
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prenume *
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={deceasedFormData.first_name}
                      onChange={handleDeceasedFormChange}
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
                      onChange={handleDeceasedFormChange}
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
                      onChange={handleDeceasedFormChange}
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
                      onChange={handleDeceasedFormChange}
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
                    onChange={handleDeceasedFormChange}
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
                    onChange={handleDeceasedFormChange}
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  ></textarea>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={saveDeceasedChanges}
                    disabled={loadingDeceased}
                    className="flex-1 bg-primary hover:bg-primary/90 text-black font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    {loadingDeceased ? 'Se salvează...' : 'Salvează'}
                  </button>
                  
                  <button
                    onClick={cancelDeceasedEdit}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Anulează
                  </button>
                </div>
                
                {/* Buton de ștergere pentru persoanele existente */}
                {!addingNewDeceased && selectedDeceasedForEdit && (
                  <button
                    onClick={() => deleteDeceased(selectedDeceasedForEdit)}
                    className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Șterge persoana
                  </button>
                )}
              </div>
            ) : isEditing ? (
              /* Formular de editare pentru mormânt */
              <div className="mb-6 space-y-4">
                {saveSuccess && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">
                    Modificările au fost salvate cu succes!
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Număr mormânt
                  </label>
                  <input
                    type="text"
                    name="grave_number"
                    value={editFormData.grave_number}
                    onChange={handleEditFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={editFormData.status}
                    onChange={handleEditFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  >
                    <option value="liber">Liber</option>
                    <option value="rezervat">Rezervat</option>
                    <option value="ocupat">Ocupat</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Detalii suplimentare
                  </label>
                  <textarea
                    name="details"
                    value={editFormData.details}
                    onChange={handleEditFormChange}
                    rows="4"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  ></textarea>
                </div>
                
                <button
                  onClick={saveGraveChanges}
                  disabled={loadingDeceased}
                  className="w-full bg-primary hover:bg-primary/90 text-black font-medium py-2 px-4 rounded-md transition-colors"
                >
                  {loadingDeceased ? 'Se salvează...' : 'Salvează modificările'}
                </button>
                
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold mb-2">Persoane decedate:</h4>
                  
                  {loadingDeceased ? (
                    <p className="text-center py-4 text-gray-500">Se încarcă...</p>
                  ) : deceasedList.length > 0 ? (
                    <div className="space-y-4">
                      {deceasedList.map((deceased) => (
                        <div key={deceased.id} className="border rounded p-3 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{deceased.first_name} {deceased.last_name}</p>
                            <p className="text-sm text-gray-600">
                              {deceased.date_of_birth ? formatDate(deceased.date_of_birth) : '?'} - {formatDate(deceased.date_of_death)}
                            </p>
                          </div>
                          <button
                            onClick={() => startEditingDeceased(deceased)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded text-sm"
                          >
                            Editează
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic py-2">
                      Nu există persoane decedate pentru acest mormânt.
                    </p>
                  )}
                  
                  <button
                    onClick={startAddingDeceased}
                    className="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Adaugă persoană decedată
                  </button>
                </div>
              </div>
            ) : (
              /* Modul de vizualizare normală */
              <>
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
                  
                  {selectedGrave.details && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-sm text-gray-600">{selectedGrave.details}</p>
                    </div>
                  )}
                </div>
                
                <h4 className="font-semibold mb-2">Persoane decedate:</h4>
                
                {loadingDeceased ? (
                  <p className="text-center py-4 text-gray-500">Se încarcă...</p>
                ) : deceasedList.length > 0 ? (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {deceasedList.map((deceased) => (
                      <div key={deceased.id} className="relative">
                        {isAdmin() && (
                          <button
                            onClick={() => startEditingDeceased(deceased)}
                            className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full p-1 z-10"
                            title="Editează persoana"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        )}
                        <DeceasedDetails deceased={deceased} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic py-4">
                    Nu există informații despre persoane decedate pentru acest mormânt.
                  </p>
                )}
                
                {/* Buton de adăugare persoană decedată pentru admin */}
                {isAdmin() && (
                  <button
                    onClick={startAddingDeceased}
                    className="mt-4 w-full bg-gray-200 hover:bg-primary/90 text-black font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Adaugă persoană decedată
                  </button>
                )}
              </>
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

  return ReactDOM.createPortal(
    modalContent,
    document.body
  );
};

export default SectorDetailModal;