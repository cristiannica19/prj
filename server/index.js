const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ROUTES PENTRU SECTOARE
// Obține toate sectoarele
app.get('/api/sectors', async (req, res) => {
  try {
    const allSectors = await pool.query('SELECT * FROM sectors');
    res.json(allSectors.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Obține un sector după ID
app.get('/api/sectors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sector = await pool.query('SELECT * FROM sectors WHERE id = $1', [id]);
    res.json(sector.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ROUTES PENTRU MORMINTE
// Obține toate mormintele dintr-un sector
app.get('/api/sectors/:id/graves', async (req, res) => {
  try {
    const { id } = req.params;
    const graves = await pool.query('SELECT * FROM graves WHERE sector_id = $1', [id]);
    res.json(graves.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Obține un mormânt după ID
app.get('/api/graves/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const grave = await pool.query('SELECT * FROM graves WHERE id = $1', [id]);
    res.json(grave.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ROUTES PENTRU PERSOANE DECEDATE
// Obține toate persoanele decedate
app.get('/api/deceased', async (req, res) => {
  try {
    const allDeceased = await pool.query(`
      SELECT d.*, g.grave_number, s.name as sector_name
      FROM deceased d
      JOIN graves g ON d.grave_id = g.id
      JOIN sectors s ON g.sector_id = s.id
    `);
    res.json(allDeceased.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Căutare persoane decedate
app.get('/api/deceased/search', async (req, res) => {
  try {
    const { query } = req.query;
    const searchResults = await pool.query(`
      SELECT d.*, g.grave_number, s.name as sector_name
      FROM deceased d
      JOIN graves g ON d.grave_id = g.id
      JOIN sectors s ON g.sector_id = s.id
      WHERE d.first_name ILIKE $1 OR d.last_name ILIKE $1
    `, [`%${query}%`]);
    res.json(searchResults.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Obține o persoană decedată după ID
app.get('/api/deceased/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deceased = await pool.query(`
      SELECT d.*, g.grave_number, g.status, s.name as sector_name
      FROM deceased d
      JOIN graves g ON d.grave_id = g.id
      JOIN sectors s ON g.sector_id = s.id
      WHERE d.id = $1
    `, [id]);
    res.json(deceased.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Obține detalii despre persoanele decedate dintr-un mormânt
app.get('/api/graves/:id/deceased', async (req, res) => {
  try {
    const { id } = req.params;
    const deceasedInGrave = await pool.query('SELECT * FROM deceased WHERE grave_id = $1', [id]);
    res.json(deceasedInGrave.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Pornește serverul
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});