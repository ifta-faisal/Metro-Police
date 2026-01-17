// Crime Risk Map & Patrolling Routes
import express from "express";
import db from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Get crime data for risk map (heatmap)
router.get("/crime-data", authenticateToken, (req, res) => {
  const { startDate, endDate, crimeType } = req.query;
  
  let sql = `SELECT crime_type, latitude, longitude, incident_date, severity, description 
    FROM crime_data 
    WHERE 1=1`;
  
  const params = [];
  
  if (startDate) {
    sql += " AND incident_date >= ?";
    params.push(startDate);
  }
  
  if (endDate) {
    sql += " AND incident_date <= ?";
    params.push(endDate);
  }
  
  if (crimeType) {
    sql += " AND crime_type = ?";
    params.push(crimeType);
  }
  
  sql += " ORDER BY incident_date DESC LIMIT 1000";
  
  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    
    // Group by location for heatmap intensity
    const heatmapData = results.map(crime => ({
      lat: parseFloat(crime.latitude),
      lng: parseFloat(crime.longitude),
      intensity: getSeverityIntensity(crime.severity),
      type: crime.crime_type,
      date: crime.incident_date
    }));
    
    res.json({ 
      crimes: results,
      heatmapData: heatmapData
    });
  });
});

// Get patrolling data (heatmap)
router.get("/patrolling-data", authenticateToken, (req, res) => {
  const sql = `SELECT area_name, latitude, longitude, patrol_intensity, officer_count, last_updated 
    FROM patrolling_data 
    ORDER BY patrol_intensity DESC`;
  
  db.query(sql, [], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    
    const heatmapData = results.map(patrol => ({
      lat: parseFloat(patrol.latitude),
      lng: parseFloat(patrol.longitude),
      intensity: patrol.patrol_intensity,
      area: patrol.area_name,
      officers: patrol.officer_count
    }));
    
    res.json({ 
      patrolling: results,
      heatmapData: heatmapData
    });
  });
});

// Add crime data (Admin/Officer)
router.post("/crime-data", authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'officer') {
    return res.status(403).json({ error: "Unauthorized" });
  }
  
  const { crime_type, latitude, longitude, incident_date, severity, description } = req.body;
  
  if (!crime_type || !latitude || !longitude) {
    return res.status(400).json({ error: "Crime type, latitude, and longitude are required" });
  }
  
  const sql = `INSERT INTO crime_data 
    (crime_type, latitude, longitude, incident_date, severity, description) 
    VALUES (?, ?, ?, ?, ?, ?)`;
  
  db.query(sql, [
    crime_type,
    latitude,
    longitude,
    incident_date || new Date(),
    severity || 'medium',
    description || null
  ], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    
    res.status(201).json({ 
      message: "Crime data added successfully",
      crimeId: result.insertId
    });
  });
});

// Update patrolling data (Admin/Officer)
router.put("/patrolling-data/:id", authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'officer') {
    return res.status(403).json({ error: "Unauthorized" });
  }
  
  const { id } = req.params;
  const { patrol_intensity, officer_count } = req.body;
  
  const sql = `UPDATE patrolling_data 
    SET patrol_intensity = ?, 
        officer_count = ?,
        last_updated = NOW()
    WHERE id = ?`;
  
  db.query(sql, [patrol_intensity, officer_count, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Patrolling data not found" });
    }
    
    res.json({ message: "Patrolling data updated successfully" });
  });
});

// Get police stations
router.get("/police-stations", authenticateToken, (req, res) => {
  const sql = `SELECT id, station_name, station_code, latitude, longitude, contact_number, address 
    FROM police_stations 
    ORDER BY station_name`;
  
  db.query(sql, [], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    
    const stations = results.map(station => ({
      id: station.id,
      name: station.station_name,
      code: station.station_code,
      lat: parseFloat(station.latitude),
      lng: parseFloat(station.longitude),
      contact: station.contact_number,
      address: station.address
    }));
    
    res.json({ stations: stations });
  });
});

// Helper function to convert severity to intensity
function getSeverityIntensity(severity) {
  const intensityMap = {
    'low': 1,
    'medium': 3,
    'high': 6,
    'critical': 10
  };
  return intensityMap[severity] || 3;
}

export default router;
