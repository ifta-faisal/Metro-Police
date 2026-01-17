// Missing Person & Auto-Match Routes
import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import db from "../db.js";
import { authenticateToken, requireOfficer } from "../middleware/auth.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/missing-persons/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'missing-person-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Report missing person (with image upload)
router.post("/report", authenticateToken, upload.single('person_photo'), (req, res) => {
  const reportedBy = req.user.id;
  const { person_name, person_age, person_gender, last_seen_date, last_seen_location, physical_description, contact_number } = req.body;
  
  if (!person_name || !last_seen_date || !last_seen_location) {
    return res.status(400).json({ error: "Person name, last seen date, and location are required" });
  }
  
  // Get uploaded file path
  const photoPath = req.file ? `/uploads/missing-persons/${req.file.filename}` : null;
  
  const sql = `INSERT INTO missing_persons 
    (reported_by, person_name, person_age, person_gender, last_seen_date, last_seen_location, physical_description, contact_number, person_photo, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'missing')`;
  
  db.query(sql, [
    reportedBy,
    person_name,
    person_age || null,
    person_gender || null,
    last_seen_date,
    last_seen_location,
    physical_description || null,
    contact_number || null,
    photoPath
  ], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    
    const reportId = result.insertId;
    
    // Auto-match with existing reports
    autoMatchMissingPerson(reportId, person_name, person_age, person_gender, physical_description);
    
    res.status(201).json({ 
      message: "Missing person reported successfully",
      reportId: reportId
    });
  });
});

// Auto-match function
function autoMatchMissingPerson(reportId, name, age, gender, description) {
  // Simple matching logic based on name, age, gender, and description keywords
  let sql = `SELECT * FROM missing_persons 
    WHERE id != ? AND status = 'missing'`;
  
  const conditions = [];
  const params = [reportId];
  
  if (name) {
    conditions.push("(person_name LIKE ? OR person_name LIKE ?)");
    params.push(`%${name}%`, `%${name.split(' ').reverse().join(' ')}%`);
  }
  
  if (age) {
    conditions.push("(person_age BETWEEN ? AND ?)");
    params.push(age - 5, age + 5);
  }
  
  if (gender) {
    conditions.push("person_gender = ?");
    params.push(gender);
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
      db.query("UPDATE missing_persons SET matched_with = ? WHERE id = ?", [matchId, reportId]);
      db.query("UPDATE missing_persons SET matched_with = ? WHERE id = ?", [reportId, matchId]);
    }
  });
}

// Get user's missing person reports
router.get("/my-reports", authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  const sql = `SELECT mp.*, 
    (SELECT person_name FROM missing_persons WHERE id = mp.matched_with) as matched_person_name
    FROM missing_persons mp 
    WHERE mp.reported_by = ? 
    ORDER BY mp.last_seen_date DESC`;
  
  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    res.json({ reports: results });
  });
});

// Get all missing persons (Officer/Admin can see all, Citizen sees only their own)
router.get("/all", authenticateToken, (req, res) => {
  const { status } = req.query;
  const userId = req.user.id;
  const userRole = req.user.role;
  
  let sql = `SELECT mp.*, u.name as reporter_name, u.email as reporter_email,
    (SELECT person_name FROM missing_persons WHERE id = mp.matched_with) as matched_person_name
    FROM missing_persons mp
    LEFT JOIN users u ON mp.reported_by = u.id`;
  
  const params = [];
  
  // Citizens can only see their own reports
  if (userRole === 'citizen') {
    sql += " WHERE mp.reported_by = ?";
    params.push(userId);
    if (status) {
      sql += " AND mp.status = ?";
      params.push(status);
    }
  } else {
    // Officer/Admin can see all
    if (status) {
      sql += " WHERE mp.status = ?";
      params.push(status);
    }
  }
  
  sql += " ORDER BY mp.last_seen_date DESC";
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Missing persons fetch error:", err);
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    res.json({ reports: results || [] });
  });
});

// Get potential matches for a report
router.get("/:reportId/matches", authenticateToken, (req, res) => {
  const { reportId } = req.params;
  
  const sql = `SELECT * FROM missing_persons 
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
    let matchSql = `SELECT * FROM missing_persons 
      WHERE id != ? AND status = 'missing'`;
    
    const conditions = [];
    const params = [reportId];
    
    if (report.person_name) {
      conditions.push("person_name LIKE ?");
      params.push(`%${report.person_name.split(' ')[0]}%`);
    }
    
    if (report.person_age) {
      conditions.push("(person_age BETWEEN ? AND ?)");
      params.push(report.person_age - 5, report.person_age + 5);
    }
    
    if (report.person_gender) {
      conditions.push("person_gender = ?");
      params.push(report.person_gender);
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

// Update missing person status (Officer/Admin only)
router.put("/:reportId/status", authenticateToken, requireOfficer, (req, res) => {
  const { reportId } = req.params;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }
  
  const sql = "UPDATE missing_persons SET status = ? WHERE id = ?";
  
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
