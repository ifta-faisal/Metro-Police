-- Add area_name column to crime_data table if it doesn't exist
-- This script updates the crime_data table to support area-based analytics

USE metropolice;

-- Check and add area_name column if it doesn't exist
SET @dbname = DATABASE();
SET @tablename = 'crime_data';
SET @columnname = 'area_name';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(100) NULL AFTER description')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Update existing records to have area names based on description or set to default
UPDATE crime_data 
SET area_name = CASE 
  WHEN description IS NOT NULL AND description != '' THEN SUBSTRING_INDEX(description, ',', 1)
  ELSE 'Unknown'
END
WHERE area_name IS NULL OR area_name = '';

-- Insert dummy crime data for analytics
-- Using INSERT IGNORE to avoid errors if records already exist
INSERT IGNORE INTO crime_data (crime_type, latitude, longitude, incident_date, severity, description, area_name)
VALUES
  ('theft', 23.8103, 90.4125, DATE_SUB(NOW(), INTERVAL 1 DAY), 'medium', 'Theft at market area', 'Gulshan'),
  ('assault', 23.7500, 90.4000, DATE_SUB(NOW(), INTERVAL 2 DAY), 'high', 'Assault incident', 'Dhanmondi'),
  ('theft', 23.8103, 90.4125, DATE_SUB(NOW(), INTERVAL 3 DAY), 'medium', 'Pickpocket incident', 'Gulshan'),
  ('vandalism', 23.7500, 90.4000, DATE_SUB(NOW(), INTERVAL 4 DAY), 'low', 'Property damage', 'Dhanmondi'),
  ('fraud', 23.7000, 90.3500, DATE_SUB(NOW(), INTERVAL 5 DAY), 'high', 'Online fraud case', 'Mirpur'),
  ('theft', 23.8103, 90.4125, DATE_SUB(NOW(), INTERVAL 7 DAY), 'medium', 'Vehicle theft', 'Gulshan'),
  ('assault', 23.7500, 90.4000, DATE_SUB(NOW(), INTERVAL 10 DAY), 'critical', 'Serious assault', 'Dhanmondi'),
  ('theft', 23.7000, 90.3500, DATE_SUB(NOW(), INTERVAL 15 DAY), 'medium', 'Shop theft', 'Mirpur'),
  ('vandalism', 23.8103, 90.4125, DATE_SUB(NOW(), INTERVAL 20 DAY), 'low', 'Graffiti', 'Gulshan'),
  ('fraud', 23.7500, 90.4000, DATE_SUB(NOW(), INTERVAL 25 DAY), 'high', 'Credit card fraud', 'Dhanmondi'),
  ('theft', 23.7000, 90.3500, DATE_SUB(NOW(), INTERVAL 30 DAY), 'medium', 'Bike theft', 'Mirpur'),
  ('assault', 23.8103, 90.4125, DATE_SUB(NOW(), INTERVAL 35 DAY), 'high', 'Street fight', 'Gulshan'),
  ('theft', 23.7500, 90.4000, DATE_SUB(NOW(), INTERVAL 40 DAY), 'medium', 'Home burglary', 'Dhanmondi'),
  ('vandalism', 23.7000, 90.3500, DATE_SUB(NOW(), INTERVAL 45 DAY), 'low', 'Window breaking', 'Mirpur'),
  ('fraud', 23.8103, 90.4125, DATE_SUB(NOW(), INTERVAL 50 DAY), 'critical', 'Major fraud case', 'Gulshan'),
  ('theft', 23.7500, 90.4000, DATE_SUB(NOW(), INTERVAL 60 DAY), 'medium', 'Bag snatching', 'Dhanmondi'),
  ('assault', 23.7000, 90.3500, DATE_SUB(NOW(), INTERVAL 70 DAY), 'high', 'Domestic violence', 'Mirpur'),
  ('theft', 23.8103, 90.4125, DATE_SUB(NOW(), INTERVAL 80 DAY), 'medium', 'Phone theft', 'Gulshan'),
  ('vandalism', 23.7500, 90.4000, DATE_SUB(NOW(), INTERVAL 90 DAY), 'low', 'Property damage', 'Dhanmondi'),
  ('fraud', 23.7000, 90.3500, DATE_SUB(NOW(), INTERVAL 100 DAY), 'high', 'Identity theft', 'Mirpur'),
  ('theft', 23.8103, 90.4125, DATE_SUB(NOW(), INTERVAL 110 DAY), 'medium', 'Jewelry theft', 'Gulshan'),
  ('assault', 23.7500, 90.4000, DATE_SUB(NOW(), INTERVAL 120 DAY), 'critical', 'Severe assault', 'Dhanmondi'),
  ('theft', 23.7000, 90.3500, DATE_SUB(NOW(), INTERVAL 130 DAY), 'medium', 'Car break-in', 'Mirpur'),
  ('vandalism', 23.8103, 90.4125, DATE_SUB(NOW(), INTERVAL 140 DAY), 'low', 'Street vandalism', 'Gulshan'),
  ('fraud', 23.7500, 90.4000, DATE_SUB(NOW(), INTERVAL 150 DAY), 'high', 'Bank fraud', 'Dhanmondi'),
  ('theft', 23.7000, 90.3500, DATE_SUB(NOW(), INTERVAL 160 DAY), 'medium', 'Laptop theft', 'Mirpur'),
  ('assault', 23.8103, 90.4125, DATE_SUB(NOW(), INTERVAL 170 DAY), 'high', 'Bar fight', 'Gulshan'),
  ('theft', 23.7500, 90.4000, DATE_SUB(NOW(), INTERVAL 180 DAY), 'medium', 'Wallet theft', 'Dhanmondi'),
  ('vandalism', 23.7000, 90.3500, DATE_SUB(NOW(), INTERVAL 190 DAY), 'low', 'Tagging', 'Mirpur'),
  ('fraud', 23.8103, 90.4125, DATE_SUB(NOW(), INTERVAL 200 DAY), 'critical', 'Investment fraud', 'Gulshan'),
  ('theft', 23.7500, 90.4000, DATE_SUB(NOW(), INTERVAL 210 DAY), 'medium', 'Watch theft', 'Dhanmondi'),
  ('assault', 23.7000, 90.3500, DATE_SUB(NOW(), INTERVAL 220 DAY), 'high', 'Public disturbance', 'Mirpur'),
  ('theft', 23.8103, 90.4125, DATE_SUB(NOW(), INTERVAL 240 DAY), 'medium', 'Cycle theft', 'Gulshan'),
  ('vandalism', 23.7500, 90.4000, DATE_SUB(NOW(), INTERVAL 260 DAY), 'low', 'Wall damage', 'Dhanmondi'),
  ('fraud', 23.7000, 90.3500, DATE_SUB(NOW(), INTERVAL 280 DAY), 'high', 'Email scam', 'Mirpur'),
  ('theft', 23.8103, 90.4125, DATE_SUB(NOW(), INTERVAL 300 DAY), 'medium', 'Camera theft', 'Gulshan'),
  ('assault', 23.7500, 90.4000, DATE_SUB(NOW(), INTERVAL 330 DAY), 'critical', 'Gang assault', 'Dhanmondi'),
  ('theft', 23.7000, 90.3500, DATE_SUB(NOW(), INTERVAL 360 DAY), 'medium', 'Accessory theft', 'Mirpur');

-- Create index on area_name for better performance (if it doesn't exist)
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_name = 'crime_data')
      AND (table_schema = DATABASE())
      AND (index_name = 'idx_crime_data_area')
  ) > 0,
  'SELECT 1',
  'CREATE INDEX idx_crime_data_area ON crime_data(area_name)'
));
PREPARE createIndexIfNotExists FROM @preparedStatement;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;
