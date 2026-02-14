// Test database connection
// Run with: node test-db.js

import db from './db.js';

console.log('Testing database connection...');

// Test query
db.query('SELECT 1 as test', (err, results) => {
  if (err) {
    console.error('❌ Database test failed:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Database connection successful!');
    console.log('Test result:', results);
    
    // Check if users table exists
    db.query("SHOW TABLES LIKE 'users'", (err, results) => {
      if (err) {
        console.error('❌ Error checking tables:', err.message);
      } else if (results.length === 0) {
        console.log('⚠️  Users table does not exist. Please run database/schema.sql');
      } else {
        console.log('✅ Users table exists');
        
        // Check table structure
        db.query("DESCRIBE users", (err, results) => {
          if (err) {
            console.error('❌ Error describing table:', err.message);
          } else {
            console.log('✅ Users table structure:');
            console.table(results);
          }
          db.end();
        });
      }
    });
  }
});
