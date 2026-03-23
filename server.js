const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
const db = require('./db');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // for UI

// create account 'sign up'
app.post('/api/signup', (req, res) => {
  let { username, password, confirmPassword, firstName, lastName, email, phone } = req.body;

  username = username?.trim();
  firstName = firstName?.trim();
  lastName = lastName?.trim();
  email = email?.trim();
  phone = phone?.trim();

  if (!username || !password || !confirmPassword || !firstName || !lastName || !email || !phone) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  const checkQuery = 'SELECT * FROM user WHERE username = ? OR email = ? OR phone = ?';

  db.query(checkQuery, [username, email, phone], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error.' });
    }

    if (results.length > 0) {
      const existing = results[0];

      if (existing.username === username) {
        return res.status(400).json({ message: 'Username already in use.' });
      }

      if (existing.email === email) {
        return res.status(400).json({ message: 'Email already in use.' });
      }

      if (existing.phone === phone) {
        return res.status(400).json({ message: 'Phone number already in use.' });
      }
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ message: 'Error hashing password.' });
      }

      const insertQuery = `
        INSERT INTO user (username, password, firstName, lastName, email, phone)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.query(
        insertQuery,
        [username, hashedPassword, firstName, lastName, email, phone],
        (err) => {
          if (err) {
            return res.status(500).json({ message: 'Error registering user.' });
          }

          return res.status(201).json({ message: 'Account created successfully.' });
        }
      );
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