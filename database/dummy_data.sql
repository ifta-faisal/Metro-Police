-- Dummy Data for Metro Police Database
-- Run this after schema.sql

USE metropolice;

-- ============================================
-- 1. USERS (Including Admin)
-- ============================================
INSERT INTO users (name, email, password, role, phone, nid, address) VALUES
('Admin User', 'admin@metropolice.gov.bd', '$2b$10$rQ8K8K8K8K8K8K8K8K8K8O8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', 'admin', '01712345678', '1234567890123', 'Dhaka, Bangladesh'),
('John Doe', 'john@example.com', '$2b$10$rQ8K8K8K8K8K8K8K8K8K8O8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', 'citizen', '01712345679', '1234567890124', 'Gulshan, Dhaka'),
('Jane Smith', 'jane@example.com', '$2b$10$rQ8K8K8K8K8K8K8K8K8K8O8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', 'citizen', '01712345680', '1234567890125', 'Dhanmondi, Dhaka'),
('Officer Ahmed', 'officer@metropolice.gov.bd', '$2b$10$rQ8K8K8K8K8K8K8K8K8K8O8K8K8K8K8K8K8K8K8K8K8K8K8K8K', 'officer', '01712345681', '1234567890126', 'Police Station, Dhaka');

-- ============================================
-- 2. TRAFFIC FINES
-- ============================================
INSERT INTO traffic_fines (user_id, vehicle_number, violation_type, violation_location, fine_amount, violation_date, status) VALUES
(2, 'DHAKA-12345', 'Speeding', 'Gulshan-2, Dhaka', 500.00, '2024-01-15 10:30:00', 'pending'),
(2, 'DHAKA-12345', 'Parking Violation', 'Banani, Dhaka', 200.00, '2024-01-20 14:20:00', 'paid'),
(3, 'DHAKA-67890', 'Red Light Violation', 'Dhanmondi, Dhaka', 1000.00, '2024-01-25 09:15:00', 'pending'),
(2, 'DHAKA-12345', 'No Helmet', 'Uttara, Dhaka', 300.00, '2024-02-01 16:45:00', 'paid');

-- ============================================
-- 3. CRIME REPORTS (GD)
-- ============================================
INSERT INTO crime_reports (gd_number, user_id, report_type, incident_date, incident_location, description, status) VALUES
('GD-2024-001', 2, 'theft', '2024-01-10 20:00:00', 'Gulshan-1, Dhaka', 'Mobile phone stolen from car', 'under_investigation'),
('GD-2024-002', 3, 'fraud', '2024-01-12 15:30:00', 'Dhanmondi, Dhaka', 'Online payment fraud', 'pending'),
('GD-2024-003', 2, 'vandalism', '2024-01-18 22:00:00', 'Banani, Dhaka', 'Car window broken', 'resolved'),
('GD-2024-004', 3, 'assault', '2024-01-22 18:00:00', 'Mohakhali, Dhaka', 'Physical assault incident', 'under_investigation');

-- ============================================
-- 4. LOST ITEMS
-- ============================================
INSERT INTO lost_items (user_id, item_type, item_description, lost_date, lost_location, contact_number, status) VALUES
(2, 'Mobile Phone', 'iPhone 13 Pro, Black color, with case', '2024-01-08 14:00:00', 'Gulshan-2 Market', '01712345679', 'reported'),
(3, 'Wallet', 'Brown leather wallet with ID and cards', '2024-01-14 10:30:00', 'Dhanmondi Lake', '01712345680', 'found'),
(2, 'Keys', 'House keys with keychain', '2024-01-20 19:00:00', 'Uttara Sector 7', '01712345679', 'reported');

-- ============================================
-- 5. MISSING PERSONS
-- ============================================
INSERT INTO missing_persons (reported_by, person_name, person_age, person_gender, last_seen_date, last_seen_location, physical_description, contact_number, status) VALUES
(2, 'Rahman Ali', 25, 'male', '2024-01-05 16:00:00', 'Gulshan-1, Dhaka', 'Height: 5\'8", Brown hair, Wearing blue shirt', '01712345679', 'missing'),
(3, 'Fatima Begum', 30, 'female', '2024-01-11 12:00:00', 'Dhanmondi, Dhaka', 'Height: 5\'4", Black hair, Wearing red saree', '01712345680', 'missing'),
(2, 'Karim Hossain', 18, 'male', '2024-01-19 20:00:00', 'Banani, Dhaka', 'Height: 5\'6", Short hair, Wearing jeans and t-shirt', '01712345679', 'found');

-- ============================================
-- 6. MISSING VEHICLES
-- ============================================
INSERT INTO missing_vehicles (reported_by, vehicle_number, vehicle_type, vehicle_color, vehicle_brand, vehicle_model, last_seen_date, last_seen_location, description, status) VALUES
(2, 'DHAKA-ABC123', 'Motorcycle', 'Red', 'Honda', 'CBR 150', '2024-01-07 18:00:00', 'Gulshan-2, Dhaka', 'Red Honda motorcycle with custom stickers', 'missing'),
(3, 'DHAKA-XYZ789', 'Car', 'White', 'Toyota', 'Corolla', '2024-01-13 15:00:00', 'Dhanmondi, Dhaka', 'White Toyota Corolla with tinted windows', 'missing'),
(2, 'DHAKA-DEF456', 'Motorcycle', 'Black', 'Yamaha', 'FZ', '2024-01-21 10:00:00', 'Uttara, Dhaka', 'Black Yamaha FZ with side mirrors', 'found');

-- ============================================
-- 7. PCC APPLICATIONS
-- ============================================
INSERT INTO pcc_applications (user_id, application_number, purpose, nid_number, address, status) VALUES
(2, 'PCC-2024-001', 'Job Application', '1234567890124', 'Gulshan, Dhaka', 'approved'),
(3, 'PCC-2024-002', 'Visa Application', '1234567890125', 'Dhanmondi, Dhaka', 'under_review'),
(2, 'PCC-2024-003', 'University Admission', '1234567890124', 'Gulshan, Dhaka', 'pending');

-- ============================================
-- 8. POLICE STATIONS
-- ============================================
INSERT INTO police_stations (station_name, station_code, latitude, longitude, contact_number, address) VALUES
('Gulshan Police Station', 'PS-GUL', 23.7944, 90.4144, '01712345690', 'Gulshan-1, Dhaka'),
('Dhanmondi Police Station', 'PS-DHA', 23.7465, 90.3760, '01712345691', 'Dhanmondi, Dhaka'),
('Uttara Police Station', 'PS-UTT', 23.8759, 90.3795, '01712345692', 'Uttara, Dhaka'),
('Banani Police Station', 'PS-BAN', 23.7944, 90.4044, '01712345693', 'Banani, Dhaka'),
('Mohakhali Police Station', 'PS-MOH', 23.7772, 90.4053, '01712345694', 'Mohakhali, Dhaka');

-- ============================================
-- 9. CRIME DATA (For Risk Map)
-- ============================================
INSERT INTO crime_data (crime_type, latitude, longitude, incident_date, severity, description) VALUES
('theft', 23.7944, 90.4144, '2024-01-15 20:00:00', 'medium', 'Mobile phone theft'),
('assault', 23.7465, 90.3760, '2024-01-16 18:30:00', 'high', 'Physical assault'),
('fraud', 23.8759, 90.3795, '2024-01-17 14:00:00', 'medium', 'Online fraud'),
('vandalism', 23.7944, 90.4044, '2024-01-18 22:00:00', 'low', 'Property damage'),
('theft', 23.7772, 90.4053, '2024-01-19 16:00:00', 'medium', 'Vehicle break-in'),
('assault', 23.7944, 90.4144, '2024-01-20 19:00:00', 'high', 'Street fight'),
('fraud', 23.7465, 90.3760, '2024-01-21 11:00:00', 'medium', 'Credit card fraud'),
('theft', 23.8759, 90.3795, '2024-01-22 21:00:00', 'medium', 'Bike theft'),
('vandalism', 23.7944, 90.4044, '2024-01-23 23:00:00', 'low', 'Graffiti'),
('assault', 23.7772, 90.4053, '2024-01-24 17:00:00', 'critical', 'Serious assault');

-- ============================================
-- 10. PATROLLING DATA
-- ============================================
INSERT INTO patrolling_data (area_name, latitude, longitude, patrol_intensity, officer_count) VALUES
('Gulshan', 23.7944, 90.4144, 8, 5),
('Dhanmondi', 23.7465, 90.3760, 7, 4),
('Uttara', 23.8759, 90.3795, 6, 3),
('Banani', 23.7944, 90.4044, 9, 6),
('Mohakhali', 23.7772, 90.4053, 5, 2);

-- ============================================
-- 11. CRIMINALS DATABASE
-- ============================================
INSERT INTO criminals (name, nid, date_of_birth, gender, address, crime_records, status) VALUES
('Badal Rahman', '9876543210123', '1990-05-15', 'male', 'Old Dhaka', 'Theft, Assault, Fraud', 'wanted'),
('Rokeya Begum', '9876543210124', '1985-08-20', 'female', 'Narayanganj', 'Fraud, Cybercrime', 'wanted'),
('Shamim Hossain', '9876543210125', '1992-11-10', 'male', 'Gazipur', 'Theft, Vandalism', 'arrested'),
('Nazma Akter', '9876543210126', '1988-03-25', 'female', 'Savar', 'Fraud', 'wanted'),
('Karim Uddin', '9876543210127', '1995-07-30', 'male', 'Dhaka', 'Assault, Theft', 'arrested');

-- ============================================
-- 12. CRIME PREDICTIONS
-- ============================================
INSERT INTO crime_predictions (area_name, latitude, longitude, predicted_crime_type, risk_level, confidence_score, prediction_date) VALUES
('Gulshan', 23.7944, 90.4144, 'theft', 'high', 75.5, '2024-02-01'),
('Dhanmondi', 23.7465, 90.3760, 'assault', 'medium', 65.0, '2024-02-01'),
('Uttara', 23.8759, 90.3795, 'fraud', 'medium', 60.5, '2024-02-01'),
('Banani', 23.7944, 90.4044, 'vandalism', 'low', 45.0, '2024-02-01'),
('Mohakhali', 23.7772, 90.4053, 'theft', 'high', 80.0, '2024-02-01');
