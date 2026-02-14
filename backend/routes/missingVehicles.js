// Missing Vehicle & Auto-Match Routes
import express from "express";
import db from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Report missing vehicle
router.post("/report", authenticateToken, (req, res) => {
  const reportedBy = req.user.id;
  const { vehicle_number, vehicle_type, vehicle_color, vehicle_brand, vehicle_model, last_seen_date, last_seen_location, description } = req.body;
  
  if (!vehicle_number || !last_seen_date || !last_seen_location) {
    return res.status(400).json({ error: "Vehicle number, last seen date, and location are required" });
  }
  
  const sql = `INSERT INTO missing_vehicles 
    (reported_by, vehicle_number, vehicle_type, vehicle_color, vehicle_brand, vehicle_model, last_seen_date, last_seen_location, description, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'missing')`;
  
  db.query(sql, [
    reportedBy,
    vehicle_number,
    vehicle_type || null,
    vehicle_color || null,
    vehicle_brand || null,
    vehicle_model || null,
    last_seen_date,
    last_seen_location,
    description || null
  ], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    
    const reportId = result.insertId;
    
    // Auto-match with existing reports
    autoMatchMissingVehicle(reportId, vehicle_number, vehicle_type, vehicle_color, vehicle_brand);
    
    res.status(201).json({ 
      message: "Missing vehicle reported successfully",
      reportId: reportId
    });
  });
});

// Auto-match function
function autoMatchMissingVehicle(reportId, vehicleNumber, vehicleType, vehicleColor, vehicleBrand) {
  let sql = `SELECT * FROM missing_vehicles 
    WHERE id != ? AND status = 'missing'`;
  
  const conditions = [];
  const params = [reportId];
  
  // Match by vehicle number (exact or partial)
  if (vehicleNumber) {
    conditions.push("(vehicle_number = ? OR vehicle_number LIKE ?)");
    params.push(vehicleNumber, `%${vehicleNumber}%`);
  }
  
  // Match by type, color, brand
  if (vehicleType) {
    conditions.push("vehicle_type = ?");
    params.push(vehicleType);
  }
  
  if (vehicleColor) {
    conditions.push("vehicle_color = ?");
    params.push(vehicleColor);
  }
  
  if (vehicleBrand) {
    conditions.push("vehicle_brand = ?");
    params.push(vehicleBrand);
  }
  
  if (conditions.length > 0) {
    sql += " AND (" + conditions.join(" OR ") + ")";
  }
  
  db.query(sql, params, (err, matches) => {
    if (err) {
      console.error("Auto-match error:", err);
      return;
    }
    
    if (matches.length > 0) {
      // Update both records to indicate potential match
      const matchId = matches[0].id;
      db.query("UPDATE missing_vehicles SET matched_with = ? WHERE id = ?", [matchId, reportId]);
      db.query("UPDATE missing_vehicles SET matched_with = ? WHERE id = ?", [reportId, matchId]);
    }
  });
}

// Get user's missing vehicle reports
router.get("/my-reports", authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  const sql = `SELECT mv.*, 
    (SELECT vehicle_number FROM missing_vehicles WHERE id = mv.matched_with) as matched_vehicle_number
    FROM missing_vehicles mv 
    WHERE mv.reported_by = ? 
    ORDER BY mv.last_seen_date DESC`;
  
  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    res.json({ reports: results });
  });
});

// Get all missing vehicles
router.get("/all", authenticateToken, (req, res) => {
  const { status } = req.query;
  
  let sql = `SELECT mv.*, u.name as reporter_name, u.email as reporter_email,
    (SELECT vehicle_number FROM missing_vehicles WHERE id = mv.matched_with) as matched_vehicle_number
    FROM missing_vehicles mv
    LEFT JOIN users u ON mv.reported_by = u.id`;
  
  const params = [];
  if (status) {
    sql += " WHERE mv.status = ?";
    params.push(status);
  }
  
  sql += " ORDER BY mv.last_seen_date DESC";
  
  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    res.json({ reports: results });
  });
});

// Get potential matches for a report
router.get("/:reportId/matches", authenticateToken, (req, res) => {
  const { reportId } = req.params;
  
  const sql = `SELECT * FROM missing_vehicles 
    WHERE id = ?`;
  
  db.query(sql, [reportId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: "Report not found" });
    }
    
    const report = results[0];
    
    // Find potential matches
    let matchSql = `SELECT * FROM missing_vehicles 
      WHERE id != ? AND status = 'missing'`;
    
    const conditions = [];
    const params = [reportId];
    
    if (report.vehicle_number) {
      conditions.push("(vehicle_number = ? OR vehicle_number LIKE ?)");
      params.push(report.vehicle_number, `%${report.vehicle_number}%`);
    }
    
    if (report.vehicle_type) {
      conditions.push("vehicle_type = ?");
      params.push(report.vehicle_type);
    }
    
    if (report.vehicle_color) {
      conditions.push("vehicle_color = ?");
      params.push(report.vehicle_color);
    }
    
    if (report.vehicle_brand) {
      conditions.push("vehicle_brand = ?");
      params.push(report.vehicle_brand);
    }
    
    if (conditions.length > 0) {
      matchSql += " AND (" + conditions.join(" OR ") + ")";
    }
    
    matchSql += " LIMIT 10";
    
    db.query(matchSql, params, (err, matches) => {
      if (err) {
        return res.status(500).json({ error: "Database error: " + err.message });
      }
      res.json({ matches: matches });
    });
  });
});

// Update missing vehicle status
router.put("/:reportId/status", authenticateToken, (req, res) => {
  const { reportId } = req.params;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }
  
  const sql = "UPDATE missing_vehicles SET status = ? WHERE id = ?";
  
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
