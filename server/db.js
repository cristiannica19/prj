const { Pool } = require('pg');
require('dotenv').config();

// Crearea pool-ului de conexiuni la baza de date
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// Testarea conexiunii
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Eroare la conectarea la baza de date:', err);
  }
  console.log('Conexiune la baza de date stabilită cu succes');
  release();
});

module.exports = pool;