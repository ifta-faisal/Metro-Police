// crimeReports.js
import express from "express";
import db from "../db.js";
import { authenticateToken, requireOfficer } from "../middleware/auth.js";

const router = express.Router();

// ---------------------
// Submit a crime report (GD) - Citizen
// ---------------------
router.post("/submit", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { report_type, incident_date, incident_location, description } = req.body;

  if (!report_type || !incident_date || !incident_location || !description) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const gdNumber = `GD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

  const sql = `INSERT INTO crime_reports 
    (gd_number, user_id, report_type, incident_date, incident_location, description, status) 
    VALUES (?, ?, ?, ?, ?, ?, 'pending')`;

  db.query(sql, [gdNumber, userId, report_type, incident_date, incident_location, description], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error: " + err.message });

    res.status(201).json({ message: "Report submitted successfully", gdNumber, reportId: result.insertId });
  });
});

// ---------------------
// Get my reports - Citizen
// ---------------------
router.get("/my-reports", authenticateToken, (req, res) => {
  const userId = req.user.id;

  const sql = `SELECT cr.*, 
      (SELECT COUNT(*) FROM case_updates WHERE case_id = cr.id AND case_type = 'crime_report') AS update_count
      FROM crime_reports cr 
      WHERE cr.user_id = ? 
      ORDER BY cr.created_at DESC`;

  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error: " + err.message });

    res.json({ reports: results });
  });
});

// ---------------------
// Get all reports - Officer/Admin
// ---------------------
router.get("/all", authenticateToken, (req, res) => {
  const { status } = req.query;
  const userId = req.user.id;
  const userRole = req.user.role;

  let sql = `SELECT cr.*, u.name AS reporter_name, u.email AS reporter_email
             FROM crime_reports cr
             LEFT JOIN users u ON cr.user_id = u.id`;
  const params = [];

  if (userRole === "citizen") {
    sql += " WHERE cr.user_id = ?";
    params.push(userId);
    if (status) {
      sql += " AND cr.status = ?";
      params.push(status);
    }
  } else {
    if (status) {
      sql += " WHERE cr.status = ?";
      params.push(status);
    }
  }

  sql += " ORDER BY cr.created_at DESC";

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error: " + err.message });

    res.json({ reports: results });
  });
});

// ---------------------
// Get pending GDs - Officer Dashboard
// ---------------------
router.get("/gd", authenticateToken, requireOfficer, (req, res) => {
  const sql = `SELECT cr.*, u.name AS reporter_name, u.email AS reporter_email
               FROM crime_reports cr
               LEFT JOIN users u ON cr.user_id = u.id
               WHERE cr.status = 'pending'
               ORDER BY cr.created_at DESC`;

  db.query(sql, [], (err, results) => {
    if (err) {
      console.error("GD fetch error:", err);
      return res.status(500).json({ error: "Database error: " + err.message });
    }

    res.json({ gds: results || [] });
  });
});

// ---------------------
// Update report status - Officer/Admin
// ---------------------
router.put("/:reportId/status", authenticateToken, requireOfficer, (req, res) => {
  const { reportId } = req.params;
  const { status, assigned_officer_id } = req.body;

  if (!status) return res.status(400).json({ error: "Status is required" });

  const sql = `UPDATE crime_reports 
               SET status = ?, assigned_officer_id = ?, updated_at = NOW()
               WHERE id = ?`;

  db.query(sql, [status, assigned_officer_id || null, reportId], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error: " + err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Report not found" });

    res.json({ message: "Status updated successfully" });
  });
});

// ---------------------
// Add case update - Officer/Admin
// ---------------------
router.post("/:reportId/update", authenticateToken, requireOfficer, (req, res) => {
  const { reportId } = req.params;
  const { update_text } = req.body;
  const updatedBy = req.user.id;

  if (!update_text) return res.status(400).json({ error: "Update text is required" });

  const sql = `INSERT INTO case_updates (case_id, case_type, update_text, updated_by) 
               VALUES (?, 'crime_report', ?, ?)`;

  db.query(sql, [reportId, update_text, updatedBy], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error: " + err.message });

    res.status(201).json({ message: "Update added successfully", updateId: result.insertId });
  });
});

export default router;
