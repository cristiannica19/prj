// src/context/__tests__/AuthContext.isAdmin.test.jsx
import React from 'react'
import { render, screen, cleanup } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useAuth } from '../AuthContext'
import "@testing-library/jest-dom/vitest"

// Mock-uim hook-ul useAuth pentru control complet în teste
// Aceasta ne permite să simulăm exact stările de utilizator pe care vrem să le testăm
vi.mock('../AuthContext', () => ({
  useAuth: vi.fn()
}))

// Componentă simplă de test care afișează rezultatul funcției isAdmin()
// Servește ca o "fereastră" prin care putem observa comportamentul funcției
const TestComponent = () => {
  const { isAdmin, user } = useAuth()
  const result = isAdmin()
  
  return (
    <div>
      <span data-testid="is-admin">{result ? 'admin' : 'not-admin'}</span>
    </div>
  )
}

// Funcție helper care configurează mock-ul cu valorile dorite
// Aceasta centralizează configurația și face testele mai clare
const mockAuth = (user) => {
  vi.mocked(useAuth).mockReturnValue({
    user,
    isAdmin: () => user && user.role === 'admin'
  })
}

describe('Funcția isAdmin() - Teste Esențiale', () => {
  beforeEach(() => {
    // Curățăm mock-urile pentru a asigura izolarea între teste
    vi.clearAllMocks()
  })

  afterEach(() => {
    // IMPORTANT: Curățăm DOM-ul după fiecare test pentru a preveni acumularea componentelor
    // Aceasta elimină toate componentele randate din testul anterior,
    // asigurând că fiecare test începe cu un DOM curat
    cleanup()
  })

  it('returnează true pentru administratori', () => {
    // Test: verificăm că administratorii sunt recunoscuți
    const adminUser = {
      id: 1,
      username: 'admin',
      role: 'admin'
    }
    mockAuth(adminUser)
    render(<TestComponent />)
    expect(screen.getByTestId('is-admin')).toHaveTextContent('admin')
  })

  it('returnează false pentru utilizatori neautentificați', () => {
    // Test: uilizatorii neautentificați nu trebuie să primească privilegii administrative 
    mockAuth(null)
    render(<TestComponent />)
    expect(screen.getByTestId('is-admin')).toHaveTextContent('not-admin')
  })

  it('returnează false pentru utilizatori obișnuiți', () => {
    // Test: utilizatorii cu rol diferit de 'admin' nu trebuie să primească acces administrativ
    const regularUser = {
      id: 2,
      username: 'utilizator',
      role: 'user'
    }
    mockAuth(regularUser)
    render(<TestComponent />)
    expect(screen.getByTestId('is-admin')).toHaveTextContent('not-admin')
  })
})