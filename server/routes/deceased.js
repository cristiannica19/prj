const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, isAdmin } = require('./auth');

// Adaugă o persoană decedată nouă (doar admin)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { first_name, last_name, date_of_birth, date_of_death, details, photo_url, grave_id } = req.body;
    
    // Verificăm dacă mormântul există
    const grave = await pool.query(
      'SELECT * FROM graves WHERE id = $1',
      [grave_id]
    );
    
    if (grave.rows.length === 0) {
      return res.status(404).json({ message: 'Mormântul nu a fost găsit' });
    }
    
    // Adăugăm persoana decedată
    const result = await pool.query(
      `INSERT INTO deceased 
       (first_name, last_name, date_of_birth, date_of_death, details, photo_url, grave_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [first_name, last_name, date_of_birth, date_of_death, details, photo_url, grave_id]
    );
    
    // Actualizăm statusul mormântului la 'ocupat' dacă era 'liber'
    await pool.query(
      `UPDATE graves SET status = 'ocupat' WHERE id = $1 AND status = 'liber'`,
      [grave_id]
    );
    
    res.status(201).json({
      message: 'Persoană decedată adăugată cu succes',
      deceased: result.rows[0]
    });
  } catch (err) {
    console.error('Eroare la adăugarea persoanei decedate:', err.message);
    res.status(500).json({ message: 'Eroare la server' });
  }
});

// Actualizează o persoană decedată (doar admin)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, date_of_birth, date_of_death, details, photo_url } = req.body;
    
    // Verificăm dacă persoana există
    const deceased = await pool.query(
      'SELECT * FROM deceased WHERE id = $1',
      [id]
    );
    
    if (deceased.rows.length === 0) {
      return res.status(404).json({ message: 'Persoana decedată nu a fost găsită' });
    }
    
    // Actualizăm persoana decedată
    const result = await pool.query(
      `UPDATE deceased 
       SET first_name = $1, last_name = $2, date_of_birth = $3, date_of_death = $4, details = $5, photo_url = $6
       WHERE id = $7 
       RETURNING *`,
      [first_name, last_name, date_of_birth, date_of_death, details, photo_url, id]
    );
    
    res.json({
      message: 'Persoană decedată actualizată cu succes',
      deceased: result.rows[0]
    });
  } catch (err) {
    console.error('Eroare la actualizarea persoanei decedate:', err.message);
    res.status(500).json({ message: 'Eroare la server' });
  }
});

// Șterge o persoană decedată (doar admin)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obținem informații despre persoana decedată inclusiv grave_id
    const deceased = await pool.query(
      'SELECT * FROM deceased WHERE id = $1',
      [id]
    );
    
    if (deceased.rows.length === 0) {
      return res.status(404).json({ message: 'Persoana decedată nu a fost găsită' });
    }
    
    const graveId = deceased.rows[0].grave_id;
    
    // Ștergem persoana decedată
    await pool.query(
      'DELETE FROM deceased WHERE id = $1',
      [id]
    );
    
    // Verificăm dacă mai există persoane decedate în acest mormânt
    const remainingDeceased = await pool.query(
      'SELECT COUNT(*) FROM deceased WHERE grave_id = $1',
      [graveId]
    );
    
    // Dacă nu mai există persoane decedate, actualizăm statusul mormântului la 'liber'
    if (parseInt(remainingDeceased.rows[0].count) === 0) {
      await pool.query(
        `UPDATE graves SET status = 'liber' WHERE id = $1 AND status = 'ocupat'`,
        [graveId]
      );
    }
    
    res.json({ 
      message: 'Persoană decedată ștearsă cu succes',
      grave_id: graveId,
      has_more_deceased: parseInt(remainingDeceased.rows[0].count) > 0
    });
  } catch (err) {
    console.error('Eroare la ștergerea persoanei decedate:', err.message);
    res.status(500).json({ message: 'Eroare la server' });
  }
});

module.exports = router;