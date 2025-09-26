const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());

const API_KEY = '21b904e7b1msh6b2803acb5d124ep176c8djsnead6450521ab';
const API_HOST = 'tripadvisor-scraper.p.rapidapi.com';

/////////////////////////////////////////////////////////////////////
//mysql
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "dpsvn",
  database: "miniota",
});
 
db.connect(err => {
  if (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
  console.log("Connected to MySQL database");
});
///////////////////////////////////////////////////////////////////////////
//api search
app.get('/hotels', async (req, res) => {
  const { location, checkin = '', checkout = '' } = req.query;
  if (!location) return res.status(400).json({ error: 'Location is required' });

  const url = `https://${API_HOST}/hotels/search?query=${encodeURIComponent(location)}&checkin=${checkin}&checkout=${checkout}&limit=10`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': API_HOST
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
///////////////////////////////////////////////////////////////////////////
//signup
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "All fields are required" });

    db.query("SELECT email FROM users WHERE email = ?", [email], async (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "Database error", error: err.message });
      if (results.length > 0) return res.status(400).json({ success: false, message: "Email already exists" });


      const hashedPassword = await bcrypt.hash(password, 10);
      db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Failed to create account", error: err.message });
        res.status(201).json({ success: true, message: "Account created successfully", userId: result.insertId });
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

///////////////////////////////////////////////////////////////////////////
//login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required" });

    db.query("SELECT id, name, email, password FROM users WHERE email = ?", [email], async (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "Database error", error: err.message });
      if (results.length === 0) return res.status(401).json({ success: false, message: "Invalid email or password" });

      const user = results[0];
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) return res.status(401).json({ success: false, message: "Invalid email or password" });

      res.status(200).json({
        success: true,
        message: "Login successful",
        user: { id: user.id, name: user.name, email: user.email },
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

///////////////////////////////////////////////////////////////////////////
//cart
//////////////////////////
//add to cart
app.post("/api/cart", (req, res) => {
  const { userId, userName, hotelName, price, link, checkin, checkout } = req.body;

  if (!userId || !hotelName || !price || !link || !checkin || !checkout ) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  const query = "INSERT INTO cart (userid, username, hotelname, price, link, checkin, checkout) VALUES (?, ?, ?, ?, ?, ?, ?)";
  db.query(query, [userId, userName, hotelName, price, link, checkin, checkout], (err, result) => {
    if (err) {
      console.error("Add to cart error:", err);
      return res.status(500).json({ success: false, message: "Failed to add to cart", error: err.message });
    }
    res.json({ success: true, message: "Added to cart successfully", cartId: result.insertId });
  });
});
//////////////////////////
//view cart
app.get("/api/cart/:userId", (req, res) => {
  const userId = req.params.userId;
  const query = "SELECT * FROM cart WHERE userid = ?";
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Get cart error:", err);
      return res.status(500).json([]);
    }
    res.json(results);
  });
});
//////////////////////////
// cancel cart
app.delete("/api/cart/:cartId", (req, res) => {
  const cartId = req.params.cartId;
  db.query("DELETE FROM cart WHERE id = ?", [cartId], (err, result) => {
    if (err) {
      console.error("Delete cart error:", err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true });
  });
});

//////////////////////////
//confirm booking
app.post("/api/booking", (req, res) => {
  const { cartId, guests } = req.body;

  if (!cartId) {
    return res.status(400).json({ success: false, message: "cartId is required" });
  }

  db.query("SELECT * FROM cart WHERE id = ?", [cartId], (err, results) => {
    if (err || results.length === 0) {
      console.error("Booking cart item error:", err);
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    const item = results[0];
    const query = `
      INSERT INTO booking (userid, username, hotelname, price, link, checkin, checkout, guests)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(query, [
      item.userid,
      item.username,
      item.hotelname,
      item.price,
      item.link,
      item.checkin,
      item.checkout,
      guests || 1
    ], (err2) => {
      if (err2) {
        console.error("Booking insert error:", err2);
        return res.status(500).json({ success: false, message: "Failed to book", error: err2.message });
      }

      //delete from cart after insert
      db.query("DELETE FROM cart WHERE id = ?", [cartId], () => {});
      res.json({ success: true, message: "Booking confirmed" });
    });
  });
});

///////////////////////////////////////////////////////////////////////////
// booking
//////////////////////////
//user bookings
app.get("/api/booking/:userId", (req, res) => {
  const userId = req.params.userId;
  const query = "SELECT * FROM booking WHERE userid = ? ORDER BY id DESC";
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Fetch bookings error:", err);
      return res.status(500).json([]);
    }
    res.json(results);
  });
});

//cancel booking
app.delete("/api/booking/:bookingId", (req, res) => {
  const bookingId = req.params.bookingId;

  db.query("DELETE FROM booking WHERE id = ?", [bookingId], (err, result) => {
    if (err) {
      console.error("Delete booking error:", err);
      return res.status(500).json({ success: false, message: "Failed to cancel booking", error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.json({ success: true, message: "Booking canceled successfully" });
  });
});

// ---------------- START SERVER ----------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
