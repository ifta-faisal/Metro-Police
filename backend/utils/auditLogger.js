// Audit Logger Utility
// Automatically log admin/officer actions to audit_logs table
import db from '../db.js';

/**
 * Log an action to the audit log
 * @param {Object} logData - Log data object
 * @param {number} logData.userId - User ID performing the action
 * @param {string} logData.role - User role (admin, officer, citizen)
 * @param {string} logData.action - Action name (e.g., 'GD_APPROVED', 'PCC_REJECTED')
 * @param {string} logData.targetType - Type of target (e.g., 'crime_report', 'pcc_application')
 * @param {number} logData.targetId - ID of the target record
 * @param {string|Object} logData.details - Additional details (string or object)
 * @param {Object} logData.req - Express request object (optional, for IP and user agent)
 */
export const logAudit = (logData) => {
  const {
    userId,
    role,
    action,
    targetType = null,
    targetId = null,
    details = null,
    req = null
  } = logData;

  // Convert details to string if it's an object
  let detailsStr = details;
  if (details && typeof details === 'object') {
    detailsStr = JSON.stringify(details);
  }

  // Extract IP and user agent from request if provided
  const ipAddress = req ? (req.ip || req.connection?.remoteAddress || null) : null;
  const userAgent = req ? (req.get('user-agent') || null) : null;

  const sql = `INSERT INTO audit_logs 
    (user_id, role, action, target_type, target_id, details, ip_address, user_agent) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  const params = [userId, role, action, targetType, targetId, detailsStr, ipAddress, userAgent];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error('Audit logging error:', err);
      // Don't throw error - audit logging failure shouldn't break the main operation
    }
  });
};

/**
 * Log admin configuration changes
 */
export const logConfigChange = (userId, role, configKey, oldValue, newValue, req = null) => {
  logAudit({
    userId,
    role,
    action: 'CONFIG_UPDATED',
    targetType: 'system_config',
    targetId: null,
    details: {
      config_key: configKey,
      old_value: oldValue,
      new_value: newValue
    },
    req
  });
};

/**
 * Log approval/rejection actions
 */
export const logApprovalAction = (userId, role, action, targetType, targetId, status, req = null) => {
  logAudit({
    userId,
    role,
    action: action.toUpperCase(), // e.g., 'GD_APPROVED', 'PCC_REJECTED'
    targetType,
    targetId,
    details: { status },
    req
  });
};
