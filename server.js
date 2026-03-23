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
    return res.status(400).json({ message: 'All Fields REQUIRED' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords Do Not Match' });
  }

  const checkQuery = 'SELECT * FROM user WHERE username = ? OR email = ? OR phone = ?';

  db.query(checkQuery, [username, email, phone], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database Error' });
    }

    if (results.length > 0) {
      const existing = results[0];

      if (existing.username === username) {
        return res.status(400).json({ message: 'Username In Use' });
      }

      if (existing.email === email) {
        return res.status(400).json({ message: 'Email In Use' });
      }

      if (existing.phone === phone) {
        return res.status(400).json({ message: 'Phone Number In Use' });
      }
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ message: 'Error Hashing Password' });
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
            return res.status(500).json({ message: 'Error Registering User' });
          }

          return res.status(201).json({ message: 'Account Created Successfully' });
        }
      );
    });
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and Password REQUIRED' });
  }

  const query = 'SELECT * FROM user WHERE username = ?';

  db.query(query, [username], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database Error' });
    if (results.length === 0) return res.status(401).json({ message: 'Invalid Username or Password' });

    const user = results[0];
    bcrypt.compare(password, user.password, (err, match) => {
      if (err) return res.status(500).json({ message: 'Error Verifying Password' });
      if (!match) return res.status(401).json({ message: 'Invalid Username or Password' });

      res.status(200).json({
        message: 'Login Successful',
        user: {
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone
        }
      });
    });
  });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});