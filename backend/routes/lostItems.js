// Lost Item Report Routes
import express from "express";
import db from "../db.js";
import { authenticateToken } from "../middleware/auth.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Submit lost item report
router.post("/report", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { item_type, item_description, lost_date, lost_location, contact_number } = req.body;
  
  if (!item_type || !item_description || !lost_date || !lost_location) {
    return res.status(400).json({ error: "Item type, description, lost date, and location are required" });
  }
  
  const sql = `INSERT INTO lost_items 
    (user_id, item_type, item_description, lost_date, lost_location, contact_number, status) 
    VALUES (?, ?, ?, ?, ?, ?, 'reported')`;
  
  db.query(sql, [userId, item_type, item_description, lost_date, lost_location, contact_number || null], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    
    res.status(201).json({ 
      message: "Lost item reported successfully",
      reportId: result.insertId
    });
  });
});

// Get user's lost item reports
router.get("/my-reports", authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  const sql = "SELECT * FROM lost_items WHERE user_id = ? ORDER BY lost_date DESC";
  
  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    res.json({ reports: results });
  });
});

// Get all lost items (Officer/Admin only)
router.get("/all", authenticateToken, (req, res) => {
  // Check if user is officer or admin
  if (req.user.role !== 'officer' && req.user.role !== 'admin') {
    return res.status(403).json({ error: "Access denied. Officer or Admin required." });
  }

  const sql = `SELECT li.*, u.name as reporter_name, u.email as reporter_email 
    FROM lost_items li
    LEFT JOIN users u ON li.user_id = u.id
    ORDER BY li.lost_date DESC`;
  
  db.query(sql, [], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    res.json({ items: results });
  });
});

// Generate Lost Item Certificate PDF (Mock - returns JSON with certificate data)
router.get("/:reportId/certificate", authenticateToken, (req, res) => {
  const { reportId } = req.params;
  const userId = req.user.id;
  
  const sql = `SELECT li.*, u.name as user_name, u.email, u.nid, u.address 
    FROM lost_items li
    LEFT JOIN users u ON li.user_id = u.id
    WHERE li.id = ? AND li.user_id = ?`;
  
  db.query(sql, [reportId, userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: "Report not found" });
    }
    
    const report = results[0];
    
    // Generate certificate data (In production, use PDF library like pdfkit)
    const certificateData = {
      certificateNumber: `LIC-${report.id}-${new Date().getFullYear()}`,
      issueDate: new Date().toISOString().split('T')[0],
      user: {
        name: report.user_name,
        email: report.email,
        nid: report.nid,
        address: report.address
      },
      item: {
        type: report.item_type,
        description: report.item_description,
        lostDate: report.lost_date,
        lostLocation: report.lost_location
      },
      status: report.status
    };
    
    // Update certificate_generated flag
    const updateSql = "UPDATE lost_items SET certificate_generated = TRUE WHERE id = ?";
    db.query(updateSql, [reportId], (err) => {
      if (err) {
        console.error("Error updating certificate flag:", err);
      }
    });
    
    res.json({ 
      message: "Certificate generated",
      certificate: certificateData,
      downloadUrl: `/api/lost-items/${reportId}/certificate/download`
    });
  });
});

// Download certificate (returns JSON - in production, generate actual PDF)
router.get("/:reportId/certificate/download", authenticateToken, (req, res) => {
  const { reportId } = req.params;
  const userId = req.user.id;
  
  const sql = `SELECT li.*, u.name as user_name, u.email, u.nid, u.address 
    FROM lost_items li
    LEFT JOIN users u ON li.user_id = u.id
    WHERE li.id = ? AND li.user_id = ?`;
  
  db.query(sql, [reportId, userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: "Report not found" });
    }
    
    // In production, generate actual PDF file here
    // For now, return JSON data that frontend can convert to PDF
    res.json({ 
      certificate: results[0],
      note: "In production, this would return a PDF file. Frontend can use libraries like jsPDF to generate PDF from this data."
    });
  });
});

// Update lost item status (Officer/Admin only)
router.put("/:reportId/status", authenticateToken, (req, res) => {
  // Check if user is officer or admin
  if (req.user.role !== 'officer' && req.user.role !== 'admin') {
    return res.status(403).json({ error: "Access denied. Officer or Admin required." });
  }

  const { reportId } = req.params;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }
  
  const sql = "UPDATE lost_items SET status = ? WHERE id = ?";
  
  db.query(sql, [status, reportId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Report not found" });
    }
    
    res.json({ message: "Status updated successfully" });
  });
});

export default router;
