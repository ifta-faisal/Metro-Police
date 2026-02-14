// Unified Reports Route - For Officer/Admin Dashboard
// Fetches all types of reports: GD (crime_reports), Missing Person, SOS
import express from "express";
import db from "../db.js";
import { authenticateToken, requireOfficer } from "../middleware/auth.js";

const router = express.Router();

// GET /api/reports - Get all reports with filters
router.get("/", authenticateToken, requireOfficer, (req, res) => {
  const { type, status } = req.query;

  // Build queries based on type filter
  const promises = [];

  // If type is specified, only fetch that type; otherwise fetch all types
  if (!type || type === "gd") {
    let sql = `SELECT 
      cr.id,
      'gd' as report_type,
      cr.gd_number as report_number,
      cr.report_type as incident_type,
      cr.incident_date,
      cr.incident_location,
      cr.description,
      cr.status,
      cr.created_at,
      cr.updated_at,
      u.name as reporter_name,
      u.email as reporter_email,
      u.phone as reporter_phone
    FROM crime_reports cr
    LEFT JOIN users u ON cr.user_id = u.id
    WHERE 1=1`;
    
    const params = [];
    if (status) {
      sql += " AND cr.status = ?";
      params.push(status);
    }
    sql += " ORDER BY cr.created_at DESC";

    promises.push(
      new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      })
    );
  }

  if (!type || type === "missing") {
    let sql = `SELECT 
      mp.id,
      'missing' as report_type,
      CONCAT('MP-', mp.id) as report_number,
      'missing_person' as incident_type,
      mp.last_seen_date as incident_date,
      mp.last_seen_location as incident_location,
      CONCAT('Name: ', mp.person_name, 
        COALESCE(CONCAT(', Age: ', mp.person_age), ''),
        COALESCE(CONCAT(', Gender: ', mp.person_gender), ''),
        CASE WHEN mp.physical_description THEN CONCAT('. ', mp.physical_description) ELSE '' END
      ) as description,
      mp.status,
      mp.created_at,
      mp.created_at as updated_at,
      u.name as reporter_name,
      u.email as reporter_email,
      u.phone as reporter_phone
    FROM missing_persons mp
    LEFT JOIN users u ON mp.reported_by = u.id
    WHERE 1=1`;
    
    const params = [];
    if (status) {
      sql += " AND mp.status = ?";
      params.push(status);
    }
    sql += " ORDER BY mp.created_at DESC";

    promises.push(
      new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      })
    );
  }

  if (!type || type === "sos") {
    let sql = `SELECT 
      sos.id,
      'sos' as report_type,
      CONCAT('SOS-', sos.id) as report_number,
      sos.alert_type as incident_type,
      sos.created_at as incident_date,
      CONCAT('Lat: ', sos.latitude, ', Lng: ', sos.longitude) as incident_location,
      COALESCE(sos.message, 'Emergency alert') as description,
      sos.status,
      sos.created_at,
      sos.created_at as updated_at,
      u.name as reporter_name,
      u.email as reporter_email,
      u.phone as reporter_phone
    FROM sos_alerts sos
    LEFT JOIN users u ON sos.user_id = u.id
    WHERE 1=1`;
    
    const params = [];
    if (status) {
      sql += " AND sos.status = ?";
      params.push(status);
    }
    sql += " ORDER BY sos.created_at DESC";

    promises.push(
      new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      })
    );
  }

  // Execute all queries in parallel
  if (promises.length === 0) {
    return res.json({ reports: [] });
  }

  Promise.all(promises)
    .then((results) => {
      // Combine all results
      const allReports = [].concat(...results);
      // Sort by created_at descending
      allReports.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateB - dateA;
      });
      res.json({ reports: allReports });
    })
    .catch((err) => {
      console.error("Error fetching reports:", err);
      res.status(500).json({ error: "Database error: " + err.message });
    });
});

export default router;
