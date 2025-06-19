// src/components/__tests__/Layout.test.jsx
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import Layout from '../Layout'
import { AuthProvider } from '../../context/AuthContext'
import "@testing-library/jest-dom/vitest"


// Mock pentru axios cu o configurație mai robustă
vi.mock('axios', () => ({
  default: {
    get: vi.fn((url) => {
      // Simulăm răspunsuri specifice pentru diferite endpoint-uri
      if (url.includes('/api/auth/me')) {
        return Promise.resolve({ 
          data: { user: null } 
        })
      }
      return Promise.resolve({ data: {} })
    }),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    defaults: { 
      headers: { 
        common: {} 
      } 
    }
  }
}))

// Funcție helper care încapsulează logica de randare cu toate dependențele
const renderWithAuthProvider = (component) => {
  // Această funcție este esențială pentru a oferi contextul complet
  // pe care componenta Layout îl așteaptă în aplicația reală
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('Testare Layout Component', () => {
 beforeEach(() => {
   vi.clearAllMocks()
   localStorage.clear()
 })

 it('verifică toate aspectele importante ale layout-ului', async () => {
   renderWithAuthProvider(
     <Layout>
       <main data-testid="main-content">
         <h1>Pagina de test</h1>
         <p>Conținut pentru verificarea layout-ului</p>
       </main>
     </Layout>
   )
   
   // Așteptăm stabilizarea componentei
   await waitFor(() => {
     expect(screen.getByTestId('main-content')).toBeInTheDocument()
   })
   
   // Testăm header-ul și titlul
   const title = screen.getByText(/sistem.*administrare.*cimitir/i)
   expect(title).toBeInTheDocument()
   
   // Testăm navigația pentru utilizatori neautentificați
   expect(screen.getByText('Autentificare')).toBeInTheDocument()
   expect(screen.getByText('Înregistrare')).toBeInTheDocument()
   
   // Testăm conținutul principal
   expect(screen.getByText('Pagina de test')).toBeInTheDocument()
   expect(screen.getByText('Conținut pentru verificarea layout-ului')).toBeInTheDocument()
  
   
  
 })
})