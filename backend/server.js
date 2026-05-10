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


app.get('/api/products/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Failed to fetch product' });
  }
});

app.post('/api/orders', requireAuth, async (req, res) => {
  const { items, totalPrice } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const orderResult = await client.query(
      'INSERT INTO orders (user_id, total_price, status) VALUES ($1, $2, $3) RETURNING id',
      [req.user.userId, totalPrice, 'pending']
    );
    const orderId = orderResult.rows[0].id;
    for (const item of items) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [orderId, parseInt(item.productId), item.quantity, item.price]
      );
    }
    await client.query('COMMIT');
    res.status(201).json({ orderId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: error.message || 'Failed to create order' });
  } finally {
    client.release();
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const { pet_type, category } = req.query;
    const conditions = [];
    const params = [];

    if (pet_type) {
      params.push(pet_type);
      conditions.push(`pet_type = $${params.length}`);
    }

    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query(
      `SELECT * FROM products ${where} ORDER BY id`,
      params
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Failed to fetch products' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});