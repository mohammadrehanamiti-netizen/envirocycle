// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import session from "express-session";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Product from "./Models/Product.js";
import User from "./Models/User.js";
import Pickup from "./Models/pickup.js";

const app = express();
const PORT = process.env.PORT || 3000;

// __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
// Connect to MongoDB
// This uses the Render variable if available, otherwise falls back to localhost for your laptop
const dbUrl = process.env.MONGO_URL || "mongodb://localhost:27017/Project";

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.log("Database connection error:", err));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "Pages")));
app.use("/styles", express.static(path.join(__dirname, "styles.css")));

app.use(session({
  secret: "your-secret-key",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Public routes
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "Pages", "index.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "Pages", "login.html")));
app.get("/signup", (req, res) => res.sendFile(path.join(__dirname, "Pages", "signup.html")));

// Signup
app.post("/submit-form", async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  if (role && role.toLowerCase() === "admin") {
    return res.status(403).json({ success: false, message: "Admin signup not allowed." });
  }

  if (!name || !email || !phone || !password || !role) {
    return res.status(400).json({ success: false, message: "All fields required." });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email: normalizedEmail,
      phone,
      role: "user",
      password: hashedPassword,
      points: 0
    });

    await newUser.save();
    res.status(201).json({ success: true, message: "Registered successfully." });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
});

// Login
app.post("/login-form", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password required." });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials." });

    // Weekly login reward
    const now = new Date();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;

    if (!lastLogin || now - lastLogin >= oneWeek) {
      user.points += 5;
    }

    user.lastLogin = now;
    await user.save();

    req.session.user = {
      email: user.email,
      name: user.name,
      role: user.role,
      loggedIn: true
    };

    if (user.role === "admin") {
      return res.json({ success: true, role: "admin", redirect: "/adminDashboard.html" });
    } else {
      return res.json({ success: true, role: "user", redirect: "/points.html" });
    }

  } catch (err) {
    console.error("Login Error Details:", err);
    return res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

// Get current session user
app.get("/api/user", (req, res) => {
  if (req.session.user && req.session.user.loggedIn) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

// Get user points
app.get("/api/points", async (req, res) => {
  if (!req.session.user || !req.session.user.email) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const user = await User.findOne({ email: req.session.user.email });
    if (!user || user.role === "admin") {
      return res.status(403).json({ success: false, message: "No access to points." });
    }

    res.json({ success: true, points: user.points });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Submit pickup
app.post("/submit-pickup", async (req, res) => {
  const { name, email, address, date, materialType } = req.body;

  if (!name || !email || !address || !date || !materialType) {
    return res.status(400).json({ success: false, message: "All fields required" });
  }

  try {
    const newPickup = new Pickup({ name, email, address, date, materialType });
    await newPickup.save();

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (user && user.role === "user") {
      user.points += 10;
      await user.save();
    }

    res.status(201).json({ success: true, message: "Pickup scheduled and points updated" });

  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Save pickup from admin panel
app.post("/save-pickup", async (req, res) => {
  const { name, address, date, material, status } = req.body;

  if (!name || !address || !date || !material || !status) {
    return res.status(400).json({ success: false, message: "All fields required" });
  }

  try {
    const newPickup = new Pickup({ name, address, date, materialType: material, status });
    await newPickup.save();
    res.status(201).json({ success: true, message: "Pickup saved successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Admin APIs
app.get("/api/admin/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.delete("/api/admin/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/api/admin/pickups", async (req, res) => {
  try {
    const pickups = await Pickup.find();
    res.json(pickups);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pickups" });
  }
});

app.delete("/api/admin/pickups/:id", async (req, res) => {
  try {
    await Pickup.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Pickup deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Stats route
app.get("/api/admin/stats", async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const pickupDocs = await Pickup.find();
    const pickupCount = pickupDocs.length;
    const materialRecycled = pickupDocs.length * 2.5;
    const productCount = await Product.countDocuments();

    res.json({
      users: userCount,
      pickups: pickupCount,
      products: productCount,
      materialRecycled
    });
  } catch (err) {
    res.status(500).json({ error: "Stats error" });
  }
});

// Products
app.get("/api/admin/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Error fetching products" });
  }
});

app.post("/api/admin/products", async (req, res) => {
  const { name, description, price, image } = req.body;

  if (!name || !description || !price || !image) {
    return res.status(400).json({ success: false, message: "All fields required" });
  }

  try {
    const newProduct = new Product({ name, description, price, image });
    await newProduct.save();
    res.status(201).json({ success: true, message: "Product added" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error adding product" });
  }
});

app.delete("/api/admin/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting product" });
  }
});

// Server start
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

export default app;

