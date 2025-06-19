// import axios from 'axios';

// const API_URL = 'http://localhost:3000/api';

// // Crearea instanței axios cu configurări de bază
// const api = axios.create({
//   baseURL: API_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Servicii pentru sectoare
// export const getSectors = async () => {
//   try {
//     const response = await api.get('/sectors');
//     return response.data;
//   } catch (error) {
//     console.error('Eroare la obținerea sectoarelor:', error);
//     throw error;
//   }
// };

// export const getSectorById = async (id) => {
//   try {
//     const response = await api.get(`/sectors/${id}`);
//     return response.data;
//   } catch (error) {
//     console.error(`Eroare la obținerea sectorului ${id}:`, error);
//     throw error;
//   }
// };

// // Servicii pentru morminte
// export const getGravesBySector = async (sectorId) => {
//   try {
//     const response = await api.get(`/sectors/${sectorId}/graves`);
//     return response.data;
//   } catch (error) {
//     console.error(`Eroare la obținerea mormintelor din sectorul ${sectorId}:`, error);
//     throw error;
//   }
// };

// export const getGraveById = async (id) => {
//   try {
//     const response = await api.get(`/graves/${id}`);
//     return response.data;
//   } catch (error) {
//     console.error(`Eroare la obținerea mormântului ${id}:`, error);
//     throw error;
//   }
// };

// // Servicii pentru persoane decedate
// export const getAllDeceased = async () => {
//   try {
//     const response = await api.get('/deceased');
//     return response.data;
//   } catch (error) {
//     console.error('Eroare la obținerea persoanelor decedate:', error);
//     throw error;
//   }
// };

// export const searchDeceased = async (query) => {
//   try {
//     const response = await api.get(`/deceased/search?query=${encodeURIComponent(query)}`);
//     return response.data;
//   } catch (error) {
//     console.error(`Eroare la căutarea persoanelor decedate cu query "${query}":`, error);
//     throw error;
//   }
// };

// export const getDeceasedById = async (id) => {
//   try {
//     const response = await api.get(`/deceased/${id}`);
//     return response.data;
//   } catch (error) {
//     console.error(`Eroare la obținerea persoanei decedate ${id}:`, error);
//     throw error;
//   }
// };

// export const getDeceasedByGrave = async (graveId) => {
//   try {
//     const response = await api.get(`/graves/${graveId}/deceased`);
//     return response.data;
//   } catch (error) {
//     console.error(`Eroare la obținerea persoanelor decedate din mormântul ${graveId}:`, error);
//     throw error;
//   }
// };

import axios from 'axios';
import { API_URL } from '../config/api.js';

// Crearea instanței axios cu configurări de bază
// Acum folosim API_URL din configurație în loc de hardcoded localhost
const api = axios.create({
  baseURL: API_URL, // Acest URL se va schimba automat între development și producție
  headers: {
    'Content-Type': 'application/json',
  },
});

// Servicii pentru sectoare
export const getSectors = async () => {
  try {
    const response = await api.get('/sectors');
    return response.data;
  } catch (error) {
    console.error('Eroare la obținerea sectoarelor:', error);
    throw error;
  }
};

export const getSectorById = async (id) => {
  try {
    const response = await api.get(`/sectors/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Eroare la obținerea sectorului ${id}:`, error);
    throw error;
  }
};

// Servicii pentru morminte
export const getGravesBySector = async (sectorId) => {
  try {
    const response = await api.get(`/sectors/${sectorId}/graves`);
    return response.data;
  } catch (error) {
    console.error(`Eroare la obținerea mormintelor din sectorul ${sectorId}:`, error);
    throw error;
  }
};

export const getGraveById = async (id) => {
  try {
    const response = await api.get(`/graves/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Eroare la obținerea mormântului ${id}:`, error);
    throw error;
  }
};

// Servicii pentru persoane decedate
export const getAllDeceased = async () => {
  try {
    const response = await api.get('/deceased');
    return response.data;
  } catch (error) {
    console.error('Eroare la obținerea persoanelor decedate:', error);
    throw error;
  }
};

export const searchDeceased = async (query) => {
  try {
    const response = await api.get(`/deceased/search?query=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error(`Eroare la căutarea persoanelor decedate cu query "${query}":`, error);
    throw error;
  }
};

export const getDeceasedById = async (id) => {
  try {
    const response = await api.get(`/deceased/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Eroare la obținerea persoanei decedate ${id}:`, error);
    throw error;
  }
};

export const getDeceasedByGrave = async (graveId) => {
  try {
    const response = await api.get(`/graves/${graveId}/deceased`);
    return response.data;
  } catch (error) {
    console.error(`Eroare la obținerea persoanelor decedate din mormântul ${graveId}:`, error);
    throw error;
  }
};