const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, isAdmin } = require('./auth');

// Setează persoana de legătură pentru un mormânt (admin)
router.put('/:graveId/contact-person', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { graveId } = req.params;
    const { userId } = req.body;
    
    // Verificăm dacă mormântul există
    const grave = await pool.query(
      'SELECT * FROM graves WHERE id = $1',
      [graveId]
    );
    
    if (grave.rows.length === 0) {
      return res.status(404).json({ message: 'Mormântul nu a fost găsit' });
    }
    
    let result;
    
    if (userId) {
      // Verificăm dacă utilizatorul există
      const user = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [userId]
      );
      
      if (user.rows.length === 0) {
        return res.status(404).json({ message: 'Utilizatorul nu a fost găsit' });
      }
      
      // Actualizăm mormântul cu noua persoană de legătură
      result = await pool.query(
        'UPDATE graves SET contact_person_id = $1 WHERE id = $2 RETURNING id, grave_number, sector_id, status, contact_person_id',
        [userId, graveId]
      );
    } else {
      // Eliminăm persoana de legătură
      result = await pool.query(
        'UPDATE graves SET contact_person_id = NULL WHERE id = $1 RETURNING id, grave_number, sector_id, status, contact_person_id',
        [graveId]
      );
    }
    
    res.json({
      message: 'Persoana de legătură actualizată cu succes',
      grave: result.rows[0]
    });
  } catch (err) {
    console.error('Eroare la actualizarea persoanei de legătură:', err.message);
    res.status(500).json({ message: 'Eroare la server' });
  }
});

// Obține toate mormintele asociate cu un utilizator (persoană de legătură)
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verificăm dacă utilizatorul are permisiunea (admin sau utilizatorul însuși)
    if (req.user.role !== 'admin' && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ message: 'Acces interzis' });
    }
    
    // Obținem mormintele asociate cu utilizatorul
    const graves = await pool.query(`
      SELECT g.*, s.name as sector_name
      FROM graves g
      JOIN sectors s ON g.sector_id = s.id
      WHERE g.contact_person_id = $1
    `, [userId]);
    
    res.json(graves.rows);
  } catch (err) {
    console.error('Eroare la obținerea mormintelor asociate:', err.message);
    res.status(500).json({ message: 'Eroare la server' });
  }
});

// Obține informații despre persoana de legătură pentru un mormânt
router.get('/:graveId/contact-person', authenticateToken, async (req, res) => {
  try {
    const { graveId } = req.params;
    
    // Obținem informații despre mormânt și persoana de legătură
    const result = await pool.query(`
      SELECT g.id as grave_id, g.grave_number, g.sector_id, s.name as sector_name,
             u.id as user_id, u.username, u.email, u.first_name, u.last_name, u.phone
      FROM graves g
      LEFT JOIN users u ON g.contact_person_id = u.id
      JOIN sectors s ON g.sector_id = s.id
      WHERE g.id = $1
    `, [graveId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Mormântul nu a fost găsit' });
    }
    
    // Verificăm dacă utilizatorul are permisiunea (admin, persoana de legătură sau un utilizator cu acces la mormânt)
    if (req.user.role !== 'admin' && 
        (!result.rows[0].user_id || result.rows[0].user_id !== req.user.id)) {
      return res.status(403).json({ message: 'Acces interzis' });
    }
    
    res.json({
      grave: {
        id: result.rows[0].grave_id,
        graveNumber: result.rows[0].grave_number,
        sectorId: result.rows[0].sector_id,
        sectorName: result.rows[0].sector_name
      },
      contactPerson: result.rows[0].user_id ? {
        id: result.rows[0].user_id,
        username: result.rows[0].username,
        email: result.rows[0].email,
        firstName: result.rows[0].first_name,
        lastName: result.rows[0].last_name,
        phone: result.rows[0].phone
      } : null
    });
  } catch (err) {
    console.error('Eroare la obținerea informațiilor despre persoana de legătură:', err.message);
    res.status(500).json({ message: 'Eroare la server' });
  }
});

module.exports = router;