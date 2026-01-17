import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db.js";
import { JWT_SECRET } from "../middleware/auth.js";

const router = express.Router();

// Register Route
router.post("/register", async (req, res) => {
  const { name, email, password, mobile_no, nid_no, role } = req.body;

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  if (!mobile_no || !nid_no) {
    return res.status(400).json({ error: "Mobile number and NID number are required" });
  }

  // Validate role
  const validRoles = ['citizen', 'officer', 'admin'];
  const userRole = role && validRoles.includes(role) ? role : 'citizen';

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  // Validate password strength
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users (name, email, password, phone, nid, role) VALUES (?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [name, email, hashedPassword, mobile_no, nid_no, userRole], (err, result) => {
      if (err) {
        console.error("Database Error:", err);
        console.error("Error code:", err.code);
        console.error("SQL State:", err.sqlState);
        
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: "Email or NID already registered" });
        }
        
        if (err.code === 'ER_NO_SUCH_TABLE') {
          return res.status(500).json({ error: "Database table not found. Please run database/schema.sql first." });
        }
        
        if (err.code === 'ER_BAD_DB_ERROR') {
          return res.status(500).json({ error: "Database 'metropolice' not found. Please create it first." });
        }
        
        return res.status(500).json({ error: "Server Error: " + err.message });
      }
      
      res.status(201).json({ 
        message: "Account created successfully!",
        userId: result.insertId
      });
    });
  } catch (error) {
    res.status(500).json({ error: "Error hashing password" });
  }
});

// Login Route
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const sql = "SELECT * FROM users WHERE email = ?";
  
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("Login Database Error:", err);
      if (err.code === 'ER_NO_SUCH_TABLE') {
        return res.status(500).json({ error: "Database table not found. Please run database/schema.sql first." });
      }
      if (err.code === 'ER_BAD_DB_ERROR') {
        return res.status(500).json({ error: "Database 'metropolice' not found. Please create it first." });
      }
      return res.status(500).json({ error: "Server error: " + err.message });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = results[0];

    try {
      // Compare password
      const match = await bcrypt.compare(password, user.password);
      
      if (!match) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(200).json({
        message: "Login successful",
        token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Error verifying password" });
    }
  });
});

// Get current user profile
router.get("/me", (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }

    const sql = "SELECT id, name, email, role, phone, nid, address, created_at FROM users WHERE id = ?";
    db.query(sql, [decoded.id], (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ user: results[0] });
    });
  });
});

export default router;