-- Admin Dashboard Tables
-- Run this script to create tables for Admin features

USE metropolice;

-- ============================================
-- 1. AUDIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  role ENUM('admin', 'officer', 'citizen') NOT NULL,
  action VARCHAR(100) NOT NULL COMMENT 'e.g., GD_APPROVED, PCC_REJECTED, CONFIG_UPDATED',
  target_type VARCHAR(50) COMMENT 'e.g., crime_report, pcc_application, system_config',
  target_id INT COMMENT 'ID of the target record',
  details TEXT COMMENT 'JSON or text details about the action',
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_target (target_type, target_id),
  INDEX idx_created_at (created_at)
);

-- ============================================
-- 2. SYSTEM ALERTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS system_alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  target_area VARCHAR(100) COMMENT 'Specific area or NULL for all areas',
  role_target ENUM('all', 'citizen', 'officer', 'admin') DEFAULT 'all',
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  is_active BOOLEAN DEFAULT TRUE,
  expires_at DATETIME NULL,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_role_target (role_target),
  INDEX idx_is_active (is_active),
  INDEX idx_created_at (created_at),
  INDEX idx_expires_at (expires_at)
);

-- ============================================
-- 3. SYSTEM CONFIG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS system_config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  description TEXT,
  data_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_config_key (config_key)
);

-- Insert default system configurations
INSERT IGNORE INTO system_config (config_key, config_value, description, data_type) VALUES
  ('traffic_fine_base', '500', 'Base traffic fine amount in BDT', 'number'),
  ('pcc_processing_days', '7', 'Standard processing days for PCC applications', 'number'),
  ('auto_flag_report_threshold', '5', 'Auto-flag report if crime count exceeds this', 'number'),
  ('max_daily_sos', '10', 'Maximum SOS alerts per user per day', 'number'),
  ('gd_auto_assign_enabled', 'false', 'Enable auto-assignment of GD reports to officers', 'boolean'),
  ('missing_person_alert_days', '30', 'Days to keep missing person alerts active', 'number'),
  ('sos_response_time_minutes', '15', 'Expected response time for SOS alerts in minutes', 'number'),
  ('crime_prediction_update_hours', '24', 'Hours between crime prediction updates', 'number')
ON DUPLICATE KEY UPDATE description = VALUES(description);
