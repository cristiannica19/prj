const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const { authenticateToken, isAdmin } = require('./auth');

// Obține toți utilizatorii (doar admin)
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await pool.query(
      'SELECT id, username, email, first_name, last_name, phone, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users.rows);
  } catch (err) {
    console.error('Eroare la obținerea utilizatorilor:', err.message);
    res.status(500).json({ message: 'Eroare la server' });
  }
});

// Obține un utilizator specific (admin sau utilizatorul însuși)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificăm dacă utilizatorul are dreptul să acceseze datele
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ message: 'Acces interzis' });
    }
    
    const user = await pool.query(
      'SELECT id, username, email, first_name, last_name, phone, role, created_at FROM users WHERE id = $1',
      [id]
    );
    
    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'Utilizator negăsit' });
    }
    
    res.json(user.rows[0]);
  } catch (err) {
    console.error('Eroare la obținerea utilizatorului:', err.message);
    res.status(500).json({ message: 'Eroare la server' });
  }
});

// Actualizează un utilizator (admin sau utilizatorul însuși)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, role } = req.body;
    
    // Verificăm dacă utilizatorul are dreptul să modifice datele
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ message: 'Acces interzis' });
    }
    
    // Dacă nu este admin, nu poate modifica rolul
    let updatedRole = role;
    if (req.user.role !== 'admin') {
      // Obținem rolul curent pentru a ne asigura că nu se modifică
      const currentUser = await pool.query(
        'SELECT role FROM users WHERE id = $1',
        [id]
      );
      updatedRole = currentUser.rows[0].role;
    }
    
    const updatedUser = await pool.query(
      'UPDATE users SET first_name = $1, last_name = $2, email = $3, phone = $4, role = $5 WHERE id = $6 RETURNING id, username, email, first_name, last_name, phone, role',
      [firstName, lastName, email, phone, updatedRole, id]
    );
    
    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ message: 'Utilizator negăsit' });
    }
    
    res.json({
      message: 'Utilizator actualizat cu succes',
      user: updatedUser.rows[0]
    });
  } catch (err) {
    console.error('Eroare la actualizarea utilizatorului:', err.message);
    res.status(500).json({ message: 'Eroare la server' });
  }
});

// Schimbare parolă
router.put('/:id/change-password', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    
    // Verificăm dacă utilizatorul are dreptul să schimbe parola
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ message: 'Acces interzis' });
    }
    
    // Obținem informațiile utilizatorului
    const user = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    
    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'Utilizator negăsit' });
    }
    
    // Verificăm parola curentă dacă nu este admin
    if (req.user.role !== 'admin') {
      const validPassword = await bcrypt.compare(currentPassword, user.rows[0].password_hash);
      if (!validPassword) {
        return res.status(400).json({ message: 'Parola curentă este incorectă' });
      }
    }
    
    // Criptăm parola nouă
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Actualizăm parola
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [hashedPassword, id]
    );
    
    res.json({ message: 'Parola a fost schimbată cu succes' });
  } catch (err) {
    console.error('Eroare la schimbarea parolei:', err.message);
    res.status(500).json({ message: 'Eroare la server' });
  }
});

// Șterge un utilizator (doar admin)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificăm dacă utilizatorul este persoană de legătură pentru vreun mormânt
    const graves = await pool.query(
      'SELECT id FROM graves WHERE contact_person_id = $1',
      [id]
    );
    
    if (graves.rows.length > 0) {
      // Eliminăm relația cu mormintele
      await pool.query(
        'UPDATE graves SET contact_person_id = NULL WHERE contact_person_id = $1',
        [id]
      );
    }
    
    // Ștergem utilizatorul
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Utilizator negăsit' });
    }
    
    res.json({ message: 'Utilizator șters cu succes' });
  } catch (err) {
    console.error('Eroare la ștergerea utilizatorului:', err.message);
    res.status(500).json({ message: 'Eroare la server' });
  }
});

module.exports = router;