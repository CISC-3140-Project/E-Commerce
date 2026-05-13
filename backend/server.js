require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db/connection");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || "petopia-secret-change-in-production";

// --- Middleware ---
const allowedOrigins = [
  "https://e-commerce-rho-nine-84.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// --- Authentication Middleware ---
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }
  try {
    const token = auth.slice(7);
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// --- Basic & Health Routes ---
app.get("/api/data", (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Database connected successfully",
      time: result.rows[0],
    });
  } catch (error) {
    console.error("!!! DATABASE CONNECTION ERROR !!!\n", error);
    res.status(500).json({ error: "Database connection failed", details: error.message });
  }
});

// --- Auth Routes ---
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }
  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "An account with that email already exists" });
    }
    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hash]
    );
    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password, rememberMe } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const expiresIn = rememberMe ? "30d" : "1d";
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// --- Account Routes ---
app.get("/api/account/profile", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE id = $1",
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Fetch Profile Error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

app.put("/api/account/email", requireAuth, async (req, res) => {
  const { email, currentPassword } = req.body;
  if (!email || !currentPassword) {
    return res.status(400).json({ error: "Email and current password are required" });
  }

  try {
    const currentUser = await pool.query("SELECT id, password FROM users WHERE id = $1", [req.user.userId]);
    if (currentUser.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const passwordOk = await bcrypt.compare(currentPassword, currentUser.rows[0].password);
    if (!passwordOk) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const emailTaken = await pool.query("SELECT id FROM users WHERE email = $1 AND id <> $2", [
      email,
      req.user.userId,
    ]);
    if (emailTaken.rows.length > 0) {
      return res.status(409).json({ error: "An account with that email already exists" });
    }

    await pool.query("UPDATE users SET email = $1 WHERE id = $2", [email, req.user.userId]);
    res.json({ message: "Email updated successfully" });
  } catch (error) {
    console.error("Update Email Error:", error);
    res.status(500).json({ error: "Failed to update email" });
  }
});

app.put("/api/account/password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current and new password are required" });
  }

  if (String(newPassword).length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters" });
  }

  try {
    const currentUser = await pool.query("SELECT id, password FROM users WHERE id = $1", [req.user.userId]);
    if (currentUser.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const passwordOk = await bcrypt.compare(currentPassword, currentUser.rows[0].password);
    if (!passwordOk) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [newHash, req.user.userId]);
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Update Password Error:", error);
    res.status(500).json({ error: "Failed to update password" });
  }
});

// --- Product Routes ---
app.get("/api/products", async (req, res) => {
  try {
    const { pet_type, category } = req.query;
    const conditions = [];
    const params = [];

    if (pet_type && pet_type !== 'All') {
      params.push(pet_type);
      conditions.push(`pet_type = $${params.length}`);
    }
    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await pool.query(`SELECT * FROM products ${whereClause} ORDER BY id`, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Fetch Products Error:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Product not found" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Fetch Product ID Error:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// --- Order Routes ---
app.post("/api/orders", requireAuth, async (req, res) => {
  const { items, totalPrice } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Order must contain at least one item" });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const orderResult = await client.query(
      "INSERT INTO orders (user_id, total_price, status) VALUES ($1, $2, $3) RETURNING id",
      [req.user.userId, totalPrice, "pending"]
    );
    const orderId = orderResult.rows[0].id;
    for (const item of items) {
      await client.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
        [orderId, parseInt(item.productId || item.id), item.quantity, item.price]
      );
    }
    await client.query("COMMIT");
    res.status(201).json({ orderId });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Order Creation Error:", error);
    res.status(500).json({ error: "Failed to create order" });
  } finally {
    client.release();
  }
});

app.get("/api/orders", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.id, o.total_price, o.status, o.created_at,
              json_agg(json_build_object(
                'product_id', oi.product_id,
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
    console.error("Fetch Orders Error:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

app.get("/api/orders/:id", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.id, o.total_price, o.status, o.created_at,
              COALESCE(
                json_agg(
                  json_build_object(
                    'product_id', oi.product_id,
                    'name', p.name,
                    'category', p.category,
                    'image', p.image,
                    'quantity', oi.quantity,
                    'price', oi.price
                  ) ORDER BY oi.id
                ) FILTER (WHERE oi.id IS NOT NULL),
                '[]'::json
              ) AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE o.user_id = $1 AND o.id = $2
       GROUP BY o.id`,
      [req.user.userId, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Fetch Order Detail Error:", error);
    res.status(500).json({ error: "Failed to fetch order details" });
  }
});

// --- Stripe Checkout Route ---
app.post("/api/create-checkout-session", requireAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No items in cart" });
    }

    const invalidItem = items.find((item) => !item.id || !item.price || !item.quantity);
    if (invalidItem) {
      return res.status(400).json({ error: "Each item must include id, price, and quantity" });
    }

    const totalPrice = items.reduce(
      (sum, item) => sum + parseFloat(item.price) * Number(item.quantity || 1),
      0
    );

    await client.query("BEGIN");

    const orderResult = await client.query(
      "INSERT INTO orders (user_id, total_price, status) VALUES ($1, $2, $3) RETURNING id",
      [req.user.userId, totalPrice.toFixed(2), "pending"]
    );
    const orderId = orderResult.rows[0].id;

    for (const item of items) {
      await client.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
        [orderId, parseInt(item.productId || item.id), item.quantity, item.price]
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.name },
          unit_amount: Math.round(parseFloat(item.price) * 100),
        },
        quantity: item.quantity || 1,
      })),
      mode: "payment",
      client_reference_id: String(orderId),
      metadata: {
        order_id: String(orderId),
        user_id: String(req.user.userId),
      },
      success_url: "http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:3000/cart",
    });

    await client.query("COMMIT");
    res.json({ url: session.url, id: session.id, orderId });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Stripe Error:", error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

app.post("/api/stripe/confirm-session", requireAuth, async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const orderId = Number(session.client_reference_id || session.metadata?.order_id);

    if (!orderId) {
      return res.status(400).json({ error: "No order linked to this Stripe session" });
    }

    if (session.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment has not been completed" });
    }

    const result = await pool.query(
      "UPDATE orders SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING id, status",
      ["processed", orderId, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found for this user" });
    }

    res.json({ orderId: result.rows[0].id, status: result.rows[0].status });
  } catch (error) {
    console.error("Stripe confirm error:", error);
    res.status(500).json({ error: "Failed to confirm payment session" });
  }
});

// --- Start Server (Single Entry Point) ---
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});