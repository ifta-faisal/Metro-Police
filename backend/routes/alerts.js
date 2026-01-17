// Public Alerts Route - Citizens can see relevant alerts
import express from "express";
import db from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// GET /api/alerts - Get alerts for logged-in users based on their role
router.get("/", authenticateToken, (req, res) => {
  const userRole = req.user.role;

  // Get active alerts for the user's role or 'all'
  const sql = `SELECT 
    id, title, message, priority, created_at, expires_at
    FROM system_alerts
    WHERE is_active = TRUE
      AND (role_target = ? OR role_target = 'all')
      AND (expires_at IS NULL OR expires_at > NOW())
    ORDER BY 
      CASE priority
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        ELSE 4
      END,
      created_at DESC
    LIMIT 20`;

  db.query(sql, [userRole], (err, results) => {
    if (err) {
      console.error("Alerts query error:", err);
      return res.status(500).json({ error: "Database error: " + err.message });
    }

    res.json({ alerts: results || [] });
  });
});

export default router;
