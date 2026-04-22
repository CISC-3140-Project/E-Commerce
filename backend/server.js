require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./db/connection');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get('/api/data', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      message: 'Database connected successfully',
      time: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});