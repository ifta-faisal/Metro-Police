-- Metro Police Database Schema
-- Run this SQL file in MySQL (XAMPP phpMyAdmin)

USE metropolice;

-- ============================================
-- 1. USERS TABLE
-- ============================================
-- Drop table if exists (for fresh install)
-- DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  role ENUM('citizen', 'admin', 'officer') DEFAULT 'citizen',
  phone VARCHAR(20),
  nid VARCHAR(20) UNIQUE,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- If users table already exists without new columns, add them
-- Run these manually if needed:
-- ALTER TABLE users ADD COLUMN role ENUM('citizen', 'admin', 'officer') DEFAULT 'citizen';
-- ALTER TABLE users ADD COLUMN phone VARCHAR(20);
-- ALTER TABLE users ADD COLUMN nid VARCHAR(20) UNIQUE;
-- ALTER TABLE users ADD COLUMN address TEXT;
-- ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- ============================================
-- 2. TRAFFIC FINES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS traffic_fines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  vehicle_number VARCHAR(50),
  violation_type VARCHAR(100),
  violation_location VARCHAR(255),
  fine_amount DECIMAL(10, 2),
  violation_date DATETIME,
  status ENUM('pending', 'paid', 'disputed') DEFAULT 'pending',
  payment_date DATETIME NULL,
  payment_transaction_id VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- 3. CRIME/INCIDENT REPORTS (GD - General Diary)
-- ============================================
CREATE TABLE IF NOT EXISTS crime_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  gd_number VARCHAR(50) UNIQUE,
  user_id INT,
  report_type ENUM('theft', 'assault', 'fraud', 'vandalism', 'other') NOT NULL,
  incident_date DATETIME NOT NULL,
  incident_location VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('pending', 'under_investigation', 'resolved', 'closed') DEFAULT 'pending',
  assigned_officer_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- 4. CASE STATUS TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS case_updates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT,
  case_type ENUM('crime_report', 'missing_person', 'missing_vehicle', 'lost_item') NOT NULL,
  update_text TEXT NOT NULL,
  updated_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- 5. LOST ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS lost_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  item_type VARCHAR(100) NOT NULL,
  item_description TEXT NOT NULL,
  lost_date DATETIME NOT NULL,
  lost_location VARCHAR(255) NOT NULL,
  contact_number VARCHAR(20),
  status ENUM('reported', 'found', 'closed') DEFAULT 'reported',
  certificate_generated BOOLEAN DEFAULT FALSE,
  certificate_path VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- 6. MISSING PERSONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS missing_persons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reported_by INT,
  person_name VARCHAR(100) NOT NULL,
  person_age INT,
  person_gender ENUM('male', 'female', 'other'),
  person_photo VARCHAR(255) NULL,
  last_seen_date DATETIME,
  last_seen_location VARCHAR(255),
  physical_description TEXT,
  contact_number VARCHAR(20),
  status ENUM('missing', 'found', 'closed') DEFAULT 'missing',
  matched_with INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (matched_with) REFERENCES missing_persons(id) ON DELETE SET NULL
);

-- ============================================
-- 7. MISSING VEHICLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS missing_vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reported_by INT,
  vehicle_number VARCHAR(50) NOT NULL,
  vehicle_type VARCHAR(50),
  vehicle_color VARCHAR(50),
  vehicle_brand VARCHAR(100),
  vehicle_model VARCHAR(100),
  last_seen_date DATETIME,
  last_seen_location VARCHAR(255),
  description TEXT,
  status ENUM('missing', 'found', 'closed') DEFAULT 'missing',
  matched_with INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (matched_with) REFERENCES missing_vehicles(id) ON DELETE SET NULL
);

-- ============================================
-- 8. POLICE CLEARANCE CERTIFICATE (PCC)
-- ============================================
CREATE TABLE IF NOT EXISTS pcc_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  application_number VARCHAR(50) UNIQUE,
  purpose VARCHAR(255) NOT NULL,
  nid_number VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  status ENUM('pending', 'under_review', 'approved', 'rejected') DEFAULT 'pending',
  certificate_path VARCHAR(255) NULL,
  reviewed_by INT NULL,
  reviewed_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- 9. CRIME DATA FOR RISK MAP
-- ============================================
CREATE TABLE IF NOT EXISTS crime_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  crime_type VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  incident_date DATETIME NOT NULL,
  severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 10. POLICE PATROLLING DATA
-- ============================================
CREATE TABLE IF NOT EXISTS patrolling_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  area_name VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  patrol_intensity INT DEFAULT 1 COMMENT '1-10 scale',
  officer_count INT DEFAULT 1,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 11. SOS EMERGENCY ALERTS
-- ============================================
CREATE TABLE IF NOT EXISTS sos_alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  alert_type ENUM('women_safety', 'child_safety', 'general_emergency') NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  nearest_station_id INT NULL,
  message TEXT,
  status ENUM('active', 'responded', 'resolved') DEFAULT 'active',
  responded_at DATETIME NULL,
  resolved_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- 12. POLICE STATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS police_stations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  station_name VARCHAR(100) NOT NULL,
  station_code VARCHAR(20) UNIQUE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  contact_number VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 13. CRIMINAL DATABASE
-- ============================================
CREATE TABLE IF NOT EXISTS criminals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  nid VARCHAR(20) UNIQUE,
  face_id VARCHAR(255) NULL COMMENT 'Face recognition ID or hash',
  photo_path VARCHAR(255) NULL,
  date_of_birth DATE,
  gender ENUM('male', 'female', 'other'),
  address TEXT,
  crime_records TEXT,
  status ENUM('wanted', 'arrested', 'released') DEFAULT 'wanted',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 14. FACE RECOGNITION MATCHES
-- ============================================
CREATE TABLE IF NOT EXISTS face_recognition_matches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  criminal_id INT,
  match_confidence DECIMAL(5, 2) COMMENT '0-100 percentage',
  detected_location VARCHAR(255),
  detected_latitude DECIMAL(10, 8),
  detected_longitude DECIMAL(11, 8),
  detected_at DATETIME NOT NULL,
  alert_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (criminal_id) REFERENCES criminals(id) ON DELETE CASCADE
);

-- ============================================
-- 15. CHATBOT CONVERSATIONS (Cyberbullying Assistant)
-- ============================================
CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  intent VARCHAR(50) COMMENT 'detected intent: harassment, cyberbullying, etc.',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- 16. CRIME PATTERN PREDICTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS crime_predictions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  area_name VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  predicted_crime_type VARCHAR(100),
  risk_level ENUM('low', 'medium', 'high', 'critical') NOT NULL,
  confidence_score DECIMAL(5, 2) COMMENT '0-100 percentage',
  prediction_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_traffic_fines_user ON traffic_fines(user_id);
CREATE INDEX idx_traffic_fines_status ON traffic_fines(status);
CREATE INDEX idx_crime_reports_user ON crime_reports(user_id);
CREATE INDEX idx_crime_reports_status ON crime_reports(status);
CREATE INDEX idx_missing_persons_status ON missing_persons(status);
CREATE INDEX idx_missing_vehicles_status ON missing_vehicles(status);
CREATE INDEX idx_criminals_nid ON criminals(nid);
CREATE INDEX idx_criminals_status ON criminals(status);
CREATE INDEX idx_crime_data_location ON crime_data(latitude, longitude);
CREATE INDEX idx_sos_alerts_status ON sos_alerts(status);
CREATE INDEX idx_sos_alerts_location ON sos_alerts(latitude, longitude);
