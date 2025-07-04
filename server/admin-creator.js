// Salvează ca admin-creator.js în directorul server
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

async function createAdmin() {
  // Configurarea conexiunii la baza de date
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
  });

  try {
    // Solicită informațiile admin-ului de la linia de comandă sau setează-le direct
    const username = 'admin';
    const email = 'admin@example.com';
    const password = 'admin'; // 
    const firstName = 'Administrator';
    const lastName = 'Sistem';
    const phone = '0700000000';
    
    // Generează hash-ul parolei
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Verifică dacă admin-ul există deja
    const checkResult = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    
    if (checkResult.rows.length > 0) {
      console.log('Un utilizator cu acest username sau email există deja.');
      return;
    }
    
    // Inserează admin-ul
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, phone, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, username, email, role`,
      [username, email, passwordHash, firstName, lastName, phone, 'admin']
    );
    
    console.log('Administrator creat cu succes:');
    console.log(result.rows[0]);
  } catch (err) {
    console.error('Eroare la crearea administratorului:', err);
  } finally {
    // Închide conexiunea
    await pool.end();
  }
}

createAdmin();