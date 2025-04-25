const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Middleware pentru verificarea autentificării
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Acces interzis' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token invalid sau expirat' });
    req.user = user;
    next();
  });
};

// Middleware pentru verificarea rolului de admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acces interzis - necesită drepturi de administrator' });
  }
  next();
};

// Înregistrare utilizator
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, phone } = req.body;

    // Verificăm dacă username sau email există deja
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (userCheck.rows.length > 0) {
      return res.status(400).json({ 
        message: 'Utilizatorul există deja', 
        field: userCheck.rows[0].username === username ? 'username' : 'email' 
      });
    }

    // Criptăm parola
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Inserăm utilizatorul nou
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password_hash, first_name, last_name, phone, role) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, username, email, role',
      [username, email, hashedPassword, firstName, lastName, phone, 'user']
    );

    res.status(201).json({
      message: 'Utilizator creat cu succes',
      user: newUser.rows[0]
    });
  } catch (err) {
    console.error('Eroare la înregistrare:', err.message);
    res.status(500).json({ message: 'Eroare la server' });
  }
});

// Autentificare utilizator
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Căutăm utilizatorul
    const user = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $1',
      [username]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Nume de utilizator sau parolă incorectă' });
    }

    // Verificăm parola
    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPassword) {
      return res.status(400).json({ message: 'Nume de utilizator sau parolă incorectă' });
    }

    // Generăm token JWT
    const token = jwt.sign(
      { 
        id: user.rows[0].id, 
        username: user.rows[0].username,
        role: user.rows[0].role 
      }, 
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Autentificare reușită',
      token,
      user: {
        id: user.rows[0].id,
        username: user.rows[0].username,
        email: user.rows[0].email,
        firstName: user.rows[0].first_name,
        lastName: user.rows[0].last_name,
        role: user.rows[0].role
      }
    });
  } catch (err) {
    console.error('Eroare la autentificare:', err.message);
    res.status(500).json({ message: 'Eroare la server' });
  }
});

// Obține informații despre utilizatorul autentificat
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await pool.query(
      'SELECT id, username, email, first_name, last_name, phone, role FROM users WHERE id = $1',
      [req.user.id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'Utilizator negăsit' });
    }

    res.json({
      user: user.rows[0]
    });
  } catch (err) {
    console.error('Eroare la obținerea profilului:', err.message);
    res.status(500).json({ message: 'Eroare la server' });
  }
});

// Exportăm routerul și middleware-ul pentru a fi folosite în alte părți ale aplicației
module.exports = { 
  router, 
  authenticateToken,
  isAdmin
};