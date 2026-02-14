// Admin Dashboard Routes
// All routes require admin role
import express from "express";
import db from "../db.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { logAudit, logConfigChange } from "../utils/auditLogger.js";

const router = express.Router();

// All routes require admin authentication
router.use(authenticateToken, requireAdmin);

// ============================================
// Feature 2: Officer Performance Analytics
// ============================================
router.get("/officer-performance", (req, res) => {
  // Get all officers
  const officerSql = `SELECT id, name, email, created_at 
    FROM users 
    WHERE role = 'officer' OR role = 'admin'`;

  db.query(officerSql, [], (err, officers) => {
    if (err) {
      console.error("Officer performance query error:", err);
      return res.status(500).json({ error: "Database error: " + err.message });
    }

    if (!officers || officers.length === 0) {
      return res.json({ officers: [] });
    }

    // Get performance data for each officer
    const performancePromises = officers.map((officer) => {
      return new Promise((resolve, reject) => {
        const officerId = officer.id;

        // Get GD cases handled
        const gdSql = `SELECT 
          COUNT(*) as total_cases,
          SUM(CASE WHEN status IN ('resolved', 'closed') THEN 1 ELSE 0 END) as approvals_count,
          SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as rejections_count,
          AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as avg_response_time_hours
        FROM crime_reports 
        WHERE assigned_officer_id = ?`;

        db.query(gdSql, [officerId], (gdErr, gdResults) => {
          if (gdErr) {
            console.error("GD query error:", gdErr);
            return reject(gdErr);
          }

          const gdData = gdResults[0] || {};

          // Get PCC cases handled
          const pccSql = `SELECT 
            COUNT(*) as total_cases,
            SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approvals_count,
            SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejections_count,
            AVG(TIMESTAMPDIFF(HOUR, created_at, reviewed_at)) as avg_response_time_hours
          FROM pcc_applications 
          WHERE reviewed_by = ?`;

          db.query(pccSql, [officerId], (pccErr, pccResults) => {
            if (pccErr) {
              console.error("PCC query error:", pccErr);
              return reject(pccErr);
            }

            const pccData = pccResults[0] || {};

            // Get Missing Person cases
            const missingSql = `SELECT COUNT(*) as total_cases
            FROM missing_persons mp
            JOIN crime_reports cr ON mp.reported_by = cr.user_id
            WHERE cr.assigned_officer_id = ?`;

            db.query(missingSql, [officerId], (missingErr, missingResults) => {
              if (missingErr) {
                console.error("Missing persons query error:", missingErr);
                return reject(missingErr);
              }

              const missingData = missingResults[0] || {};

              // Combine all data
              const totalCases = 
                (parseInt(gdData.total_cases) || 0) +
                (parseInt(pccData.total_cases) || 0) +
                (parseInt(missingData.total_cases) || 0);

              const approvalsCount = 
                (parseInt(gdData.approvals_count) || 0) +
                (parseInt(pccData.approvals_count) || 0);

              const rejectionsCount = 
                (parseInt(gdData.rejections_count) || 0) +
                (parseInt(pccData.rejections_count) || 0);

              // Calculate average response time (weighted average)
              const totalGd = parseInt(gdData.total_cases) || 0;
              const totalPcc = parseInt(pccData.total_cases) || 0;
              const avgGdTime = parseFloat(gdData.avg_response_time_hours) || 0;
              const avgPccTime = parseFloat(pccData.avg_response_time_hours) || 0;

              let avgResponseTime = 0;
              if (totalGd + totalPcc > 0) {
                avgResponseTime = ((avgGdTime * totalGd) + (avgPccTime * totalPcc)) / (totalGd + totalPcc);
              }

              resolve({
                officer_id: officerId,
                officer_name: officer.name,
                officer_email: officer.email,
                total_cases_handled: totalCases,
                avg_response_time: parseFloat(avgResponseTime.toFixed(2)),
                approvals_count: approvalsCount,
                rejections_count: rejectionsCount,
                gd_cases: parseInt(gdData.total_cases) || 0,
                pcc_cases: parseInt(pccData.total_cases) || 0,
                missing_cases: parseInt(missingData.total_cases) || 0
              });
            });
          });
        });
      });
    });

    Promise.all(performancePromises)
      .then((performanceData) => {
        // Sort by total cases handled (descending)
        performanceData.sort((a, b) => b.total_cases_handled - a.total_cases_handled);

        res.json({
          officers: performanceData,
          summary: {
            total_officers: performanceData.length,
            total_cases: performanceData.reduce((sum, o) => sum + o.total_cases_handled, 0),
            total_approvals: performanceData.reduce((sum, o) => sum + o.approvals_count, 0),
            total_rejections: performanceData.reduce((sum, o) => sum + o.rejections_count, 0)
          }
        });
      })
      .catch((err) => {
        console.error("Performance data aggregation error:", err);
        res.status(500).json({ error: "Error aggregating performance data: " + err.message });
      });
  });
});

// ============================================
// Feature 4: System Audit Logs
// ============================================
router.get("/audit-logs", (req, res) => {
  const { date, user, action, page = 1, limit = 50 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let sql = `SELECT 
    al.*, 
    u.name as user_name, 
    u.email as user_email
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE 1=1`;

  const params = [];

  if (date) {
    sql += " AND DATE(al.created_at) = ?";
    params.push(date);
  }

  if (user) {
    sql += " AND al.user_id = ?";
    params.push(parseInt(user));
  }

  if (action) {
    sql += " AND al.action LIKE ?";
    params.push(`%${action}%`);
  }

  sql += " ORDER BY al.created_at DESC LIMIT ? OFFSET ?";
  params.push(parseInt(limit), parseInt(offset));

  // Get total count for pagination
  let countSql = `SELECT COUNT(*) as total FROM audit_logs al WHERE 1=1`;
  const countParams = [];

  if (date) {
    countSql += " AND DATE(al.created_at) = ?";
    countParams.push(date);
  }

  if (user) {
    countSql += " AND al.user_id = ?";
    countParams.push(parseInt(user));
  }

  if (action) {
    countSql += " AND al.action LIKE ?";
    countParams.push(`%${action}%`);
  }

  db.query(countSql, countParams, (countErr, countResults) => {
    if (countErr) {
      console.error("Audit logs count error:", countErr);
      return res.status(500).json({ error: "Database error: " + countErr.message });
    }

    const total = countResults[0]?.total || 0;

    db.query(sql, params, (err, results) => {
      if (err) {
        console.error("Audit logs query error:", err);
        return res.status(500).json({ error: "Database error: " + err.message });
      }

      res.json({
        logs: results || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          total_pages: Math.ceil(total / parseInt(limit))
        }
      });
    });
  });
});

// ============================================
// Feature 6: City-Level Crime Trend Dashboard
// ============================================
router.get("/crime-trends", (req, res) => {
  const { year } = req.query;
  const targetYear = year || new Date().getFullYear();

  // Get monthly crime trends
  const monthlySql = `SELECT 
    DATE_FORMAT(incident_date, '%Y-%m') as month,
    COUNT(*) as crime_count,
    COUNT(DISTINCT COALESCE(area_name, 'Unknown')) as area_count
  FROM crime_data
  WHERE YEAR(incident_date) = ?
  GROUP BY month
  ORDER BY month ASC`;

  // Get area-wise crime distribution
  const areaSql = `SELECT 
    COALESCE(area_name, 'Unknown') as area,
    COUNT(*) as crime_count,
    COUNT(DISTINCT DATE(incident_date)) as days_with_crimes
  FROM crime_data
  WHERE YEAR(incident_date) = ?
  GROUP BY area
  ORDER BY crime_count DESC
  LIMIT 20`;

  // Get crime type distribution
  const typeSql = `SELECT 
    crime_type,
    COUNT(*) as crime_count,
    AVG(CASE 
      WHEN severity = 'critical' THEN 4
      WHEN severity = 'high' THEN 3
      WHEN severity = 'medium' THEN 2
      ELSE 1
    END) as avg_severity
  FROM crime_data
  WHERE YEAR(incident_date) = ?
  GROUP BY crime_type
  ORDER BY crime_count DESC`;

  // Get year-over-year comparison
  const yearlySql = `SELECT 
    YEAR(incident_date) as year,
    COUNT(*) as crime_count
  FROM crime_data
  WHERE YEAR(incident_date) IN (?, ?)
  GROUP BY year
  ORDER BY year ASC`;

  Promise.all([
    new Promise((resolve, reject) => {
      db.query(monthlySql, [targetYear], (err, results) => {
        if (err) reject(err);
        else resolve(results || []);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(areaSql, [targetYear], (err, results) => {
        if (err) reject(err);
        else resolve(results || []);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(typeSql, [targetYear], (err, results) => {
        if (err) reject(err);
        else resolve(results || []);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(yearlySql, [targetYear - 1, targetYear], (err, results) => {
        if (err) reject(err);
        else resolve(results || []);
      });
    })
  ])
    .then(([monthly, areas, types, yearly]) => {
      // Calculate monthly growth rate
      const monthlyTrend = monthly.map((month, index) => {
        const prevMonth = index > 0 ? monthly[index - 1] : null;
        const growthRate = prevMonth && prevMonth.crime_count > 0
          ? ((month.crime_count - prevMonth.crime_count) / prevMonth.crime_count * 100).toFixed(2)
          : 0;

        return {
          ...month,
          growth_rate: parseFloat(growthRate)
        };
      });

      // Calculate year-over-year comparison
      const currentYearData = yearly.find(y => y.year === parseInt(targetYear)) || { crime_count: 0 };
      const prevYearData = yearly.find(y => y.year === parseInt(targetYear) - 1) || { crime_count: 0 };
      const yoyChange = prevYearData.crime_count > 0
        ? ((currentYearData.crime_count - prevYearData.crime_count) / prevYearData.crime_count * 100).toFixed(2)
        : 0;

      // Most affected zones (top 5)
      const mostAffectedZones = areas.slice(0, 5).map(area => ({
        area: area.area,
        crime_count: area.crime_count,
        crime_rate: parseFloat((area.crime_count / area.days_with_crimes).toFixed(2))
      }));

      res.json({
        monthly_trends: monthlyTrend,
        area_distribution: areas,
        crime_type_distribution: types,
        year_comparison: {
          current_year: currentYearData.crime_count,
          previous_year: prevYearData.crime_count,
          yoy_change: parseFloat(yoyChange)
        },
        most_affected_zones: mostAffectedZones,
        summary: {
          total_crimes: currentYearData.crime_count,
          total_areas: areas.length,
          avg_crimes_per_month: monthlyTrend.length > 0
            ? (currentYearData.crime_count / monthlyTrend.length).toFixed(2)
            : 0
        }
      });
    })
    .catch((err) => {
      console.error("Crime trends query error:", err);
      res.status(500).json({ error: "Database error: " + err.message });
    });
});

// ============================================
// Feature 8: Policy & Alert Broadcasting
// ============================================
router.post("/alerts", (req, res) => {
  const { title, message, target_area, role_target, priority, expires_at } = req.body;
  const createdBy = req.user.id;

  if (!title || !message) {
    return res.status(400).json({ error: "Title and message are required" });
  }

  const sql = `INSERT INTO system_alerts 
    (title, message, target_area, role_target, priority, expires_at, created_by) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  const params = [
    title,
    message,
    target_area || null,
    role_target || 'all',
    priority || 'medium',
    expires_at || null,
    createdBy
  ];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("Alert creation error:", err);
      return res.status(500).json({ error: "Database error: " + err.message });
    }

    // Log the alert creation
    logAudit({
      userId: createdBy,
      role: req.user.role,
      action: 'ALERT_CREATED',
      targetType: 'system_alert',
      targetId: result.insertId,
      details: { title, role_target, priority },
      req
    });

    res.status(201).json({
      message: "Alert created successfully",
      alert_id: result.insertId
    });
  });
});

router.get("/alerts/all", (req, res) => {
  const { role_target, is_active } = req.query;

  let sql = `SELECT 
    sa.*, 
    u.name as created_by_name
    FROM system_alerts sa
    LEFT JOIN users u ON sa.created_by = u.id
    WHERE 1=1`;

  const params = [];

  if (role_target) {
    sql += " AND (sa.role_target = ? OR sa.role_target = 'all')";
    params.push(role_target);
  }

  if (is_active !== undefined) {
    sql += " AND sa.is_active = ?";
    params.push(is_active === 'true');
  }

  // Filter expired alerts
  sql += " AND (sa.expires_at IS NULL OR sa.expires_at > NOW())";

  sql += " ORDER BY sa.created_at DESC";

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Alerts query error:", err);
      return res.status(500).json({ error: "Database error: " + err.message });
    }

    res.json({ alerts: results || [] });
  });
});

// ============================================
// Feature 10: System Configuration Panel
// ============================================
router.get("/config", (req, res) => {
  const sql = `SELECT 
    sc.*, 
    u.name as updated_by_name
    FROM system_config sc
    LEFT JOIN users u ON sc.updated_by = u.id
    ORDER BY sc.config_key ASC`;

  db.query(sql, [], (err, results) => {
    if (err) {
      console.error("Config query error:", err);
      return res.status(500).json({ error: "Database error: " + err.message });
    }

    // Convert config to key-value object
    const config = {};
    results.forEach(row => {
      let value = row.config_value;
      
      // Convert based on data type
      if (row.data_type === 'number') {
        value = parseFloat(value);
      } else if (row.data_type === 'boolean') {
        value = value === 'true' || value === '1';
      } else if (row.data_type === 'json') {
        try {
          value = JSON.parse(value);
        } catch (e) {
          // Keep as string if JSON parse fails
        }
      }

      config[row.config_key] = {
        value: value,
        description: row.description,
        data_type: row.data_type,
        updated_by: row.updated_by_name,
        updated_at: row.updated_at
      };
    });

    res.json({ config: config });
  });
});

router.put("/config", (req, res) => {
  const { config_key, config_value } = req.body;
  const updatedBy = req.user.id;

  if (!config_key || config_value === undefined) {
    return res.status(400).json({ error: "Config key and value are required" });
  }

  // Get current value for audit log
  db.query("SELECT config_value FROM system_config WHERE config_key = ?", [config_key], (getErr, getResults) => {
    if (getErr) {
      console.error("Config get error:", getErr);
      return res.status(500).json({ error: "Database error: " + getErr.message });
    }

    if (getResults.length === 0) {
      return res.status(404).json({ error: "Configuration key not found" });
    }

    const oldValue = getResults[0].config_value;
    const newValue = typeof config_value === 'object' ? JSON.stringify(config_value) : String(config_value);

    // Update config
    const sql = `UPDATE system_config 
      SET config_value = ?, updated_by = ?, updated_at = NOW()
      WHERE config_key = ?`;

    db.query(sql, [newValue, updatedBy, config_key], (updateErr, updateResult) => {
      if (updateErr) {
        console.error("Config update error:", updateErr);
        return res.status(500).json({ error: "Database error: " + updateErr.message });
      }

      // Log the configuration change
      logConfigChange(updatedBy, req.user.role, config_key, oldValue, newValue, req);

      res.json({
        message: "Configuration updated successfully",
        config_key: config_key,
        old_value: oldValue,
        new_value: newValue
      });
    });
  });
});

export default router;
