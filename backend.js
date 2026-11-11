const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const pool = new Pool({
  user: 'your_username',
  host: 'localhost',
  database: 'zoo_store',
  password: 'your_password',
  port: 5432,
});

// Routes
app.get('/api/products', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add more routes for categories, users, orders, etc.

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
