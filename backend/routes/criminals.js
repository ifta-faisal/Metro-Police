// Criminal Database & Face Recognition Routes
import express from "express";
import db from "../db.js";
import { authenticateToken, requireOfficer } from "../middleware/auth.js";

const router = express.Router();

// Search criminals by NID
router.get("/search/nid/:nid", authenticateToken, (req, res) => {
  const { nid } = req.params;
  
  const sql = `SELECT * FROM criminals 
    WHERE nid = ?`;
  
  db.query(sql, [nid], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    res.json({ criminals: results });
  });
});

// Search criminals by name
router.get("/search/name", authenticateToken, (req, res) => {
  const { name } = req.query;
  
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }
  
  const sql = `SELECT * FROM criminals 
    WHERE name LIKE ? 
    ORDER BY name`;
  
  db.query(sql, [`%${name}%`], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    res.json({ criminals: results });
  });
});

// Search criminals by face ID (simulated)
router.post("/search/face", authenticateToken, (req, res) => {
  const { face_id, image_data } = req.body;
  
  if (!face_id && !image_data) {
    return res.status(400).json({ error: "Face ID or image data is required" });
  }
  
  // In production, use face recognition API
  // For now, simulate matching
  const sql = `SELECT * FROM criminals 
    WHERE face_id = ? OR face_id IS NOT NULL
    ORDER BY status DESC`;
  
  db.query(sql, [face_id || ''], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    
    // Simulate face matching with confidence scores
    const matches = results.map(criminal => ({
      ...criminal,
      match_confidence: Math.random() * 30 + 70, // 70-100% confidence (simulated)
      match_type: 'face_recognition'
    })).filter(match => match.match_confidence > 75); // Only return high confidence matches
    
    res.json({ 
      matches: matches,
      note: "Face recognition is simulated. In production, use actual face recognition API."
    });
  });
});

// Get all criminals (Admin/Officer)
router.get("/all", authenticateToken, requireOfficer, (req, res) => {
  const { status } = req.query;
  
  let sql = `SELECT * FROM criminals WHERE 1=1`;
  const params = [];
  
  if (status) {
    sql += " AND status = ?";
    params.push(status);
  }
  
  sql += " ORDER BY created_at DESC";
  
  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    res.json({ criminals: results });
  });
});

// Get criminal by ID
router.get("/:criminalId", authenticateToken, (req, res) => {
  const { criminalId } = req.params;
  
  const sql = `SELECT * FROM criminals WHERE id = ?`;
  
  db.query(sql, [criminalId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: "Criminal not found" });
    }
    
    res.json({ criminal: results[0] });
  });
});

// Add new criminal (Admin/Officer)
router.post("/add", authenticateToken, requireOfficer, (req, res) => {
  const { name, nid, face_id, date_of_birth, gender, address, crime_records, status } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }
  
  const sql = `INSERT INTO criminals 
    (name, nid, face_id, date_of_birth, gender, address, crime_records, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  
  db.query(sql, [
    name,
    nid || null,
    face_id || null,
    date_of_birth || null,
    gender || null,
    address || null,
    crime_records || null,
    status || 'wanted'
  ], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    
    res.status(201).json({ 
      message: "Criminal added successfully",
      criminalId: result.insertId
    });
  });
});

// Update criminal (Admin/Officer)
router.put("/:criminalId", authenticateToken, requireOfficer, (req, res) => {
  const { criminalId } = req.params;
  const { name, nid, face_id, date_of_birth, gender, address, crime_records, status } = req.body;
  
  const updates = [];
  const params = [];
  
  if (name) { updates.push("name = ?"); params.push(name); }
  if (nid !== undefined) { updates.push("nid = ?"); params.push(nid); }
  if (face_id !== undefined) { updates.push("face_id = ?"); params.push(face_id); }
  if (date_of_birth) { updates.push("date_of_birth = ?"); params.push(date_of_birth); }
  if (gender) { updates.push("gender = ?"); params.push(gender); }
  if (address !== undefined) { updates.push("address = ?"); params.push(address); }
  if (crime_records !== undefined) { updates.push("crime_records = ?"); params.push(crime_records); }
  if (status) { updates.push("status = ?"); params.push(status); }
  
  if (updates.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }
  
  params.push(criminalId);
  
  const sql = `UPDATE criminals SET ${updates.join(", ")}, updated_at = NOW() WHERE id = ?`;
  
  db.query(sql, params, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Criminal not found" });
    }
    
    res.json({ message: "Criminal updated successfully" });
  });
});

// Simulate CCTV face recognition alert
router.post("/cctv-alert", authenticateToken, requireOfficer, (req, res) => {
  const { face_id, detected_location, detected_latitude, detected_longitude, image_data } = req.body;
  
  if (!face_id && !image_data) {
    return res.status(400).json({ error: "Face ID or image data is required" });
  }
  
  // Search for matching criminal
  const sql = `SELECT * FROM criminals 
    WHERE (face_id = ? OR face_id IS NOT NULL) AND status = 'wanted'
    LIMIT 1`;
  
  db.query(sql, [face_id || ''], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    
    if (results.length > 0) {
      const criminal = results[0];
      const matchConfidence = Math.random() * 20 + 80; // 80-100% (simulated)
      
      // Record the match
      const insertSql = `INSERT INTO face_recognition_matches 
        (criminal_id, match_confidence, detected_location, detected_latitude, detected_longitude, detected_at, alert_sent) 
        VALUES (?, ?, ?, ?, ?, NOW(), TRUE)`;
      
      db.query(insertSql, [
        criminal.id,
        matchConfidence,
        detected_location || 'Unknown',
        detected_latitude || null,
        detected_longitude || null
      ], (err, result) => {
        if (err) {
          console.error("Error recording match:", err);
        }
        
        res.status(201).json({
          alert: true,
          message: "Criminal detected! Alert sent to nearest police station.",
          criminal: criminal,
          match: {
            confidence: matchConfidence.toFixed(2),
            location: detected_location,
            timestamp: new Date()
          }
        });
      });
    } else {
      res.json({
        alert: false,
        message: "No match found in criminal database"
      });
    }
  });
});

// Get face recognition matches (Admin/Officer)
router.get("/face-matches", authenticateToken, requireOfficer, (req, res) => {
  const sql = `SELECT frm.*, c.name as criminal_name, c.status as criminal_status
    FROM face_recognition_matches frm
    LEFT JOIN criminals c ON frm.criminal_id = c.id
    ORDER BY frm.detected_at DESC
    LIMIT 100`;
  
  db.query(sql, [], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    res.json({ matches: results });
  });
});

export default router;
