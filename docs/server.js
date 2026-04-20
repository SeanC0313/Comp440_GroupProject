const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
const db = require('../db');

const app = express();

app.use(express.json());
app.use(express.static(__dirname)); // for UI

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

// phase 2 stuff

// insert new rental unit
app.post('/api/rental', (req, res) => {
  let { username, title, description, features, price } = req.body;

  username = username?.trim();
  title = title?.trim();
  description = description?.trim();
  price = parseFloat(price);

  if (!username || !title || !price || !features || features.length === 0) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const today = new Date().toISOString().split('T')[0];

  // check - 2 rentals per day
  const countQuery = `
    SELECT COUNT(*) AS count FROM rental_unit
    WHERE username = ? AND datePosted = ?
  `;

  db.query(countQuery, [username, today], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error.' });

    if (results[0].count >= 2) {
      return res.status(400).json({ message: 'You can only post 2 rental units per day.' });
    }

    const insertRental = `
      INSERT INTO rental_unit (username, title, description, price, datePosted)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(insertRental, [username, title, description, price, today], (err, result) => {
      if (err) return res.status(500).json({ message: 'Error inserting rental unit.' });

      const rentalID = result.insertId;

      const featureValues = features.map(f => [rentalID, f.trim()]);
      const insertFeatures = `INSERT INTO feature (rentalID, feature) VALUES ?`;

      db.query(insertFeatures, [featureValues], (err) => {
        if (err) return res.status(500).json({ message: 'Error inserting features.' });

        return res.status(201).json({ message: 'Rental unit posted successfully.', rentalID });
      });
    });
  });
});

// submit review
app.post('/api/review', (req, res) => {
  let { username, rentalID, score, remark } = req.body;

  username = username?.trim();
  rentalID = parseInt(rentalID);
  score = score?.trim();
  remark = remark?.trim();

  const validScores = ['Excellent', 'Good', 'Fair', 'Poor'];
  if (!username || !rentalID || !validScores.includes(score)) {
    return res.status(400).json({ message: 'Invalid review data.' });
  }

  const today = new Date().toISOString().split('T')[0];

  // check - 3 reviews per day
  const countQuery = `
    SELECT COUNT(*) AS count FROM review
    WHERE username = ? AND datePosted = ?
  `;

  db.query(countQuery, [username, today], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error.' });

    if (results[0].count >= 3) {
      return res.status(400).json({ message: 'You can only post 3 reviews per day.' });
    }

    // check - self-review
    const ownerQuery = `SELECT username FROM rental_unit WHERE rentalID = ?`;

    db.query(ownerQuery, [rentalID], (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error.' });
      if (results.length === 0) return res.status(404).json({ message: 'Rental unit not found.' });

      if (results[0].username === username) {
        return res.status(400).json({ message: 'You cannot review your own rental unit.' });
      }

      // check - duplicate review
      const dupQuery = `
        SELECT * FROM review WHERE username = ? AND rentalID = ?
      `;

      db.query(dupQuery, [username, rentalID], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error.' });

        if (results.length > 0) {
          return res.status(400).json({ message: 'You have already reviewed this rental unit.' });
        }

        const insertReview = `
          INSERT INTO review (rentalID, username, score, remark, datePosted)
          VALUES (?, ?, ?, ?, ?)
        `;

        db.query(insertReview, [rentalID, username, score, remark, today], (err) => {
          if (err) return res.status(500).json({ message: 'Error submitting review.' });

          return res.status(201).json({ message: 'Review submitted successfully.' });
        });
      });
    });
  });
});

// GET rental unit features
app.get('/api/rentals/search', (req, res) => {
  let { feature } = req.query;

  feature = feature?.trim();

  if (!feature) {
    return res.status(400).json({ message: 'Please enter a feature to search.' });
  }

  const query = `
  SELECT
    r.rentalID,
    r.username,
    r.title,
    r.description,
    r.price,
    GROUP_CONCAT(DISTINCT allf.feature ORDER BY allf.feature SEPARATOR ', ') AS features
  FROM rental_unit r
  JOIN feature matchf
    ON r.rentalID = matchf.rentalID
   AND matchf.feature LIKE ?
  LEFT JOIN feature allf
    ON r.rentalID = allf.rentalID
  GROUP BY r.rentalID, r.username, r.title, r.description, r.price
  ORDER BY r.rentalID DESC
`;


  db.query(query, [`%${feature}%`], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error.' });
    }

    return res.status(200).json({ rentals: results });
  });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});



