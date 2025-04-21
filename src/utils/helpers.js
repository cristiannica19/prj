// Funcția pentru formatarea datelor
export const formatDate = (dateString) => {
  if (!dateString) return 'Necunoscută';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('ro-RO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Funcție pentru a determina culoarea unui mormânt în funcție de status
export const getGraveStatusColor = (status) => {
  switch (status) {
    case 'ocupat':
      return '#ef4444'; // Roșu
    case 'rezervat':
      return '#f59e0b'; // Galben/Portocaliu
    case 'liber':
      return '#10b981'; // Verde
    default:
      return '#6b7280'; // Gri
  }
};

// Funcție pentru a obține un text descriptiv pentru status
export const getStatusText = (status) => {
  switch (status) {
    case 'ocupat':
      return 'Ocupat';
    case 'rezervat':
      return 'Rezervat';
    case 'liber':
      return 'Liber';
    default:
      return 'Necunoscut';
  }
};