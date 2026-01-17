// Missing Person Management Routes
// PUT /api/missing/:id/status - Update missing person status
import express from "express";
import db from "../db.js";
import { authenticateToken, requireOfficer } from "../middleware/auth.js";
import { logApprovalAction } from "../utils/auditLogger.js";

const router = express.Router();

// Update missing person status: Searching / Found
router.put("/:id/status", authenticateToken, requireOfficer, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  // Map user-friendly statuses to database statuses
  const statusMap = {
    'searching': 'missing',
    'found': 'found',
    'missing': 'missing'
  };

  const dbStatus = statusMap[status.toLowerCase()] || status;

  if (!['missing', 'found', 'closed'].includes(dbStatus)) {
    return res.status(400).json({ error: "Invalid status. Allowed: searching, found" });
  }

  const sql = `UPDATE missing_persons 
               SET status = ?
               WHERE id = ?`;

  db.query(sql, [dbStatus, id], (err, result) => {
    if (err) {
      console.error("Missing person status update error:", err);
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ error: `Missing person report with ID ${id} not found` });
    }

    // Log audit for status updates
    logApprovalAction(
      req.user.id,
      req.user.role,
      dbStatus === 'found' ? 'MISSING_FOUND' : 'MISSING_UPDATED',
      'missing_person',
      id,
      dbStatus,
      req
    );

    res.json({ 
      message: "Missing person status updated successfully",
      status: dbStatus
    });
  });
});

export default router;
