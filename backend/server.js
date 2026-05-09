require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db/connection');

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'petopia-secret-change-in-production';

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

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with that email already exists' });
    }
    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hash]
    );
    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error(error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(500).json({ error: 'Cannot connect to the database. Check your DATABASE_URL in .env' });
    }
    if (error.code === '23505') {
      return res.status(409).json({ error: 'An account with that email already exists' });
    }
    if (error.code === '42P01') {
      return res.status(500).json({ error: 'The users table does not exist. Run your schema.sql against the database first' });
    }
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password, rememberMe } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const expiresIn = rememberMe ? '30d' : '1d';
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

app.get('/api/orders', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.id, o.total_price, o.status, o.created_at,
              json_agg(json_build_object(
                'name', p.name,
                'quantity', oi.quantity,
                'price', oi.price
              ) ORDER BY oi.id) AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Failed to fetch orders' });
  }
});

app.get('/api/orders/:id', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.id, o.total_price, o.status, o.created_at,
              json_agg(json_build_object(
                'name', p.name,
                'quantity', oi.quantity,
                'price', oi.price
              ) ORDER BY oi.id) AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE o.id = $1 AND o.user_id = $2
       GROUP BY o.id`,
      [req.params.id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Failed to fetch order' });
  }
});

app.get('/api/account/profile', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Failed to fetch profile' });
  }
});

app.put('/api/account/email', requireAuth, async (req, res) => {
  const { email, currentPassword } = req.body;
  if (!email || !currentPassword) {
    return res.status(400).json({ error: 'New email and current password are required' });
  }
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const valid = await bcrypt.compare(currentPassword, userResult.rows[0].password);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });
    const existing = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, req.user.userId]);
    if (existing.rows.length > 0) return res.status(409).json({ error: 'That email is already in use' });
    await pool.query('UPDATE users SET email = $1 WHERE id = $2', [email, req.user.userId]);
    res.json({ message: 'Email updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Failed to update email' });
  }
});

app.put('/api/account/password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const valid = await bcrypt.compare(currentPassword, userResult.rows[0].password);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });
    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hash, req.user.userId]);
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Failed to update password' });
  }
});

app.get('/api/account/wishlist', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.name, p.price, p.image, p.category, p.rating, p.reviews, p.badge
       FROM wishlist w
       JOIN products p ON p.id = w.product_id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Failed to fetch wishlist' });
  }
});

app.post('/api/account/wishlist', requireAuth, async (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ error: 'Product ID is required' });
  try {
    await pool.query(
      'INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.userId, productId]
    );
    res.status(201).json({ message: 'Added to wishlist' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Failed to add to wishlist' });
  }
});

app.delete('/api/account/wishlist/:productId', requireAuth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2',
      [req.user.userId, req.params.productId]
    );
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Failed to remove from wishlist' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const { animal, category } = req.query;

    let query = `
      SELECT p.*,
        COALESCE(array_agg(at.name) FILTER (WHERE at.name IS NOT NULL), '{}') AS animals
      FROM products p
      LEFT JOIN product_animal_types pat ON pat.product_id = p.id
      LEFT JOIN animal_types at ON at.id = pat.animal_type_id
    `;
    const params = [];

    if (animal) {
      params.push(animal);
      query += ` WHERE p.id IN (
        SELECT pat2.product_id FROM product_animal_types pat2
        JOIN animal_types at2 ON at2.id = pat2.animal_type_id
        WHERE at2.name = $${params.length}
      )`;
    }

    if (category) {
      params.push(category);
      query += ` ${animal ? 'AND' : 'WHERE'} p.category = $${params.length}`;
    }

    query += ' GROUP BY p.id ORDER BY p.id';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Failed to fetch products' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});