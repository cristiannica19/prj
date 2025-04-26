const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, isAdmin } = require('./auth');

// Actualizează un mormânt (doar admin)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { grave_number, status, details } = req.body;
    
    // Verificăm dacă mormântul există
    const graveCheck = await pool.query(
      'SELECT * FROM graves WHERE id = $1',
      [id]
    );
    
    if (graveCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Mormântul nu a fost găsit' });
    }
    
    // Actualizăm mormântul
    const updatedGrave = await pool.query(
      'UPDATE graves SET grave_number = $1, status = $2, details = $3 WHERE id = $4 RETURNING *',
      [grave_number, status, details, id]
    );
    
    res.json({
      message: 'Mormânt actualizat cu succes',
      grave: updatedGrave.rows[0]
    });
  } catch (err) {
    console.error('Eroare la actualizarea mormântului:', err.message);
    res.status(500).json({ message: 'Eroare la server' });
  }
});

module.exports = router;