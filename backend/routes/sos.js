// SOS Emergency Button Routes
import express from "express";
import db from "../db.js";
import { authenticateToken, requireOfficer } from "../middleware/auth.js";

const router = express.Router();

// Send SOS alert
router.post("/alert", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { alert_type, latitude, longitude, message } = req.body;
  
  if (!alert_type || !latitude || !longitude) {
    return res.status(400).json({ error: "Alert type, latitude, and longitude are required" });
  }
  
  // Find nearest police station
  const stationSql = `SELECT id, station_name, latitude, longitude, contact_number,
    (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * 
    cos(radians(longitude) - radians(?)) + 
    sin(radians(?)) * sin(radians(latitude)))) AS distance
    FROM police_stations
    ORDER BY distance
    LIMIT 1`;
  
  db.query(stationSql, [latitude, longitude, latitude], (err, stationResults) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    
    const nearestStation = stationResults.length > 0 ? stationResults[0].id : null;
    
    // Insert SOS alert
    const sql = `INSERT INTO sos_alerts 
      (user_id, alert_type, latitude, longitude, nearest_station_id, message, status) 
      VALUES (?, ?, ?, ?, ?, ?, 'active')`;
    
    db.query(sql, [userId, alert_type, latitude, longitude, nearestStation, message || null], (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Database error: " + err.message });
      }
      
      const alertId = result.insertId;
      
      // Get user info for alert
      const userSql = "SELECT name, phone FROM users WHERE id = ?";
      db.query(userSql, [userId], (err, userResults) => {
        if (err) {
          console.error("Error fetching user:", err);
        }
        
        const alertData = {
          alertId: alertId,
          user: userResults[0] || {},
          nearestStation: stationResults[0] || null,
          location: { lat: latitude, lng: longitude },
          timestamp: new Date()
        };
        
        res.status(201).json({ 
          message: "SOS alert sent successfully",
          alert: alertData
        });
      });
    });
  });
});

// Get user's SOS alerts
router.get("/my-alerts", authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  const sql = `SELECT sos.*, ps.station_name, ps.contact_number as station_contact
    FROM sos_alerts sos
    LEFT JOIN police_stations ps ON sos.nearest_station_id = ps.id
    WHERE sos.user_id = ?
    ORDER BY sos.created_at DESC`;
  
  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    res.json({ alerts: results });
  });
});

// Get all active SOS alerts (Admin/Officer)
router.get("/active", authenticateToken, requireOfficer, (req, res) => {
  const sql = `SELECT sos.*, u.name as user_name, u.phone as user_phone, u.email as user_email,
    ps.station_name, ps.contact_number as station_contact, ps.latitude as station_lat, ps.longitude as station_lng
    FROM sos_alerts sos
    LEFT JOIN users u ON sos.user_id = u.id
    LEFT JOIN police_stations ps ON sos.nearest_station_id = ps.id
    WHERE sos.status = 'active'
    ORDER BY sos.created_at DESC`;
  
  db.query(sql, [], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    res.json({ alerts: results });
  });
});

// GET /api/sos - Get all SOS alerts for monitoring (default to active)
router.get("/", authenticateToken, requireOfficer, (req, res) => {
  const { status } = req.query;
  
  let sql = `SELECT sos.*, u.name as user_name, u.phone as user_phone, u.email as user_email,
    ps.station_name, ps.contact_number as station_contact,
    sos.latitude, sos.longitude, sos.created_at as time
    FROM sos_alerts sos
    LEFT JOIN users u ON sos.user_id = u.id
    LEFT JOIN police_stations ps ON sos.nearest_station_id = ps.id`;
  
  const params = [];
  if (status) {
    sql += " WHERE sos.status = ?";
    params.push(status);
  } else {
    // Default to active alerts if no status filter
    sql += " WHERE sos.status = 'active'";
  }
  
  sql += " ORDER BY sos.created_at DESC";
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("SOS fetch error:", err);
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    res.json({ alerts: results || [] });
  });
});

// Get all SOS alerts (Admin/Officer)
router.get("/all", authenticateToken, requireOfficer, (req, res) => {
  const { status } = req.query;
  
  let sql = `SELECT sos.*, u.name as user_name, u.phone as user_phone, u.email as user_email,
    ps.station_name, ps.contact_number as station_contact
    FROM sos_alerts sos
    LEFT JOIN users u ON sos.user_id = u.id
    LEFT JOIN police_stations ps ON sos.nearest_station_id = ps.id`;
  
  const params = [];
  if (status) {
    sql += " WHERE sos.status = ?";
    params.push(status);
  }
  
  sql += " ORDER BY sos.created_at DESC";
  
  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    res.json({ alerts: results });
  });
});

// Update SOS alert status (Officer/Admin)
router.put("/:alertId/status", authenticateToken, requireOfficer, (req, res) => {
  const { alertId } = req.params;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }
  
  let sql = `UPDATE sos_alerts SET status = ?`;
  const params = [status];
  
  if (status === 'responded') {
    sql += ", responded_at = NOW()";
  } else if (status === 'resolved') {
    sql += ", resolved_at = NOW()";
  }
  
  sql += " WHERE id = ?";
  params.push(alertId);
  
  db.query(sql, params, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Alert not found" });
    }
    
    res.json({ message: "Alert status updated successfully" });
  });
});

export default router;
