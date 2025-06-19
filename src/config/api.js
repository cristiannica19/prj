// Configurația de bază pentru API-ul aplicației
// Această configurație permite aplicației să funcționeze atât în development cât și în producție

// Folosim variabila de mediu VITE_API_URL pentru producție
// Dacă nu este setată, folosim localhost pentru development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Exportăm URL-ul complet al API-ului (inclusiv /api)
const API_URL = `${API_BASE_URL}/api`;

// Exportăm și URL-ul de bază pentru cazuri speciale
export { API_BASE_URL, API_URL };