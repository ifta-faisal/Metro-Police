// Police Clearance Certificate (PCC) Routes
import express from "express";
import db from "../db.js";
import { authenticateToken, requireOfficer } from "../middleware/auth.js";
import { logApprovalAction } from "../utils/auditLogger.js";

const router = express.Router();

// Test endpoint to check table access (for debugging - remove in production)
router.get("/test", authenticateToken, requireOfficer, (req, res) => {
  const testSql = "SELECT COUNT(*) as count FROM pcc_applications";
  db.query(testSql, [], (err, results) => {
    if (err) {
      console.error("PCC test query error:", err);
      return res.status(500).json({ error: "Database error: " + err.message, code: err.code });
    }
    res.json({ message: "PCC table accessible", count: results[0].count });
  });
});

// Submit PCC application
router.post("/apply", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { purpose, nid_number, address } = req.body;
  
  if (!purpose || !nid_number || !address) {
    return res.status(400).json({ error: "Purpose, NID number, and address are required" });
  }
  
  // Generate application number
  const applicationNumber = `PCC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
  
  const sql = `INSERT INTO pcc_applications 
    (user_id, application_number, purpose, nid_number, address, status) 
    VALUES (?, ?, ?, ?, ?, 'pending')`;
  
  db.query(sql, [userId, applicationNumber, purpose, nid_number, address], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    
    res.status(201).json({ 
      message: "PCC application submitted successfully",
      applicationNumber: applicationNumber,
      applicationId: result.insertId
    });
  });
});

// Get user's PCC applications
router.get("/my-applications", authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  const sql = `SELECT * FROM pcc_applications 
    WHERE user_id = ? 
    ORDER BY created_at DESC`;
  
  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    res.json({ applications: results });
  });
});

// Get all PCC applications (Admin/Officer) - MUST come before /:applicationNumber route
router.get("/all", authenticateToken, requireOfficer, (req, res) => {
  const { status } = req.query;
  
  console.log("PCC /all route called. Status filter:", status);
  console.log("User role:", req.user?.role, "User ID:", req.user?.id);
  
  let sql = `SELECT pcc.*, u.name as applicant_name, u.email as applicant_email,
    reviewer.name as reviewer_name
    FROM pcc_applications pcc
    LEFT JOIN users u ON pcc.user_id = u.id
    LEFT JOIN users reviewer ON pcc.reviewed_by = reviewer.id`;
  
  const params = [];
  if (status) {
    sql += " WHERE pcc.status = ?";
    params.push(status);
  }
  
  sql += " ORDER BY pcc.created_at DESC";
  
  console.log("PCC query SQL:", sql);
  console.log("PCC query params:", params);
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("PCC fetch error:", err);
      console.error("Error code:", err.code);
      console.error("Error SQL state:", err.sqlState);
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    
    console.log("PCC query successful. Results count:", results ? results.length : 0);
    
    if (!results) {
      results = [];
    }
    
    res.json({ applications: results });
  });
});

// Update PCC application status (Officer/Admin)
router.put("/:applicationId/status", authenticateToken, requireOfficer, (req, res) => {
  const { applicationId } = req.params;
  const { status } = req.body;
  const reviewedBy = req.user.id;
  
  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }
  
  const sql = `UPDATE pcc_applications 
    SET status = ?, 
        reviewed_by = ?,
        reviewed_at = NOW()
    WHERE id = ?`;
  
  db.query(sql, [status, reviewedBy, applicationId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Application not found" });
    }
    
    res.json({ message: "Status updated successfully" });
  });
});

// Approve or reject PCC application - PUT /api/pcc/:id/approve
router.put("/:id/approve", authenticateToken, requireOfficer, (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'approve' or 'reject'
  const reviewedBy = req.user.id;
  
  if (!action || !['approve', 'reject'].includes(action.toLowerCase())) {
    return res.status(400).json({ error: "Action is required. Must be 'approve' or 'reject'" });
  }
  
  const status = action.toLowerCase() === 'approve' ? 'approved' : 'rejected';
  
  const sql = `UPDATE pcc_applications 
    SET status = ?, 
        reviewed_by = ?,
        reviewed_at = NOW()
    WHERE id = ?`;
  
  // First check if application exists
  db.query("SELECT id, status FROM pcc_applications WHERE id = ?", [id], (checkErr, checkResult) => {
    if (checkErr) {
      console.error("PCC check error:", checkErr);
      return res.status(500).json({ error: "Database error: " + checkErr.message });
    }
    
    if (!checkResult || checkResult.length === 0) {
      return res.status(404).json({ error: `PCC application with ID ${id} not found` });
    }
    
    // Application exists, now update it
    db.query(sql, [status, reviewedBy, id], (updateErr, updateResult) => {
      if (updateErr) {
        console.error("PCC approve error:", updateErr);
        return res.status(500).json({ error: "Database error: " + updateErr.message });
      }
      
      if (!updateResult || updateResult.affectedRows === 0) {
        return res.status(400).json({ error: "Update failed. Application may have been modified." });
      }
      
      // Log audit for approval/rejection actions
      logApprovalAction(
        reviewedBy,
        req.user.role,
        status === 'approved' ? 'PCC_APPROVED' : 'PCC_REJECTED',
        'pcc_application',
        id,
        status,
        req
      );
      
      res.json({ 
        message: `PCC application ${action}d successfully`,
        status: status,
        reviewedBy: reviewedBy,
        reviewedAt: new Date().toISOString()
      });
    });
  });
});

// Download PCC certificate (Mock - returns JSON)
router.get("/:applicationId/certificate", authenticateToken, (req, res) => {
  const { applicationId } = req.params;
  const userId = req.user.id;
  
  const sql = `SELECT pcc.*, u.name as applicant_name, u.email, u.nid, u.address 
    FROM pcc_applications pcc
    LEFT JOIN users u ON pcc.user_id = u.id
    WHERE pcc.id = ? AND (pcc.user_id = ? OR pcc.status = 'approved')`;
  
  db.query(sql, [applicationId, userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: "Application not found or not approved" });
    }
    
    const application = results[0];
    
    if (application.status !== 'approved') {
      return res.status(400).json({ error: "Application not approved yet" });
    }
    
    // Generate certificate data (In production, use PDF library)
    const certificateData = {
      certificateNumber: application.application_number,
      issueDate: application.reviewed_at || new Date().toISOString().split('T')[0],
      applicant: {
        name: application.applicant_name,
        email: application.email,
        nid: application.nid_number,
        address: application.address
      },
      purpose: application.purpose,
      status: application.status
    };
    
    res.json({ 
      message: "Certificate generated",
      certificate: certificateData,
      downloadUrl: `/api/pcc/${applicationId}/certificate/download`
    });
  });
});

export default router;
