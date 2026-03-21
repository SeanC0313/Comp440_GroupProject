const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
const db = require('./db');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // for UI

// create account 'sign up'
app.post('/api/signup', (req, res) => {
  const { username, password, confirmPassword, firstName, lastName, email, phone } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords Do Not Match ' });
  }

  const checkQuery = 'SELECT * FROM user WHERE username = ? OR email = ? OR phone = ?';
  db.query(checkQuery, [username, email, phone], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error.' });

    if (results.length > 0) {
      const existing = results[0];
      if (existing.username === username) return res.status(400).json({ message: 'Username in use ' });
      if (existing.email === email) return res.status(400).json({ message: 'Email in use ' });
      if (existing.phone === phone) return res.status(400).json({ message: 'Phone Number in use ' });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return res.status(500).json({ message: 'Error hashing password.' });

      const insertQuery = 'INSERT INTO user (username, password, firstName, lastName, email, phone) VALUES (?, ?, ?, ?, ?, ?)';

      db.query(insertQuery, [username, hashedPassword, firstName, lastName, email, phone], (err) => {
        if (err) return res.status(500).json({ message: 'Error Registering User' });
        res.status(201).json({ message: 'Account Created' });
      });
    });
  });
});

// to add <3

// ADD the /api/login route here pls
// query the user table using a parameterized query (use ? placeholder, NOT string concatenation)
// bcrypt.compare() to verify the password against the hashed password in the database
// return the user object on success (error message if failure)

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});