// GD Management Routes
// PUT /api/gd/:id/status - Update GD status
import express from "express";
import db from "../db.js";
import { authenticateToken, requireOfficer } from "../middleware/auth.js";
import { logApprovalAction } from "../utils/auditLogger.js";

const router = express.Router();

// Update GD status: Pending → Approved / Rejected / Investigating
router.put("/:id/status", authenticateToken, requireOfficer, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const officerId = req.user.id;

  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  // Map user-friendly statuses to database statuses
  const statusMap = {
    'approved': 'resolved',
    'rejected': 'closed',
    'investigating': 'under_investigation',
    'pending': 'pending'
  };

  const dbStatus = statusMap[status.toLowerCase()] || status;

  if (!['pending', 'under_investigation', 'resolved', 'closed'].includes(dbStatus)) {
    return res.status(400).json({ error: "Invalid status. Allowed: approved, rejected, investigating, pending" });
  }

  const sql = `UPDATE crime_reports 
               SET status = ?, assigned_officer_id = ?, updated_at = NOW()
               WHERE id = ?`;

  db.query(sql, [dbStatus, officerId, id], (err, result) => {
    if (err) {
      console.error("GD status update error:", err);
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ error: `GD report with ID ${id} not found` });
    }

    // Log audit for approval/rejection actions
    if (dbStatus === 'resolved' || dbStatus === 'closed') {
      logApprovalAction(
        officerId,
        req.user.role,
        dbStatus === 'resolved' ? 'GD_APPROVED' : 'GD_REJECTED',
        'crime_report',
        id,
        dbStatus,
        req
      );
    }

    res.json({ 
      message: "GD status updated successfully",
      status: dbStatus
    });
  });
});

export default router;
