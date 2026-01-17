// Traffic Fine Check & Online Payment Routes
import express from "express";
import db from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Get all fines for a user
router.get("/my-fines", authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  const sql = "SELECT * FROM traffic_fines WHERE user_id = ? ORDER BY violation_date DESC";
  
  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    res.json({ fines: results });
  });
});

// Check fine by vehicle number
router.post("/check", (req, res) => {
  const { vehicle_number } = req.body;
  
  if (!vehicle_number) {
    return res.status(400).json({ error: "Vehicle number is required" });
  }
  
  const sql = "SELECT * FROM traffic_fines WHERE vehicle_number = ? AND status = 'pending' ORDER BY violation_date DESC";
  
  db.query(sql, [vehicle_number], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    res.json({ fines: results });
  });
});

// Create a new fine (Admin/Officer only)
router.post("/create", authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'officer') {
    return res.status(403).json({ error: "Unauthorized" });
  }
  
  const { user_id, vehicle_number, violation_type, violation_location, fine_amount, violation_date } = req.body;
  
  if (!vehicle_number || !violation_type || !fine_amount) {
    return res.status(400).json({ error: "Vehicle number, violation type, and fine amount are required" });
  }
  
  const sql = `INSERT INTO traffic_fines 
    (user_id, vehicle_number, violation_type, violation_location, fine_amount, violation_date, status) 
    VALUES (?, ?, ?, ?, ?, ?, 'pending')`;
  
  db.query(sql, [
    user_id || null,
    vehicle_number,
    violation_type,
    violation_location || null,
    fine_amount,
    violation_date || new Date()
  ], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    res.status(201).json({ 
      message: "Fine created successfully",
      fineId: result.insertId
    });
  });
});

// Pay fine (Mock Payment)
router.post("/pay/:fineId", authenticateToken, (req, res) => {
  const { fineId } = req.params;
  const userId = req.user.id;
  
  // Generate mock transaction ID
  const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const sql = `UPDATE traffic_fines 
    SET status = 'paid', 
        payment_date = NOW(), 
        payment_transaction_id = ? 
    WHERE id = ? AND user_id = ? AND status = 'pending'`;
  
  db.query(sql, [transactionId, fineId, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Fine not found or already paid" });
    }
    
    res.json({ 
      message: "Payment successful",
      transactionId: transactionId
    });
  });
});

// Get all fines (Admin)
router.get("/all", authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: "Admin access required" });
  }
  
  const sql = `SELECT tf.*, u.name as user_name, u.email 
    FROM traffic_fines tf 
    LEFT JOIN users u ON tf.user_id = u.id 
    ORDER BY tf.violation_date DESC`;
  
  db.query(sql, [], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    res.json({ fines: results });
  });
});

export default router;
