// index.js
const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const config = require('./config');

const app = express();
const port = 3000;

const connection = mysql.createPool(config);
connection.getConnection((err) => {
  if (err) {
    console.error('Error connecting to MySQL database: ' + err.message);
    return;
  }
  console.log('Connected to MySQL database');

});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'confession-images');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.post('/confessions', upload.single('image'), (req, res) => {
  const { userConfession, confession_Title } = req.body;
  const imagePath = req.file.path;

  const sql = 'INSERT INTO main_confession (userConfession, created_at, image, confession_Title) VALUES (?, ?, ?, ?)';
  const values = [userConfession, new Date(), imagePath, confession_Title];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create confession' });
    } else {
      res.status(201).json({ message: 'Confession created successfully' });
    }
  });
});
// index.js continued...
app.get('/confessions', (req, res) => {
  const sql = 'SELECT * FROM main_confession';

  connection.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch confessions' });
    } else {
      res.status(200).json(result);
    }
  });
});
// index.js continued...
app.use('/images', express.static('confession-images'));


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
